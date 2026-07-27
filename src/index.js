const { PrestamoService } = require('./PrestamoService');
const { CatalogoService } = require('./CatalogoService');

/**
 * Punto de entrada demo — no es un servidor HTTP completo.
 * Endpoints conceptuales documentados en docs/:
 *   POST /prestamos
 *   POST /prestamos/:id/devolver
 *   POST /prestamos/:id/renovar
 *   GET  /prestamos/activos
 */
function crearAppDemo() {
  const catalogo = new CatalogoService({
    'ISBN-1001': 2,
    'ISBN-1002': 1,
    'ISBN-1003': 0,
  });
  const prestamos = new PrestamoService(catalogo);
  return { catalogo, prestamos };
}

if (require.main === module) {
  const { prestamos } = crearAppDemo();
  const p = prestamos.prestar('ISBN-1001', 'user-42');
  console.log('ShelfWise demo — préstamo creado:', p.id);
  console.log('Vence:', p.vencimiento);
}

module.exports = { crearAppDemo };
