---
name: Rollback por error en el sistema
about: Registrar un incidente que obligó a volver a una versión anterior estable (plantilla ShelfWise).
title: "[ROLLBACK] "
labels: ["incidente", "rollback", "seguridad"]
assignees: []
---

## 1. Identificación del incidente

| Campo | Valor |
|-------|-------|
| **ID de incidente** | INC-YYYY-MM-DD-XXX |
| **Fecha y hora de detección** | |
| **Detectado por** | |
| **Severidad** | Crítica / Alta / Media / Baja |
| **Versión / commit que causó el incidente** | |
| **Versión restaurada (rollback destino)** | |

## 2. Descripción del error

**Qué se observó**  


**Impacto**  


**Causa raíz**  


## 3. Decisión y acción tomada

| Campo | Valor |
|-------|-------|
| **Decisión** | Rollback inmediato / Hotfix en caliente |
| **Tipo de reversión** | `git revert` (recomendado en main) |
| **Rama** | `hotfix/...` |
| **Commit de revert** | |
| **Autorizó** | |

**Comandos Git ejecutados:**

```bash
git checkout main
git revert <HASH_PROBLEMATICO> --no-edit
git push origin main
```

## 4. Responsables

| Rol | Persona |
|-----|---------|
| Reportó | |
| Autorizó rollback | |
| Ejecutó rollback | |
| Validó fix definitivo | |

## 5. Verificación post-rollback

Cómo se confirmó la recuperación:  


## 6. Acción correctiva definitiva (post-mortem)

**Hotfix definitivo**  


**Prevención futura**  

- [ ] Prueba automatizada del flujo afectado
- [ ] Alerta de monitoreo
- [ ] Revisión de seguridad en PR
