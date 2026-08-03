# Plantilla diligenciada — INC-2026-08-07-001 (rollback v2.4 → v2.3)

Plantilla propia de ShelfWise para registrar un error en producción y la reversión a una versión anterior.  
Caso simulado del Excel del curso.

## 1. Identificación del incidente

| Campo | Valor |
|-------|-------|
| ID de incidente | INC-2026-08-07-001 |
| Fecha y hora de detección | 2026-08-07 10:45 |
| Detectado por | Monitoreo automático + reportes de usuarios |
| Severidad | Crítica — servicio caído (100% de logins fallando) |
| Versión / commit que causó el incidente | v2.4 (TTL 2FA) — commit de `perf(security): reduce 2FA code TTL to 30s` |
| Versión restaurada | v2.3 (estable) |

## 2. Descripción del error

**Qué se observó:** todos los usuarios recibían "código 2FA expirado" de inmediato.

**Impacto:** 100% de logins bloqueados ~15 minutos (10:32–10:47).

**Causa raíz:** TTL reducido de 300s a 30s; expiración calculada en UTC contra caché con hora local (offset -5h).

## 3. Decisión y acción tomada

| Campo | Valor |
|-------|-------|
| Decisión | Rollback inmediato a v2.3 |
| Tipo de reversión | `git revert` (sin reescribir historial de main) |
| Rama | `hotfix/rollback-2fa-ttl` |
| Autorizó | Ing. Carlos Molina (Tech Lead) |
| Ejecutó | Mildreth |

```bash
git checkout main
git revert <HASH_TTL_BUG> --no-edit
git commit --allow-empty -m "fix(security): revert 2FA TTL change and fix timezone bug"
# (en la práctica el mensaje queda en el commit de revert + hotfix posterior)
git push origin main
```

## 4. Responsables

| Rol | Persona |
|-----|---------|
| Reportó | Br. Andrés Vélez (QA) |
| Autorizó rollback | Ing. Carlos Molina |
| Ejecutó | Mildreth |
| Validó fix | Br. Génesis Pincay (Seguridad) |

## 5. Verificación post-rollback

10 logins de prueba con 2FA (TTL 5 min restaurado) OK. Tasa de fallos → 0% a los 3 minutos.

## 6. Acción correctiva definitiva

Hotfix: TTL 60s (más conservador) + timestamps exclusivamente UTC en servidor y caché.  
Prevención: test de zonas horarias + alerta si fallos de login > 5% en 5 minutos.
