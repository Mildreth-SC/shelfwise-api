# Gestión del proyecto mediante control de versiones (GitHub)

**Objetivo:** evidenciar el desarrollo con buenas prácticas de Git/GitHub y documentar, con plantilla propia, un escenario en el que existió un error en el sistema y se volvió a una versión anterior.

## 1. Buenas prácticas aplicadas

| Práctica | Cómo se aplica en el proyecto |
|----------|-------------------------------|
| Repositorio remoto en GitHub | Código centralizado, historial visible y auditable |
| Commits atómicos y mensajes claros | Un cambio lógico por commit (ej. `fix(auth): exigir OTP tras login`) |
| Ramas por funcionalidad | `main` (estable), `develop`, `feature/*`, `hotfix/*`, `security/*` |
| Pull Requests con revisión | Ningún cambio de seguridad llega a `main` sin revisión |
| Tags de versión | `v1.0.0`, `v1.1.0-stable` para poder restaurar un punto conocido |
| Issues / plantillas | Registro formal de incidentes y rollbacks |
| Secretos fuera del código | Variables de entorno; `.env` en `.gitignore` |
| Historial de seguridad | Commits/PR que documentan endurecimiento (contraseñas, OTP, HTTPS) |

### Flujo de ramas recomendado

```text
main ────────────────●────────────●──── v1.1.0-stable
                      \          /
develop ────────●──────●────────●
                 \
feature/otp-login ──●──●── PR ──►
```

### Ejemplo de historial orientado a seguridad

```text
v1.0.0          Primera versión del login (usuario + contraseña)
v1.1.0-rc1      Política de contraseñas robustas
v1.1.0-stable   Login + verificación OTP por SMS (versión estable)
v1.2.0-broken   Cambio defectuoso (ej. OTP omitido o timeout incorrecto)
                → ROLLBACK a v1.1.0-stable (documentado con plantilla)
v1.2.1          Corrección definitiva + pruebas
```

## 2. Capturas de pantalla que debes adjuntar (evidencia)

Incluye en tu informe (o en una carpeta `docs/evidencias/`) al menos estas capturas de **tu** repositorio GitHub:

| # | Captura | Qué debe verse |
|---|---------|----------------|
| 1 | Página principal del repositorio | Nombre, descripción, README, lenguaje |
| 2 | Pestaña **Commits** | Historial con mensajes claros del desarrollo |
| 3 | Pestaña **Branches** | `main`, `develop` y al menos una `feature/` o `security/` |
| 4 | Un **Pull Request** | Título, descripción, revisión/merge (idealmente de un cambio de seguridad) |
| 5 | Pestaña **Tags** / Releases | Al menos un tag estable (`vX.Y.Z-stable`) |
| 6 | **Issue** creado con la plantilla de rollback | Formulario lleno simulando el incidente |
| 7 | Comparación de commits (diff) | Antes/después del fix de seguridad o del revert |
| 8 | (Opcional) Actions / Checks | Pipeline que valida build o tests tras el rollback |

> **Nota:** Las capturas deben ser de tu cuenta/repositorio. Este documento solo indica qué evidenciar; no sustituye las imágenes.

### Checklist de evidencia (marcar al completar)

- [ ] Captura repositorio
- [ ] Captura commits
- [ ] Captura ramas
- [ ] Captura Pull Request
- [ ] Captura tag/release estable
- [ ] Captura issue de rollback (plantilla propia)
- [ ] Captura del commit/revert o redeploy a versión anterior

## 3. Plantilla propia: registro de error y retorno a versión anterior

La plantilla está en:

**[`.github/ISSUE_TEMPLATE/rollback-error-sistema.md`](../.github/ISSUE_TEMPLATE/rollback-error-sistema.md)**

### Cómo usarla en GitHub

1. Sube la carpeta `.github/ISSUE_TEMPLATE/` a tu repositorio.
2. En GitHub: **Issues → New issue → Rollback por error en el sistema**.
3. Completa el formulario simulando un incidente realista (ej. fallo en la validación OTP tras un deploy).
4. Documenta el tag estable restaurado (`v1.1.0-stable`) y el método (`git revert` o redeploy desde tag).
5. Toma captura del issue creado y adjúntala a la entrega.

### Escenario simulado sugerido (para llenar la plantilla)

| Campo | Ejemplo |
|-------|---------|
| Incidente | Tras desplegar `v1.2.0`, el OTP no se validaba y permitía entrar solo con usuario/contraseña |
| Impacto | Bypass del segundo factor; riesgo alto de seguridad |
| Acción | Rollback inmediato a `v1.1.0-stable` |
| Verificación | Login + OTP obligatorio funciona de nuevo |
| Seguimiento | PR de corrección en rama `hotfix/otp-validation` |

### Comandos de referencia (documentación)

```bash
# Ver tags
git tag -l

# Crear tag de versión estable
git tag -a v1.1.0-stable -m "Versión estable: login + OTP"
git push origin v1.1.0-stable

# Revertir el commit defectuoso (preferido en main compartido)
git revert <SHA_DEL_COMMIT_MALO>
git push origin main

# Alternativa en emergencia controlada: redeploy desde tag estable en CI/CD
# (no reescribir historial público con reset --hard)
```

## 4. Relación con la seguridad del desarrollo

Durante el curso, los cambios de seguridad típicos que deben quedar en el historial son:

1. Endurecimiento de contraseñas (longitud, complejidad, denylist).
2. Introducción de segundo factor (código OTP al móvil).
3. Corrección de vulnerabilidades detectadas en pruebas.
4. Rollback cuando un cambio de seguridad introduce un fallo grave.

El control de versiones no solo guarda código: **audita** quién cambió qué, cuándo se rompió y cómo se restauró la versión segura.
