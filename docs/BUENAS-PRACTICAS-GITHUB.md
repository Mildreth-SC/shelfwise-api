# Buenas prácticas de GitHub

Lista de referencia para el ejercicio **ShelfWise** (y cualquier repo serio).

## Commits

- Mensajes claros en imperativo: `Add`, `Fix`, `Update` (o `Agrega`, `Corrige`)
- **Conventional Commits:** `feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`, `perf:`
- Commits **atómicos**: un commit = un cambio lógico
- Evita commits gigantes que mezclan varias razones distintas

Ejemplos usados en este repo:

```text
feat: add PrestamoService base module
feat: validate catalog availability before loan
fix: recalculate late fee on return
feat: add loan renewals with cap
perf: memoize late fee + add unit tests
docs: add GitHub best-practices guide
```

## Branches

- Naming: `feature/nombre`, `fix/nombre-bug`, `hotfix/urgente`
- `main` siempre estable — no hagas push directo en proyectos serios
- GitHub Flow (proyectos pequeños) o Git Flow / SDLC (`develop` → `staging` → `main`)
- Borra la branch después de mergear

## Pull Requests

- Descripción: qué cambia, por qué, cómo probarlo
- PRs pequeños (más fáciles de revisar)
- Vincula issues: `Closes #12`
- Pide review antes de mergear
- Usa la plantilla en `.github/PULL_REQUEST_TEMPLATE.md`

## Documentación

- `README.md` completo (descripción, instalación, uso, estructura)
- `.gitignore` desde el día 1 (`node_modules`, `.env`, credenciales)
- `LICENSE` si el repo es público
- `CONTRIBUTING.md` si esperas colaboradores

## Seguridad

- Nunca subas API keys ni contraseñas
- Usa `.env` + `.gitignore` y **GitHub Secrets** en Actions
- Revisa el diff antes de `git push`
- Si se filtró un secreto: rotarlo y limpiar historial (`git filter-repo`) — borrar en un commit nuevo no basta

## Organización del repo

- Carpetas consistentes: `/src`, `/docs`, `/tests`
- Issues con labels: `bug`, `enhancement`, `documentation`
- Milestones para entregas o releases (`v1.0`, `v1.4`)

## Automatización

- GitHub Actions para CI (lint + tests en cada PR)
- Templates de Issues y Pull Requests
- (Opcional) Dependabot / CodeQL en plantillas SDLC más completas

## Checklist rápido antes de abrir un PR

- [ ] Branch con nombre correcto (`feature/` / `fix/`)
- [ ] Commits convencionales y atómicos
- [ ] `npm run test:all` en verde
- [ ] Sin secretos en el diff
- [ ] Descripción del PR + pasos para probar
- [ ] Issue vinculado si aplica
