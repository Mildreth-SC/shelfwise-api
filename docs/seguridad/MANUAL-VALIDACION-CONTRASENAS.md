# Manual de validación de contraseñas

**Destinatario:** persona responsable de validar que una contraseña sea robusta  
**Alcance:** aplicación web transaccional (registro, cambio de contraseña y políticas de autenticación)  
**Referencias de buenas prácticas:** OWASP Authentication Cheat Sheet, NIST SP 800-63B (orientación actualizada)

---

## 1. Propósito

Este manual define los criterios, el procedimiento y la evidencia que debe aplicar el validador para **aceptar o rechazar** una contraseña antes de que quede almacenada o asociada a una cuenta.

Una contraseña robusta reduce el riesgo de:

- Ataques de fuerza bruta y diccionario
- Reutilización de credenciales filtradas
- Compromiso de cuentas en el sistema transaccional

---

## 2. Roles y responsabilidades

| Rol | Responsabilidad |
|-----|-----------------|
| **Validador de contraseñas** | Aplicar este manual, registrar resultados, rechazar contraseñas no conformes |
| **Desarrollador** | Implementar las reglas en el frontend (feedback) y backend (validación obligatoria) |
| **Responsable de seguridad** | Actualizar la política y la lista de contraseñas prohibidas |

> **Regla crítica:** la validación en el cliente es solo ayuda al usuario. La **validación definitiva** siempre ocurre en el servidor.

---

## 3. Política de contraseña robusta (criterios de aceptación)

### 3.1 Requisitos obligatorios (debe cumplir TODOS)

| # | Criterio | Regla |
|---|----------|-------|
| R1 | Longitud mínima | ≥ **12** caracteres |
| R2 | Longitud máxima | ≤ **128** caracteres (evitar DoS por hashing de entradas enormes) |
| R3 | Diversidad de caracteres | Al menos **3 de 4** categorías: mayúsculas `A-Z`, minúsculas `a-z`, dígitos `0-9`, símbolos permitidos |
| R4 | Sin espacios iniciales/finales | Se recortan o se rechazan según política del sistema (definir una y ser consistente) |
| R5 | No igual al identificador | Distinta del nombre de usuario, correo o documento |
| R6 | No está en denylist | No figura en lista de contraseñas comunes/filtradas |
| R7 | No es secuencial obvia | Rechazar patrones como `12345678`, `abcdef`, `qwerty`, `aaaaaaa` |
| R8 | Confirmación | En registro/cambio: contraseña y confirmación deben coincidir |

### 3.2 Símbolos permitidos (ejemplo)

```text
! @ # $ % ^ & * ( ) - _ = + [ ] { } ; : , . ? /
```

Caracteres de control, saltos de línea y espacios internos múltiples: **rechazar** o normalizar según especificación del producto.

### 3.3 Criterios recomendados (fortaleza adicional)

| # | Criterio | Nota |
|---|----------|------|
| Rec1 | Longitud ≥ 14 | Preferible para cuentas privilegiadas / admin |
| Rec2 | Sin datos personales | Fecha de nacimiento, teléfono, nombre de la empresa |
| Rec3 | Sin repetición de la última contraseña | No reutilizar las últimas N (ej. 5) |
| Rec4 | Comprobación contra breaches | Integrar servicio tipo denylist/HIBP *k-anonymity* si está disponible |

### 3.4 Qué NO exigir (evitar prácticas obsoletas)

- Rotación forzada cada N días **sin indicios de compromiso**
- Exigir cambio de un solo carácter respecto a la anterior como “cumplimiento”
- Preguntas secretas débiles como único respaldo
- Almacenar la contraseña en texto plano o cifrado reversible

---

## 4. Almacenamiento seguro (verificación para el validador técnico)

El validador debe confirmar con desarrollo/ops que:

1. Se usa **hash + salt** moderno (ej. Argon2id, bcrypt o scrypt), nunca MD5/SHA1 “solo”.
2. El salt es único por usuario.
3. Los parámetros de costo del hash están documentados.
4. La contraseña **nunca** se registra en logs, analytics ni tickets.
5. El transporte es **HTTPS/TLS** en todo el flujo de login y cambio de clave.

---

## 5. Procedimiento de validación (paso a paso)

### 5.1 Entrada

El usuario envía una contraseña candidata en:

