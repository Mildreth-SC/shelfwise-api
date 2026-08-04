/**
 * Migración one-time v2.0 → v2.1:
 * convierte passwordPlano a passwordHash con bcrypt y elimina el campo plano.
 *
 * Uso (ejemplo):
 *   node scripts/migrarPasswords.js
 */
const bcrypt = require('bcrypt');
const { BCRYPT_ROUNDS } = require('../src/AuthService');

/**
 * @param {Array<{ id: string, email: string, passwordPlano?: string, passwordHash?: string }>} usuarios
 */
async function migrarPasswords(usuarios) {
  const resultado = [];
  for (const u of usuarios) {
    if (u.passwordHash) {
      resultado.push({ ...u });
      continue;
    }
    if (!u.passwordPlano) {
      throw new Error(`Usuario ${u.id} sin passwordPlano ni passwordHash`);
    }
    const passwordHash = await bcrypt.hash(u.passwordPlano, BCRYPT_ROUNDS);
    const { passwordPlano, ...rest } = u;
    resultado.push({ ...rest, passwordHash });
  }
  return resultado;
}

if (require.main === module) {
  (async () => {
    const demo = [
      { id: 'u1', email: 'ana@shelfwise.dev', passwordPlano: 'demo123', telefono: '+593900000001' },
    ];
    const migrados = await migrarPasswords(demo);
    console.log('Migración OK. Usuarios con hash:', migrados.map((u) => ({ id: u.id, hasHash: !!u.passwordHash })));
  })().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}

module.exports = { migrarPasswords };
