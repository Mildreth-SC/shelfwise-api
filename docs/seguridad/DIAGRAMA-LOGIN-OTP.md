# Diagrama: entrada y validación de usuario al sistema transaccional

**Puntos rúbrica:** 25  
**Alcance:** proceso desde el acceso hasta la sesión autenticada, incluyendo **login + contraseña** y la **página de verificación del código OTP** enviado al teléfono móvil.

---

## 1. Descripción del proceso

El sistema transaccional no otorga acceso completo solo con usuario y contraseña. El flujo es de **autenticación en dos pasos (2FA)**:

1. El usuario ingresa **identificador** y **contraseña**.
2. El servidor valida las credenciales según la política de contraseñas y el hash almacenado.
3. Si son correctas, se genera y envía un **código OTP** al teléfono móvil registrado.
4. Se muestra una **página intermedia** que solicita escribir el código recibido.
5. Solo si el OTP es válido (y no ha expirado / no superó intentos), se crea la **sesión transaccional**.

---

## 2. Actores y componentes

| Elemento | Rol |
|----------|-----|
| Usuario | Persona que inicia sesión |
| Navegador / App web | Interfaz: login y página OTP |
| API de autenticación | Valida credenciales, emite retos OTP, crea sesión |
| Servicio SMS / OTP | Envía el código al móvil |
| Base de datos | Usuarios, hash de contraseña, teléfono, intentos, tokens |
| Política de contraseñas | Reglas del [manual de validación](MANUAL-VALIDACION-CONTRASENAS.md) |

---

## 3. Diagrama de flujo principal (Mermaid)

> Copia este bloque en [https://mermaid.live](https://mermaid.live) para exportar PNG/SVG, o súbelo a GitHub (renderiza automáticamente en el README/Markdown).

```mermaid
flowchart TD
    A([Inicio]) --> B[Usuario abre página de login]
    B --> C[Ingresa usuario/correo y contraseña]
    C --> D{¿Campos completos?}
    D -->|No| E[Mostrar error de campos requeridos]
    E --> C
    D -->|Sí| F[Enviar credenciales por HTTPS al servidor]
    F --> G{¿Usuario existe y contraseña válida?}
    G -->|No| H[Registrar intento fallido]
    H --> I{¿Cuenta bloqueada por intentos?}
    I -->|Sí| J[Mensaje: cuenta temporalmente bloqueada]
    J --> Z([Fin - acceso denegado])
    I -->|No| K[Mensaje genérico: credenciales inválidas]
    K --> C
    G -->|Sí| L{¿Cuenta activa y no bloqueada?}
    L -->|No| M[Informar estado de cuenta / contacto soporte]
    M --> Z
    L -->|Sí| N[Generar OTP de un solo uso]
    N --> O[Guardar OTP hasheado + expiración + contador de intentos]
    O --> P[Enviar OTP por SMS al móvil registrado]
    P --> Q[Mostrar página: Ingrese el código enviado a su teléfono]
    Q --> R[Usuario escribe el código OTP]
    R --> S{¿OTP formato válido?}
    S -->|No| T[Solicitar código nuevamente]
    T --> R
    S -->|Sí| U{¿OTP correcto, vigente y dentro de intentos?}
    U -->|No - expirado| V[Invalidar OTP / ofrecer reenvío]
    V --> Q
    U -->|No - incorrecto| W[Incrementar intentos OTP]
    W --> X{¿Máximo de intentos OTP?}
    X -->|Sí| Y[Invalidar reto / exigir nuevo login]
    Y --> Z
    X -->|No| Q
    U -->|Sí| AA[Crear sesión autenticada segura]
    AA --> AB[Registrar evento de login exitoso]
    AB --> AC[Redirigir al sistema transaccional]
    AC --> AD([Fin - acceso concedido])
```

---

## 4. Diagrama de secuencia (login + OTP)

```mermaid
sequenceDiagram
    autonumber
    actor U as Usuario
    participant UI as Página Web
    participant API as API Autenticación
    participant DB as Base de datos
    participant SMS as Servicio SMS

    U->>UI: Abre /login
    U->>UI: Envía usuario + contraseña
    UI->>API: POST /auth/login (HTTPS)
    API->>DB: Buscar usuario + verificar hash
    alt Credenciales inválidas
        API-->>UI: 401 Credenciales inválidas
        UI-->>U: Mensaje de error genérico
    else Credenciales válidas
        API->>API: Generar OTP (6 dígitos) + TTL
        API->>DB: Guardar reto OTP (hash, expiry, intentos=0)
        API->>SMS: Enviar código al móvil enmascarado
        SMS-->>U: SMS con código
        API-->>UI: 200 Requiere OTP (challenge_id)
        UI-->>U: Página "Escriba el código enviado a su teléfono"
        U->>UI: Ingresa código OTP
        UI->>API: POST /auth/verify-otp
        API->>DB: Validar OTP + expiración + intentos
        alt OTP inválido / expirado
            API-->>UI: 401 OTP inválido
            UI-->>U: Error / reintento o reenvío
        else OTP válido
            API->>DB: Crear sesión / token
            API-->>UI: 200 Sesión OK + cookie/token seguro
            UI-->>U: Entrada al sistema transaccional
        end
    end
```

---

## 5. Página intermedia de OTP (requisito de la rúbrica)

Tras un login correcto, el usuario **no** entra aún al módulo transaccional. Ve una pantalla dedicada, por ejemplo:

```text
┌──────────────────────────────────────────────┐
│           Verificación en dos pasos          │
│                                              │
│  Enviamos un código a tu teléfono            │
│  terminado en ******78                       │
│                                              │
│  Código:  [ _ _ _ _ _ _ ]                    │
│                                              │
│  [ Verificar ]     [ Reenviar código ]       │
│                                              │
│  El código expira en 5 minutos               │
└──────────────────────────────────────────────┘
```

Elementos mínimos de seguridad en esa página:

- Enmascarar el número (`******78`)
- Límite de intentos y tiempo de vida (TTL) del OTP
- Opción de reenvío con cooldown (ej. 60 s)
- No revelar si el teléfono “existe” más de lo necesario
- Canal HTTPS; OTP almacenado hasheado, no en texto plano

---

## 6. Controles de seguridad del proceso

| Control | Descripción |
|---------|-------------|
| Transporte TLS | Credenciales y OTP solo por HTTPS |
| Contraseña robusta | Según [manual](MANUAL-VALIDACION-CONTRASENAS.md) |
| Hash de contraseña | Argon2id / bcrypt |
| OTP de un solo uso | Caduca; se invalida al usarse |
| Rate limiting | Límite de intentos de login y de OTP |
| Mensajes genéricos | Evitar enumeración de usuarios |
| Sesión segura | Cookie `HttpOnly`, `Secure`, `SameSite` o token con expiración |
| Auditoría | Logs de éxitos/fallos sin secretos |

---

## 7. Cómo entregar este diagrama (sugerencia)

1. Exporta ambos diagramas Mermaid a **PNG** desde [mermaid.live](https://mermaid.live).
2. Incluye las imágenes en tu informe PDF o en `docs/evidencias/`.
3. Sube este archivo `.md` a GitHub: al abrir el archivo se verán los diagramas renderizados — **toma captura** de esa vista como evidencia.
4. En la memoria escrita, agrega 1–2 párrafos explicando que después de login/password aparece la página del código SMS (sección 5).

---

## 8. Leyenda rápida del flujo feliz

```text
Login → Validar contraseña → Enviar OTP al móvil → Página OTP → Validar código → Sesión transaccional
```