- Registro de cuenta
- Cambio de contraseña
- Restablecimiento de contraseña

### 5.2 Checklist operativo del validador

Para cada caso de prueba o revisión de política, marcar:

1. [ ] ¿Cumple longitud mínima/máxima?
2. [ ] ¿Cumple diversidad de categorías (3 de 4)?
3. [ ] ¿Es distinta del usuario/correo?
4. [ ] ¿Está en la denylist / es demasiado común?
5. [ ] ¿Contiene secuencias o repeticiones obvias?
6. [ ] ¿Coincide con el campo de confirmación?
7. [ ] ¿El backend rechaza igual que el frontend?
8. [ ] ¿El mensaje de error **no revela** si el usuario existe u otros detalles sensibles?
9. [ ] ¿Tras aceptar, el hash se genera correctamente y no se guarda el texto plano?

### 5.3 Resultado

| Resultado | Acción |
|-----------|--------|
| **APROBADA** | Continuar flujo (activar cuenta / actualizar credencial / proceder a OTP si aplica) |
| **RECHAZADA** | Mostrar mensaje claro de los requisitos fallidos; no persistir la clave |

### 5.4 Mensajes sugeridos al usuario

- “La contraseña debe tener al menos 12 caracteres.”
- “Incluye mayúsculas, minúsculas y números o símbolos.”
- “Esa contraseña es demasiado común. Elige otra.”
- “La contraseña no puede ser igual a tu correo o usuario.”

Evitar mensajes como: “Contraseña incorrecta para el usuario admin@…” (filtración de información).

---

## 6. Casos de prueba (batería mínima)

| ID | Contraseña de prueba | Esperado | Motivo |
|----|----------------------|----------|--------|
| CP-01 | `abc` | Rechazar | Muy corta |
| CP-02 | `password` | Rechazar | Común / denylist |
| CP-03 | `Password123` | Rechazar o débil | Corta (<12) y predecible |
| CP-04 | `Juan2024` | Rechazar | Corta / posible dato personal |
| CP-05 | `usuario@correo.com` | Rechazar | Igual al identificador |
| CP-06 | `AAAAAAAAAAAA` | Rechazar | Repetición |
| CP-07 | `123456789012` | Rechazar | Secuencia numérica |
| CP-08 | `Cafe#Seguro9xQ` | Aprobar | Cumple longitud y diversidad |
| CP-09 | `Tr4ns@cc10n!Ok` | Aprobar | Cumple política |
| CP-10 | Confirmación distinta | Rechazar | No coincide |

Registrar evidencia (capturas o resultados de pruebas automatizadas) para la entrega del curso.

---

## 7. Matriz de severidad si se omite la validación

| Hallazgo | Severidad | Ejemplo |
|----------|-----------|---------|
| Se aceptan claves < 8 caracteres | Alta | Fuerza bruta viable |
| No hay denylist | Media | `Password123!` aceptada |
| Validación solo en frontend | Crítica | Bypass con Postman/cURL |
| Contraseña en logs | Crítica | Fuga de credenciales |
| Hash débil (MD5) | Crítica | Cracking offline |

---

## 8. Relación con el flujo de autenticación

Este manual cubre la **calidad de la contraseña**. En el sistema transaccional, tras un login correcto (usuario + contraseña), el usuario debe completar un **segundo factor**: código OTP enviado al teléfono móvil. Una contraseña robusta no reemplaza el OTP; ambos se complementan.

Ver diagrama: [DIAGRAMA-LOGIN-OTP.md](DIAGRAMA-LOGIN-OTP.md).

---

## 9. Registro de validación (plantilla para el responsable)

| Campo | Valor |
|-------|-------|
| Fecha | |
| Validador | |
| Ambiente | Dev / QA / Prod (política) |
| Versión de la política | 1.0 |
| Casos ejecutados | CP-01 … CP-10 |
| Resultado global | Conforme / No conforme |
| Observaciones | |
| Firma / visto bueno | |

---

## 10. Resumen ejecutivo para el validador

1. Exigir **≥ 12 caracteres** y diversidad de tipos.
2. Rechazar comunes, secuencias y datos personales/identificador.
3. Validar **siempre en servidor**.
4. Guardar solo **hash seguro**, nunca texto plano.
5. Documentar pruebas con la batería de casos.
6. Recordar que el acceso completo requiere **OTP al móvil** después del login.
