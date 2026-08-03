/**
 * AuthService v2.0 — login básico (usuario + contraseña).
 * ⚠ Compara contraseñas en TEXTO PLANO (vulnerabilidad intencional del ejemplo;
 * se corrige en v2.1 con bcrypt).
 *
 * Endpoint conceptual: POST /auth/login { email, password } → { token }
 */
class AuthService {
  constructor(usuarios = []) {
    /** @type {Array<{ id: string, email: string, passwordPlano: string, telefono?: string }>} */
    this.usuarios = usuarios;
  }

  /**
   * @param {string} email
   * @param {string} password
   * @returns {{ token: string, userId: string }}
   */
  login(email, password) {
    const usuario = this.usuarios.find((u) => u.email === email);
    if (!usuario) {
      const err = new Error('Credenciales inválidas');
      err.status = 401;
      throw err;
    }

    // Vulnerabilidad conocida (v2.0): comparación en texto plano
    if (password !== usuario.passwordPlano) {
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

module.exports = { AuthService };
