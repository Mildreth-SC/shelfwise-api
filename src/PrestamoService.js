/**
 * ShelfWise — módulo de préstamos de biblioteca (ejemplo ficticio)
 *
 * Evolución:
 *   v1.0 — crear préstamo + calcular fecha de devolución
 *   v1.1 — validar disponibilidad antes de prestar
 *   v1.2 — corrección: recálculo de mora al devolver
 *   v1.3 — renovaciones con cupo máximo
 *   v1.4 — caché de mora + tests
 */

const { CatalogoService } = require('./CatalogoService');

const DIAS_PRESTAMO = 14;
const MULTA_POR_DIA = 0.5;
const MAX_RENOVACIONES = 2;

class PrestamoService {
  constructor(catalogo = new CatalogoService()) {
    this.catalogo = catalogo;
    this.prestamos = new Map();
    this._cacheMora = new Map();
  }

  /**
   * v1.0 — crea un préstamo y calcula fecha de devolución.
   * v1.1 — valida stock/disponibilidad antes de prestar.
   */
  prestar(libroId, usuarioId, fechaInicio = new Date()) {
    if (!libroId || !usuarioId) {
      throw new Error('libroId y usuarioId son obligatorios');
    }

    const disponible = this.catalogo.estaDisponible(libroId);
    if (!disponible) {
      throw new Error(`Libro ${libroId} no disponible (evita overbooking)`);
    }

    const inicio = new Date(fechaInicio);
    const vencimiento = this.calcularFechaDevolucion(inicio);
    const id = `${libroId}-${usuarioId}-${inicio.getTime()}`;

    const prestamo = {
      id,
      libroId,
      usuarioId,
      inicio: inicio.toISOString(),
      vencimiento: vencimiento.toISOString(),
      renovaciones: 0,
      estado: 'activo',
      devueltoEn: null,
    };

    this.prestamos.set(id, prestamo);
    this.catalogo.marcarPrestado(libroId);
    this._cacheMora.delete(id);
    return prestamo;
  }

  calcularFechaDevolucion(fechaInicio = new Date()) {
    const d = new Date(fechaInicio);
    d.setDate(d.getDate() + DIAS_PRESTAMO);
    return d;
  }

  /**
   * v1.2 — al devolver, recalcula mora y libera el ejemplar.
   * Antes el bug dejaba la mora en caché vieja / sin actualizar.
   */
  devolver(prestamoId, fechaDevolucion = new Date()) {
    const prestamo = this.prestamos.get(prestamoId);
    if (!prestamo) throw new Error(`Préstamo ${prestamoId} no encontrado`);
    if (prestamo.estado === 'devuelto') throw new Error('El préstamo ya fue cerrado');

    prestamo.estado = 'devuelto';
    prestamo.devueltoEn = new Date(fechaDevolucion).toISOString();
    this.catalogo.marcarDisponible(prestamo.libroId);

    // Invalidar caché y recalcular (fix v1.2)
    this._cacheMora.delete(prestamoId);
    const mora = this.calcularMora(prestamoId, fechaDevolucion);
    return { prestamo, mora };
  }

  /**
   * v1.3 — renovación con límite de cupos.
   */
  renovar(prestamoId) {
    const prestamo = this.prestamos.get(prestamoId);
    if (!prestamo) throw new Error(`Préstamo ${prestamoId} no encontrado`);
    if (prestamo.estado !== 'activo') throw new Error('Solo se renuevan préstamos activos');
    if (prestamo.renovaciones >= MAX_RENOVACIONES) {
      throw new Error(`Máximo de renovaciones (${MAX_RENOVACIONES}) alcanzado`);
    }

    const nuevoVencimiento = this.calcularFechaDevolucion(new Date(prestamo.vencimiento));
    prestamo.vencimiento = nuevoVencimiento.toISOString();
    prestamo.renovaciones += 1;
    this._cacheMora.delete(prestamoId);
    return prestamo;
  }

  /**
   * v1.4 — mora con memoización (caché invalidada en devolver/renovar).
   */
  calcularMora(prestamoId, fechaReferencia = new Date()) {
    const cached = this._cacheMora.get(prestamoId);
    const refKey = new Date(fechaReferencia).toISOString().slice(0, 10);
    if (cached && cached.refKey === refKey) return cached.monto;

    const prestamo = this.prestamos.get(prestamoId);
    if (!prestamo) throw new Error(`Préstamo ${prestamoId} no encontrado`);

    const fin = prestamo.devueltoEn
      ? new Date(prestamo.devueltoEn)
      : new Date(fechaReferencia);
    const vencimiento = new Date(prestamo.vencimiento);
    const ms = fin - vencimiento;
    const diasAtraso = ms > 0 ? Math.ceil(ms / (1000 * 60 * 60 * 24)) : 0;
    const monto = Number((diasAtraso * MULTA_POR_DIA).toFixed(2));

    this._cacheMora.set(prestamoId, { refKey, monto });
    return monto;
  }

  listarActivos() {
    return [...this.prestamos.values()].filter((p) => p.estado === 'activo');
  }
}

module.exports = {
  PrestamoService,
  DIAS_PRESTAMO,
  MULTA_POR_DIA,
  MAX_RENOVACIONES,
};
