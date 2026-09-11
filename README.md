# OmniMon Landing

Landing publica de OmniMon ubicada en `/Users/jorge/Documents/Apps/omnimon_apps/macmon/omnimon_landing`.

## Ownership y alcance

- En este workspace la landing vive dentro del arbol `omnimon_apps/macmon`.
- El `README` anterior la describia como si este checkout fuera solo el repo `chochy2001/omnimon_landing`; eso no refleja la ubicacion real del proyecto en `/Users/jorge/Documents/Apps`.
- En este directorio existe ademas un `.git` local y el repo padre `omnimon_apps/macmon` lo ignora actualmente (`git status --ignored` lo reporta como `!! omnimon_landing/`). Eso es drift operativo de versionado local, no una instruccion para mover o separar archivos.

## Estado verificado del checkout

- Framework: Astro `^5.17.1`.
- Estilos: Tailwind CSS `^4.2.1`.
- Analytics cliente: `posthog-js ^1.369.0` (solo tras consentimiento del banner).
- Package manager: `bun`.
- Site URL configurada: `https://omnimon.com.mx` en `astro.config.mjs`.
- Scripts disponibles en `package.json`: `bun run dev`, `bun run build`, `bun run preview`, `bun run test`, `bun run test:coverage`.
- Legales: `/privacy` y `/terms` (EN), `/es/privacy` y `/es/terms` (ES). El `CookieBanner` vive en `Layout.astro` y enlaza esas rutas.
- Artefactos locales presentes: `dist/`, `.deploy/site_work/`, `.deploy/remote_snapshot/`, `.astro/`, `node_modules/`.

## Fuentes reales de contenido

- Home y snapshot SEO: `src/consts.ts` define `OMNIMON_VERSION = '6.7.0'` y `RELEASE_DATE = '17 Apr 2026'`. El ultimo tag publicado de la app sigue siendo `v6.6.6` hasta que se corte el release.
- La home consume esas constantes en `src/pages/index.astro`.
- Los metadatos por defecto tambien consumen `OMNIMON_VERSION` desde `src/layouts/Layout.astro`.
- El blog editable vive en Astro source, no solo en HTML estatico:
  `src/pages/blog/index.astro`, `src/pages/es/blog/index.astro`, `src/pages/blog/v6-4-1-release.astro`, `src/pages/blog/v6-5-0-release.astro`, `src/pages/blog/v6-6-0-release.astro`, `src/pages/blog/v6-7-0-release.astro`, y sus pares en `src/pages/es/blog/`.
- Los enlaces de descarga de home y blog apuntan a `https://github.com/chochy2001/omnimon/releases/latest`.
- `.deploy/site_work/` es un snapshot de despliegue/manual sync presente en el checkout; no debe asumirse como unica fuente editorial.

## Drift documentado al 2026-09-11

- `src/consts.ts` y el blog fuente coinciden en `6.7.0` / `17 Apr 2026`.
- El ultimo tag publicado de OmniMon desktop sigue siendo `v6.6.6`; no afirmar que 6.7.0 esta en produccion en todos los Mac.
- `.deploy/site_work/` puede seguir desfasado respecto al source; no es SoT editorial.

## Workflows y automatizacion

- CI de esta landing: `.github/workflows/ci.yml` (`bun run test` + `bun run build` en `[self-hosted, ci-web-tools]`).
- Los workflows `../.github/workflows/omnimon-ci.yml` y `../.github/workflows/release-policy.yml` pertenecen al repo `macmon` (cargo + bun del desktop). `omnimon_landing/` esta en el gitignore de macmon.
- Publicacion Hostinger de la landing no forma parte de esta ola.

## Comandos locales utiles

```bash
bun install
bun run dev
bun run build
bun run test
bun run test:coverage
```
