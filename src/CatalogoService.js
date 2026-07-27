/**
 * ShelfWise — catálogo ficticio (disponibilidad de ejemplares)
 */

class CatalogoService {
  constructor(inicial = {}) {
    // libroId -> cantidad disponible
    this.stock = new Map(Object.entries(inicial));
  }

  asegurarLibro(libroId, cantidad = 1) {
    if (!this.stock.has(libroId)) this.stock.set(libroId, cantidad);
  }

  estaDisponible(libroId) {
    const n = this.stock.get(libroId) ?? 0;
    return n > 0;
  }

  marcarPrestado(libroId) {
    const n = this.stock.get(libroId) ?? 0;
    if (n <= 0) throw new Error(`Sin stock para ${libroId}`);
    this.stock.set(libroId, n - 1);
  }

  marcarDisponible(libroId) {
    const n = this.stock.get(libroId) ?? 0;
    this.stock.set(libroId, n + 1);
  }

  stockDe(libroId) {
    return this.stock.get(libroId) ?? 0;
  }
}

module.exports = { CatalogoService };
