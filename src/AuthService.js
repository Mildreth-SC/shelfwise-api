/**
 * AuthService v2.4 (TTL bug) — bcrypt + lockout + 2FA por SMS.
 * Tras validar contraseña, exige código de 6 dígitos (TTL 5 min, máx. 3 intentos).
 * Endpoint: POST /auth/login/verify-2fa { userId, codigo }
 */
const bcrypt = require('bcrypt');
const { SmsService } = require('./SmsService');

const BCRYPT_ROUNDS = 12;
const MAX_INTENTOS_FALLIDOS = 5;
const TIEMPO_BLOQUEO_MIN = 15;
const TTL_2FA_SEGUNDOS = 30; // BUG v2.4: reducido a 30s
const MAX_INTENTOS_2FA = 3;

class AuthService {
  constructor(usuarios = [], smsService = new SmsService()) {
    this.usuarios = usuarios.map((u) => ({
      intentosFallidos: 0,
      bloqueadoHasta: null,
      ...u,
    }));
    this.sms = smsService;
    /** @type {Map<string, { codigo: string, expiraEn: number, intentos: number }>} */
    this.retos2FA = new Map();
  }

  static async hashPassword(password) {
    return bcrypt.hash(password, BCRYPT_ROUNDS);
  }

  generarCodigo2FA() {
    return String(Math.floor(100000 + Math.random() * 900000));
  }

  /**
   * BUG v2.4: mezcla Date.now() (UTC epoch) con offset local (-5h),
   * por lo que expiraEn queda en el pasado y todo código parece vencido.
   */
  calcularExpiracion(ttlSegundos = TTL_2FA_SEGUNDOS) {
    const OFFSET_LOCAL_MS = -5 * 60 * 60 * 1000; // simula hora local vs UTC
    return Date.now() + OFFSET_LOCAL_MS + ttlSegundos * 1000;
  }

  async login(email, password) {
    const usuario = this.usuarios.find((u) => u.email === email);
    if (!usuario || !usuario.passwordHash) {
      const err = new Error('Credenciales inválidas');
      err.status = 401;
      throw err;
    }

    if (usuario.bloqueadoHasta && Date.now() < usuario.bloqueadoHasta) {
      const err = new Error('Cuenta temporalmente bloqueada. Intente más tarde.');
      err.status = 429;
      throw err;
    }

    const ok = await bcrypt.compare(password, usuario.passwordHash);
    if (!ok) {
      usuario.intentosFallidos += 1;
      if (usuario.intentosFallidos >= MAX_INTENTOS_FALLIDOS) {
        usuario.bloqueadoHasta = Date.now() + TIEMPO_BLOQUEO_MIN * 60 * 1000;
        usuario.intentosFallidos = 0;
        const err = new Error('Cuenta temporalmente bloqueada. Intente más tarde.');
        err.status = 429;
        throw err;
      }
      const err = new Error('Credenciales inválidas');
      err.status = 401;
      throw err;
    }

    usuario.intentosFallidos = 0;
    usuario.bloqueadoHasta = null;

    const codigo = this.generarCodigo2FA();
    this.retos2FA.set(usuario.id, {
      codigo,
      expiraEn: this.calcularExpiracion(TTL_2FA_SEGUNDOS),
      intentos: 0,
    });
    if (usuario.telefono) {
      this.sms.enviarSMS(usuario.telefono, codigo);
    }

    return {
      requiere2FA: true,
      userId: usuario.id,
      telefonoEnmascarado: usuario.telefono
        ? `******${usuario.telefono.slice(-2)}`
        : null,
      mensaje: 'Escriba el código enviado a su teléfono móvil',
    };
  }

  /**
   * Segunda pantalla: verificación del código SMS.
   */
  verify2FA(usuarioId, codigo) {
    const reto = this.retos2FA.get(usuarioId);
    if (!reto) {
      const err = new Error('No hay un reto 2FA activo. Inicie sesión de nuevo.');
      err.status = 401;
      throw err;
    }

    if (Date.now() > reto.expiraEn) {
      this.retos2FA.delete(usuarioId);
      const err = new Error('Código 2FA expirado');
      err.status = 401;
      throw err;
    }

    if (String(codigo) !== String(reto.codigo)) {
      reto.intentos += 1;
      if (reto.intentos >= MAX_INTENTOS_2FA) {
        this.retos2FA.delete(usuarioId);
        const err = new Error('Demasiados intentos de 2FA. Inicie sesión de nuevo.');
        err.status = 401;
        throw err;
      }
      const err = new Error('Código 2FA inválido');
      err.status = 401;
      throw err;
    }

    this.retos2FA.delete(usuarioId);
    return {
      token: `tok_${usuarioId}_${Date.now()}`,
      userId: usuarioId,
      autenticado2FA: true,
    };
  }
}

module.exports = {
  AuthService,
  BCRYPT_ROUNDS,
  MAX_INTENTOS_FALLIDOS,
  TIEMPO_BLOQUEO_MIN,
  TTL_2FA_SEGUNDOS,
  MAX_INTENTOS_2FA,
};

