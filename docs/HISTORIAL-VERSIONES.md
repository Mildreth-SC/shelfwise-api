# Historial de versiones — PrestamoService (ShelfWise)

Ejemplo técnico ficticio. Responsable: **Mildreth**.  
Revisores ficticios: Ing. Carlos Molina, Br. Andrés Vélez, Br. Génesis Pincay.

---

## v1.0 — Creación del módulo

| Campo | Valor |
|-------|-------|
| Herramienta | VS Code / Node.js 18+ |
| Rama | `main` |
| Commit | `feat: add PrestamoService base module` |
| Funciones | `prestar()`, `calcularFechaDevolucion()` |
| Spec | `POST /prestamos` → `{ libroId, usuarioId }` |

**Diff conceptual:** se crea el servicio y el mapa de préstamos en memoria.

```bash
git checkout -b feature/prestamo-base
git add src/PrestamoService.js src/CatalogoService.js
git commit -m "feat: add PrestamoService base module"
```

---

## v1.1 — Mejora: valida disponibilidad

| Campo | Valor |
|-------|-------|
| Rama | `feature/stock-validation` |
| Commit | `feat: validate catalog availability before loan` |
| Qué evita | Overbooking de ejemplares |

**Diff conceptual:** `prestar()` consulta `catalogo.estaDisponible()` y lanza error si stock = 0.

```bash
git checkout -b feature/stock-validation
git commit -m "feat: validate catalog availability before loan"
```

---

## v1.2 — Corrección: mora al devolver

| Campo | Valor |
|-------|-------|
| Rama | `fix/mora-recalculation` |
| Commit | `fix: recalculate late fee on return` |
| Bug | La mora no se recalculaba / quedaba valor viejo al cerrar el préstamo |
| Detección | Prueba unitaria de atraso (3 días → $1.50) |

```bash
git checkout -b fix/mora-recalculation
git commit -m "fix: recalculate late fee on return"
```

---

## v1.3 — Nueva funcionalidad: renovaciones

| Campo | Valor |
|-------|-------|
| Rama | `feature/renewals` |
| Commit | `feat: add loan renewals with cap` |
| Regla | Máximo 2 renovaciones (`MAX_RENOVACIONES`) |
| Spec | `POST /prestamos/:id/renovar` |

```bash
git checkout -b feature/renewals
git commit -m "feat: add loan renewals with cap"
```

---

## v1.4 — Optimización: caché + cobertura de tests

| Campo | Valor |
|-------|-------|
| Tag | `v1.4` |
| Commit | `perf: memoize late fee + add unit tests` |
| Mejora | Memoización de `calcularMora()` con invalidación en devolver/renovar |
| Tests | Suite en `tests/prestamo.test.js` (v1.0–v1.4) |

```bash
git commit -m "perf: memoize late fee + add unit tests"
git tag -a v1.4 -m "release: v1.4 cache + tests"
```

---

## Mapa de evidencia (capturas GitHub)

Para cada versión, dejar espacio en el documento académico para:

- [ ] Screenshot del commit / PR
- [ ] Screenshot del check CI
- [ ] Screenshot del tag (solo v1.4 / releases)
