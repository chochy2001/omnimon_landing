# OmniMon Landing Page

Landing page oficial de [OmniMon](https://github.com/chochy2001/omnimon) — monitor de sistema de escritorio construido con Rust, Tauri 2 y Svelte 5.

**URL:** [https://omnimon.com.mx](https://omnimon.com.mx)

## Tech Stack

- **Framework:** [Astro 5](https://astro.build) (generacion estatica)
- **Estilos:** [Tailwind CSS 4](https://tailwindcss.com)
- **Package Manager:** bun
- **Hosting:** Hostinger (LiteSpeed, shared)
- **Deploy:** FTP via `lftp` desde `.deploy/site_work/`

## Estructura del proyecto

```
omnimon_landing/
├── src/
│   ├── assets/              # Imagenes y recursos estaticos
│   ├── layouts/
│   │   └── Layout.astro     # Layout base (head, nav, footer)
│   ├── pages/
│   │   ├── index.astro      # Landing page principal (EN)
│   │   ├── blog/
│   │   │   ├── index.astro          # Indice del blog (EN, 30 posts)
│   │   │   ├── v6-5-0-release.astro # Blog post individual
│   │   │   └── v6-4-1-release.astro
│   │   └── es/
│   │       └── blog/
│   │           ├── index.astro              # Indice del blog (ES)
│   │           ├── v6-5-0-release-es.astro
│   │           └── v6-4-1-release-es.astro
│   ├── styles/              # CSS global
│   └── consts.ts            # Version y fecha de release centralizadas
├── .deploy/                 # (gitignored) Staging area para FTP
│   ├── site_work/           # Sitio completo pre-built (se sube a public_html/)
│   └── remote_snapshot/     # Backup del sitio remoto
├── astro.config.mjs         # Config de Astro (site URL, Tailwind plugin)
├── tsconfig.json
├── package.json
└── .gitignore
```

## Desarrollo

```bash
# Instalar dependencias
bun install

# Servidor de desarrollo (puerto 4322)
bun run dev

# Build estatico
bun run build
# Output en dist/
```

## Deploy a produccion

El sitio en produccion se sirve desde `.deploy/site_work/`, NO directamente desde `dist/`.

Esto es porque `site_work/` contiene el sitio completo incluyendo 30 blog posts historicos que fueron creados antes de migrar a Astro. Los nuevos blog posts se generan con Astro y se copian a `site_work/`.

### Flujo de deploy

```bash
# 1. Build con Astro (si hay cambios en src/)
bun run build

# 2. Copiar nuevos archivos del build a site_work
#    CUIDADO: No sobreescribir blog posts historicos
cp -r dist/_astro/* .deploy/site_work/_astro/
# Copiar paginas nuevas selectivamente

# 3. Deploy via FTP
lftp -c "
set ssl:verify-certificate no
open -u USER,PASS HOST
mirror --reverse --delete --parallel=4 site_work/ public_html/
bye
"

# 4. Purgar cache de LiteSpeed desde hPanel > Performance > Cache Manager
```

### Notas importantes sobre el deploy

- **LiteSpeed cache:** Hostinger usa cache agresivo. Los cambios NO se reflejan inmediatamente. Hay que purgar desde hPanel > Performance > Cache Manager.
- **Cache de 404:** Si una URL se pide antes de que exista el archivo, LiteSpeed cachea la 404. Solo se arregla purgando cache.
- **NUNCA deployar solo `dist/`:** Eso borraria los 28 blog posts historicos que no estan en el source de Astro.
- **Credenciales FTP:** En `.env.local` (gitignored).

## Blog

El blog tiene 30 posts (EN + ES). Los posts mas recientes (v6.4.1+) tienen source Astro en `src/pages/blog/`. Los posts historicos (v1.0.0 a v6.4.0) solo existen como HTML estatico en `.deploy/site_work/blog/`.

El indice del blog (`src/pages/blog/index.astro`) lista TODOS los 30 posts con links a cada uno.

## i18n

El sitio soporta dos idiomas:
- **Ingles:** `/` y `/blog/`
- **Español:** `/es/` y `/es/blog/`

Cada blog post tiene su version EN y ES.

## Version

La version de OmniMon se define en `src/consts.ts` y se usa en toda la landing.
Para actualizar: cambiar `OMNIMON_VERSION` y `RELEASE_DATE` en ese archivo.

## Relacion con el repo principal

- **App:** [chochy2001/omnimon](https://github.com/chochy2001/omnimon) (Tauri + Rust + Svelte)
- **Landing:** [chochy2001/omnimon_landing](https://github.com/chochy2001/omnimon_landing) (este repo)

Son repos independientes. La landing NO debe estar en el repo de la app.
