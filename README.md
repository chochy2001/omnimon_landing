# OmniMon Landing

Landing publica de OmniMon ubicada en `/Users/jorge/Documents/Apps/omnimon_apps/macmon/omnimon_landing`.

## Ownership y alcance

- En este workspace la landing vive dentro del arbol `omnimon_apps/macmon`.
- El `README` anterior la describia como si este checkout fuera solo el repo `chochy2001/omnimon_landing`; eso no refleja la ubicacion real del proyecto en `/Users/jorge/Documents/Apps`.
- En este directorio existe ademas un `.git` local y el repo padre `omnimon_apps/macmon` lo ignora actualmente (`git status --ignored` lo reporta como `!! omnimon_landing/`). Eso es drift operativo de versionado local, no una instruccion para mover o separar archivos.

## Estado verificado del checkout

- Framework: Astro `^5.17.1`.
- Estilos: Tailwind CSS `^4.2.1`.
- Analytics cliente: `posthog-js ^1.369.0`.
- Package manager: `bun`.
- Site URL configurada: `https://omnimon.com.mx` en `astro.config.mjs`.
- Scripts disponibles en `package.json`: `bun run dev`, `bun run build`, `bun run preview`, `bun run test`, `bun run test:coverage`.
- Artefactos locales presentes: `dist/`, `.deploy/site_work/`, `.deploy/remote_snapshot/`, `.astro/`, `node_modules/`.

## Fuentes reales de contenido

- Home y snapshot SEO: `src/consts.ts` define `OMNIMON_VERSION = '6.6.6'` y `RELEASE_DATE = '17 Mar 2026'`.
- La home consume esas constantes en `src/pages/index.astro`.
- Los metadatos por defecto tambien consumen `OMNIMON_VERSION` desde `src/layouts/Layout.astro`.
- El blog editable vive en Astro source, no solo en HTML estatico:
  `src/pages/blog/index.astro`, `src/pages/es/blog/index.astro`, `src/pages/blog/v6-4-1-release.astro`, `src/pages/blog/v6-5-0-release.astro`, `src/pages/blog/v6-6-0-release.astro`, `src/pages/blog/v6-7-0-release.astro`, y sus pares en `src/pages/es/blog/`.
- Los enlaces de descarga de home y blog apuntan a `https://github.com/chochy2001/omnimon/releases/latest`.
- `.deploy/site_work/` es un snapshot de despliegue/manual sync presente en el checkout; no debe asumirse como unica fuente editorial.

## Drift documentado al 2026-07-22

- La home/SEO y el copy principal siguen anclados a `6.6.6` con fecha `17 Mar 2026` porque dependen de `src/consts.ts`.
- El blog fuente en `src/pages/blog/index.astro` y `src/pages/es/blog/index.astro` ya lista `v6.7.0` con fecha `17 Apr 2026` como release mas reciente.
- `dist/blog/` y `dist/es/blog/` ya contienen `v6.6.0` y `v6.7.0`.
- `.deploy/site_work/blog/` y `.deploy/site_work/es/blog/` llegan hasta `v6.5.0` en el snapshot local observado.
- Mientras existan esas diferencias, no debe presentarse la version expuesta por SEO/home como unica verdad del release actual. La reconciliacion pendiente es alinear `src/consts.ts`, el copy de la home y el snapshot de despliegue/manual sync.

## Workflows y automatizacion

- Los workflows verificados en `../.github/workflows/omnimon-ci.yml` y `../.github/workflows/release-policy.yml` pertenecen al repo `macmon`.
- Esos workflows validan y auditan principalmente `v4/`; no se verifico un workflow dedicado para build o deploy de `omnimon_landing` dentro de este checkout.
- Cualquier proceso de publicacion de la landing sigue siendo, como minimo, parcialmente manual desde los artefactos presentes en este directorio.

## Comandos locales utiles

```bash
bun install
bun run dev
bun run build
bun run test
bun run test:coverage
```
