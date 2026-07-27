# Guía de flujo Git / GitHub — ShelfWise

## 1. Clonar y preparar

```bash
git clone https://github.com/Mildreth-SC/shelfwise-api.git
cd shelfwise-api
cp .env.example .env
npm run test:all
```

## 2. Crear una feature branch

```bash
git checkout main
git pull origin main
git checkout -b feature/mi-cambio
```

## 3. Trabajar con commits atómicos

```bash
git add src/PrestamoService.js
git commit -m "feat: describe el cambio en imperativo"
```

## 4. Abrir Pull Request

```bash
git push -u origin feature/mi-cambio
# Luego en GitHub: Compare & pull request
# Completa la plantilla: qué / por qué / cómo probar
# Usa: Closes #N si hay issue
```

## 5. Review y merge

1. Espera checks de CI (Actions → CI)
2. Solicita review (aunque sea ejercicio individual, documenta el revisor)
3. Merge a `develop` (o a `main` si usas GitHub Flow simple)
4. Borra la branch remota

## 6. Captura del proceso en GitHub (evidencia académica)

Para cada versión del historial, captura:

1. La branch / PR mergeado
2. El commit (hash corto visible)
3. El mensaje Conventional Commit
4. El check de Actions en verde (si aplica)
5. El tag de release (`v1.x`) cuando corresponda

Pega cada captura en la hoja de versión del documento académico (Portada / Guía / Historial / hoja por versión).

## 7. Releases

```bash
git tag -a v1.4 -m "release: PrestamoService v1.4 — cache + tests"
git push origin v1.4
```

En GitHub → Releases → Draft a new release desde el tag.
