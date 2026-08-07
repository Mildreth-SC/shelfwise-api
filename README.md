# ShelfWise API — préstamos + autenticación segura

Ejercicio académico de **buenas prácticas en GitHub**, control de versiones y **seguridad en autenticación**.

Tema ficticio: API de biblioteca (`PrestamoService`) + módulo `AuthService` (login, bcrypt, lockout, 2FA SMS).

**Repositorio:** https://github.com/Mildreth-SC/shelfwise-api

## Flujo Git

```text
feature/*  →  develop (Dev)  →  staging (Cert)  →  main (Prod)
```

## Línea de seguridad AuthService (v2.x)

| Versión | Descripción | Conventional Commit |
|---------|-------------|---------------------|
| **v2.0** | Login básico (texto plano — vulner. intencional) | `feat: add basic login with plaintext password check` |
| **v2.1** | Hash bcrypt (salt rounds 12) | `fix(security): hash passwords with bcrypt` |
| **v2.2** | Bloqueo tras 5 intentos fallidos | `feat(security): lock account after failed login attempts` |
| **v2.3** | 2FA por SMS (página de código al móvil) | `feat: add 2FA verification via SMS code` |
| **v2.4** | Incidente TTL 2FA → rollback → hotfix UTC | `fix(security): revert 2FA TTL change and fix timezone bug` |

Fuente Excel del curso: [`docs/seguridad/ShelfWise_Seguridad_Control_Versiones_Rollback.xlsx`](docs/seguridad/ShelfWise_Seguridad_Control_Versiones_Rollback.xlsx)

## Documentación del proyecto final

| Entregable | Archivo |
|------------|---------|
| Control de versiones + capturas | [docs/seguridad/HISTORIAL-AUTH-SEGURIDAD.md](docs/seguridad/HISTORIAL-AUTH-SEGURIDAD.md) · [GUIA-CAPTURAS-GITHUB.md](docs/seguridad/GUIA-CAPTURAS-GITHUB.md) |
| Plantilla de rollback (diligenciada) | [docs/seguridad/PLANTILLA-ROLLBACK-INC-2026-08-07.md](docs/seguridad/PLANTILLA-ROLLBACK-INC-2026-08-07.md) |
| Manual de validación de contraseñas | [docs/seguridad/MANUAL-VALIDACION-CONTRASENAS.md](docs/seguridad/MANUAL-VALIDACION-CONTRASENAS.md) |
| Diagrama login + OTP | [docs/seguridad/DIAGRAMA-LOGIN-OTP.md](docs/seguridad/DIAGRAMA-LOGIN-OTP.md) · [HTML](docs/seguridad/diagrama-login-otp.html) |

Issue template: `.github/ISSUE_TEMPLATE/rollback-error-sistema.md`

## Arranque

```bash
npm install
npm run lint
npm test
npm start
```

## Endpoints conceptuales (Auth)

| Método | Ruta | Descripción |
|--------|------|-------------|
| `POST` | `/auth/login` | Valida email/contraseña → envía OTP SMS |
| `POST` | `/auth/login/verify-2fa` | Valida código del móvil → sesión |

## Responsables (ejercicio)

- **Autora:** Mildreth  
- **Revisores:** Ing. Carlos Molina · Br. Andrés Vélez · Br. Génesis Pincay

## Licencia

MIT
