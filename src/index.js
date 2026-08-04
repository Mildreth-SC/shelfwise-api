const { PrestamoService } = require('./PrestamoService');
const { CatalogoService } = require('./CatalogoService');
const { AuthService } = require('./AuthService');

function crearAppDemo(usuariosAuth) {
  const catalogo = new CatalogoService({
    'ISBN-1001': 2,
    'ISBN-1002': 1,
    'ISBN-1003': 0,
  });
  const prestamos = new PrestamoService(catalogo);
  const auth = new AuthService(usuariosAuth || []);
  return { catalogo, prestamos, auth };
}

if (require.main === module) {
  (async () => {
    const passwordHash = await AuthService.hashPassword('Cafe#Seguro9xQ');
    const { prestamos, auth } = crearAppDemo([
      { id: 'u1', email: 'ana@shelfwise.dev', passwordHash, telefono: '+593900000001' },
    ]);
    const p = prestamos.prestar('ISBN-1001', 'user-42');
    console.log('ShelfWise demo — préstamo:', p.id);
    const session = await auth.login('ana@shelfwise.dev', 'Cafe#Seguro9xQ');
    console.log('Auth demo — login OK:', session.userId);
  })().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}

module.exports = { crearAppDemo };
