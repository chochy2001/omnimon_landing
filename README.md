# OmniMon Landing

Public Astro site for [omnimon.com.mx](https://omnimon.com.mx/).
Git: `chochy2001/omnimon_landing`. Nested under `omnimon_apps/macmon/omnimon_landing` and gitignored by the parent `CAPDESIS/omnimon` repo.

## Stack

- Astro 5 + Tailwind 4 + Bun
- Site URL: `https://omnimon.com.mx` (`astro.config.mjs`)
- Analytics: PostHog only after the cookie banner

## Commands

```bash
bun install
bun run test      # bun test src/lib
bun run build
bun run preview
```

## Verified 2026-09-19 CST / 2026-09-20 UTC

Live origin `omnimon-build` SHA **`ffc87ddc8e7b`** (= this repo `origin/main` at that measurement). Until a new deploy, treat that SHA as the last measured public origin.

| Surface | Status |
|---------|--------|
| `/` English home | 200, Layout, EN\|ES, theme, screenshot |
| `/es/` Spanish home | 200 full page (not a 301) |
| `/en` `/en/` | 301 → `/` |
| Unknown path | 404 **product** page (`ErrorDocument 404 /404.html`) |
| Favicon | OmniMon gear+cyan SVG + app ICO (not Astro starter `M50.4 78.5`) |
| Blog index | Only posts that exist as Astro pages (v6.4.1–v6.8.0 EN/ES) |
| Legal | `/privacy` `/terms` `/es/privacy` `/es/terms` |

`src/consts.ts` version is **6.8.0** (workspace). Latest published GitHub tag for the desktop app is still **v6.6.6** (a Universal DMG exists for that tag; there is no 6.8.0 binary). Download CTAs say "Download latest" / "Descargar ultima version" and point at `releases/latest`. Spanish blog slugs end with `-es` (example: `/es/blog/v6-8-0-release-es/`).

## Deploy

GitHub Actions: `.github/workflows/deploy-hostinger.yml` (GitHub-hosted, FTPS strict).
Operator secrets: `HOSTINGER_FTPS_HOST` (hostname under `*.hstgr.io`, **not** the IP), `FTP_USER`, `FTP_PASSWORD`. Variables: `FTP_PORT=21`, `FTP_REMOTE_DIR=./`.

Until `HOSTINGER_FTPS_HOST` is set, GitHub CD is blocked and production is published by local FTPS of `dist/` stamped with `PUBLIC_BUILD_SHA`. Details: [`.github/DEPLOYMENT.md`](.github/DEPLOYMENT.md).

## Residual (not claimed fixed)

- `HOSTINGER_FTPS_HOST` is missing on the GitHub repo, so GitHub CD cannot run.
- Leftover HTML from the previous site can still 200 on old blog URLs **without** `<meta name="omnimon-build">`; those paths are not in the current sitemap.
- Published desktop tag remains **v6.6.6**; landing titles may still mention workspace 6.8.0.
- Spanish blog slugs end with `-es`.
- macOS/Windows desktop e2e is not this repo.
