const { PrestamoService } = require('./PrestamoService');
const { CatalogoService } = require('./CatalogoService');
const { AuthService } = require('./AuthService');

/**
 * Punto de entrada demo — préstamos + autenticación.
 * Auth: POST /auth/login  |  POST /auth/login/verify-2fa (desde v2.3)
 */
function crearAppDemo() {
  const catalogo = new CatalogoService({
    'ISBN-1001': 2,
    'ISBN-1002': 1,
    'ISBN-1003': 0,
  });
  const prestamos = new PrestamoService(catalogo);
  const auth = new AuthService([
    { id: 'u1', email: 'ana@shelfwise.dev', passwordPlano: 'demo123', telefono: '+593900000001' },
  ]);
  return { catalogo, prestamos, auth };
}

if (require.main === module) {
  const { prestamos, auth } = crearAppDemo();
  const p = prestamos.prestar('ISBN-1001', 'user-42');
  console.log('ShelfWise demo — préstamo creado:', p.id);
  try {
    const session = auth.login('ana@shelfwise.dev', 'demo123');
    console.log('Auth demo — login OK:', session.userId);
  } catch (e) {
    console.log('Auth demo —', e.message);
  }
}

module.exports = { crearAppDemo };
