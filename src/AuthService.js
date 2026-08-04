/**
 * AuthService v2.1 — contraseñas con bcrypt (salt rounds = 12).
 * Corrige la comparación en texto plano de v2.0.
 */
const bcrypt = require('bcrypt');

const BCRYPT_ROUNDS = 12;

class AuthService {
  constructor(usuarios = []) {
    /** @type {Array<{ id: string, email: string, passwordHash: string, telefono?: string }>} */
    this.usuarios = usuarios;
  }

  /**
   * Registro / alta: genera hash (no guarda texto plano).
   * @param {string} password
   * @returns {Promise<string>}
   */
  static async hashPassword(password) {
    return bcrypt.hash(password, BCRYPT_ROUNDS);
  }

  /**
   * @param {string} email
   * @param {string} password
   * @returns {Promise<{ token: string, userId: string }>}
   */
  async login(email, password) {
    const usuario = this.usuarios.find((u) => u.email === email);
    if (!usuario || !usuario.passwordHash) {
      const err = new Error('Credenciales inválidas');
      err.status = 401;
      throw err;
    }

    const ok = await bcrypt.compare(password, usuario.passwordHash);
    if (!ok) {
      const err = new Error('Credenciales inválidas');
      err.status = 401;
      throw err;
    }

    return {
      token: `tok_${usuario.id}_${Date.now()}`,
      userId: usuario.id,
    };
  }
}

module.exports = { AuthService, BCRYPT_ROUNDS };
