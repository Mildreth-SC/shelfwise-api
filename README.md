# ShelfWise API — módulo de préstamos (ejemplo ficticio)

Ejercicio académico de **buenas prácticas en GitHub** + control de versiones.

Tema 100% ficticio: API de préstamos de biblioteca (`PrestamoService`).  
No está vinculado a proyectos reales.

## Flujo Git recomendado

```text
feature/*  →  develop (Dev)  →  staging (Cert)  →  main (Prod)
```

## Versiones del módulo

| Versión | Rama / tag | Descripción | Conventional Commit |
|---------|------------|-------------|---------------------|
| v1.0 | `main` inicial | Creación: `prestar()`, `calcularFechaDevolucion()` | `feat: add PrestamoService base module` |
| v1.1 | `feature/stock-validation` | Valida disponibilidad antes de prestar | `feat: validate catalog availability before loan` |
| v1.2 | `fix/mora-recalculation` | Mora se recalcula al devolver | `fix: recalculate late fee on return` |
| v1.3 | `feature/renewals` | Renovaciones con cupo máximo | `feat: add loan renewals with cap` |
| v1.4 | tag `v1.4` | Caché de mora + tests | `perf: memoize late fee + add unit tests` |

## Arranque rápido

```bash
npm run lint
npm test
npm start
```

## Estructura

```text
shelfwise-api/
├── .github/                 # Actions, templates de Issue/PR, CODEOWNERS
├── docs/                    # Buenas prácticas + guía de implementación
├── src/                     # Código de producción
│   ├── PrestamoService.js
│   ├── CatalogoService.js
│   └── index.js
├── tests/                   # Pruebas unitarias (node:test)
├── .env.example             # Plantilla de secretos (nunca subir .env)
├── .gitignore
├── CONTRIBUTING.md
├── LICENSE
└── README.md
```

## Endpoints conceptuales

| Método | Ruta | Descripción |
|--------|------|-------------|
| `POST` | `/prestamos` | Crear préstamo |
| `POST` | `/prestamos/:id/devolver` | Devolver y calcular mora |
| `POST` | `/prestamos/:id/renovar` | Renovar (máx. 2) |
| `GET` | `/prestamos/activos` | Listar activos |

## Documentación

- [Buenas prácticas de GitHub](docs/BUENAS-PRACTICAS-GITHUB.md)
- [Guía de flujo Git/GitHub](docs/GUIA-GITHUB.md)
- [Historial de versiones](docs/HISTORIAL-VERSIONES.md)

## Responsables (ficticios para el ejercicio)

- **Autora:** Mildreth  
- **Revisores:** Ing. Carlos Molina, Br. Andrés Vélez, Br. Génesis Pincay

## Licencia

MIT
