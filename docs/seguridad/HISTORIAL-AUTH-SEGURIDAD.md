# Historial de seguridad — AuthService (ShelfWise API)

Caso práctico ficticio del proyecto final.  
**Repositorio:** https://github.com/Mildreth-SC/shelfwise-api  
**Módulo:** `src/AuthService.js`  
**Autora:** Mildreth  
**Revisores:** Ing. Carlos Molina (Tech Lead) · Br. Andrés Vélez (QA) · Br. Génesis Pincay (Seguridad)

Flujo de ramas: `feature/*` → `develop` → `staging` → `main`

Fuente Excel: [ShelfWise_Seguridad_Control_Versiones_Rollback.xlsx](ShelfWise_Seguridad_Control_Versiones_Rollback.xlsx)

---

## Resumen de versiones

| Versión | Tipo | Resumen | Rama | Commit message |
|---------|------|---------|------|----------------|
| v2.0 | feat | Login básico (usuario/contraseña, sin hash) | `feature/auth-login` | `feat: add basic login with plaintext password check` |
| v2.1 | fix(security) | Hash de contraseñas con bcrypt | `fix/password-hashing` | `fix(security): hash passwords with bcrypt` |
| v2.2 | feat(security) | Bloqueo tras 5 intentos fallidos | `feature/lockout-bruteforce` | `feat(security): lock account after failed login attempts` |
| v2.3 | feat | 2FA por SMS (código al móvil) | `feature/2fa-sms` | `feat: add 2FA verification via SMS code` |
| v2.4 | incident/hotfix | TTL 2FA mal calculado → rollback a v2.3 + hotfix | `hotfix/rollback-2fa-ttl` | `fix(security): revert 2FA TTL change and fix timezone bug` |

---

## v2.0 — Login básico

Comparación en **texto plano** (vulnerabilidad intencional del ejemplo).

```bash
git checkout -b feature/auth-login
git add src/AuthService.js
git commit -m "feat: add basic login with plaintext password check"
```

Endpoint: `POST /auth/login` → `{ token }`

---

## v2.1 — Hash con bcrypt

Se elimina `passwordPlano`; se usa `passwordHash` con `bcrypt` (salt rounds = 12).

```bash
git checkout -b fix/password-hashing
git commit -m "fix(security): hash passwords with bcrypt"
```

Aprobó: Br. Génesis Pincay (Seguridad)

---

## v2.2 — Anti fuerza bruta

`MAX_INTENTOS_FALLIDOS = 5` · `TIEMPO_BLOQUEO_MIN = 15` · respuesta `429` si bloqueado.

```bash
git checkout -b feature/lockout-bruteforce
git commit -m "feat(security): lock account after failed login attempts"
```

---

## v2.3 — 2FA por SMS

Tras login correcto, se envía código de 6 dígitos al móvil. Página intermedia: `POST /auth/login/verify-2fa`.

- TTL = 5 minutos  
- Máximo 3 intentos de verificación  

```bash
git checkout -b feature/2fa-sms
git commit -m "feat: add 2FA verification via SMS code"
```

---

## v2.4 — Incidente y rollback

Se redujo TTL a 30s; un bug de zona horaria hizo que **todos** los códigos aparecieran vencidos.

1. Rollback con `git revert` a comportamiento de v2.3  
2. Hotfix: TTL 60s + timestamps solo en UTC  

Registro completo: [PLANTILLA-ROLLBACK-INC-2026-08-07.md](PLANTILLA-ROLLBACK-INC-2026-08-07.md)

---

## Capturas sugeridas en GitHub

Para cada versión: branch/PR, commit con hash, mensaje Conventional Commit, Actions en verde.  
Para v2.4: captura del **revert** + confirmación de servicio restaurado.
