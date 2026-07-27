const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { PrestamoService, DIAS_PRESTAMO, MAX_RENOVACIONES } = require('../src/PrestamoService');
const { CatalogoService } = require('../src/CatalogoService');

function setup(stock = { 'ISBN-1': 1 }) {
  const catalogo = new CatalogoService(stock);
  const service = new PrestamoService(catalogo);
  return { catalogo, service };
}

describe('PrestamoService', () => {
  it('v1.0 crea préstamo y calcula fecha de devolución', () => {
    const { service } = setup();
    const inicio = new Date('2026-01-01T00:00:00Z');
    const p = service.prestar('ISBN-1', 'u1', inicio);
    const esperado = new Date(inicio);
    esperado.setDate(esperado.getDate() + DIAS_PRESTAMO);
    assert.equal(p.vencimiento, esperado.toISOString());
    assert.equal(p.estado, 'activo');
  });

  it('v1.1 rechaza préstamo si no hay disponibilidad', () => {
    const { service } = setup({ 'ISBN-1': 0 });
    assert.throws(() => service.prestar('ISBN-1', 'u1'), /no disponible/);
  });

  it('v1.2 recalcula mora al devolver (bug fix)', () => {
    const { service } = setup();
    const inicio = new Date('2026-01-01T00:00:00Z');
    const p = service.prestar('ISBN-1', 'u1', inicio);
    // Devolver 3 días después del vencimiento
    const devolucion = new Date(p.vencimiento);
    devolucion.setDate(devolucion.getDate() + 3);
    const { mora } = service.devolver(p.id, devolucion);
    assert.equal(mora, 1.5);
  });

  it('v1.3 permite renovar hasta el máximo', () => {
    const { service } = setup();
    const p = service.prestar('ISBN-1', 'u1');
    service.renovar(p.id);
    service.renovar(p.id);
    assert.equal(service.prestamos.get(p.id).renovaciones, MAX_RENOVACIONES);
    assert.throws(() => service.renovar(p.id), /Máximo de renovaciones/);
  });

  it('v1.4 usa caché de mora y la invalida al renovar', () => {
    const { service } = setup();
    const inicio = new Date('2026-01-01T00:00:00Z');
    const p = service.prestar('ISBN-1', 'u1', inicio);
    const ref = new Date('2026-01-20T00:00:00Z');
    const m1 = service.calcularMora(p.id, ref);
    const m2 = service.calcularMora(p.id, ref);
    assert.equal(m1, m2);
    service.renovar(p.id);
    const m3 = service.calcularMora(p.id, ref);
    assert.ok(m3 < m1);
  });
});
