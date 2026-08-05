/**
 * AuthService v2.2 — bcrypt + bloqueo tras intentos fallidos (anti fuerza bruta).
 */
const bcrypt = require('bcrypt');

const BCRYPT_ROUNDS = 12;
const MAX_INTENTOS_FALLIDOS = 5;
const TIEMPO_BLOQUEO_MIN = 15;

class AuthService {
  constructor(usuarios = []) {
    this.usuarios = usuarios.map((u) => ({
      intentosFallidos: 0,
      bloqueadoHasta: null,
      ...u,
    }));
  }

  static async hashPassword(password) {
    return bcrypt.hash(password, BCRYPT_ROUNDS);
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

    return {
      token: `tok_${usuario.id}_${Date.now()}`,
      userId: usuario.id,
    };
  }
}

module.exports = { AuthService, BCRYPT_ROUNDS, MAX_INTENTOS_FALLIDOS, TIEMPO_BLOQUEO_MIN };
