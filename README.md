# OmniMon Landing

Public Astro site for [omnimon.com.mx](https://omnimon.com.mx/).
Git: `chochy2001/omnimon_landing`. Nested under `omnimon_apps/macmon/omnimon_landing` and gitignored by the parent `CAPDESIS/omnimon` repo.

## Stack

- Astro 7 + Tailwind 4 + Bun
- Site URL: `https://omnimon.com.mx` (`astro.config.mjs`)
- Analytics: PostHog only after the cookie banner

## Commands

```bash
bun install
bun run test      # bun test src/lib
bun run build
bun run preview
```

## Verified 2026-09-25 UTC

Live origin tracks `origin/main` via GitHub CD: every merge to `main` with green CI is promoted and read back (fingerprint, smoke, assets). First pipeline deploy 2026-09-25: `c4b9cc7` via run 36163409304 (42 files, 20 fingerprinted pages, 19 assets, 0 console errors in headless Chrome); before it, the origin served `2ca253f9` from a manual FTPS upload. Leftover Hostinger blog HTML (v6.3.0 and older) was deleted; those URLs now serve the product 404.

| Surface | Status |
|---------|--------|
| `/` English home | 200, Layout, EN\|ES, theme, screenshot |
| `/es/` Spanish home | 200 full page (not a 301) |
| `/en` `/en/` | 301 → `/` |
| Unknown path | 404 **product** page (`ErrorDocument 404 /404.html`) |
| Favicon | OmniMon gear+cyan SVG + app ICO (not Astro starter `M50.4 78.5`) |
| Blog index | Only posts that exist as Astro pages (v6.4.1-v6.8.0 EN/ES) |
| Legal | `/privacy` `/terms` `/es/privacy` `/es/terms` |

`src/consts.ts` version is **6.8.0** (workspace). Latest published GitHub tag for the desktop app is still **v6.6.6** (a Universal DMG exists for that tag; there is no 6.8.0 binary). Download CTAs say "Download latest" / "Descargar ultima version" and point at `releases/latest`. Spanish blog slugs end with `-es` (example: `/es/blog/v6-8-0-release-es/`).

## Deploy

GitHub Actions: `.github/workflows/deploy-hostinger.yml` (GitHub-hosted, FTPS strict).
Operator secrets: `HOSTINGER_FTPS_HOST` (TLS name under `*.hstgr.io`, **not** the IP, need not resolve), `FTP_HOST` (TCP address, the pool IP), `FTP_USER`, `FTP_PASSWORD`. Variables: `FTP_PORT=21`, `FTP_REMOTE_DIR=./` (measured 2026-09-25: the FTP account is jailed at the domain root).

GitHub CD is live: every push to `main` with green CI promotes that exact SHA to the origin and reads it back (fingerprint, smoke, assets). Details: [`.github/DEPLOYMENT.md`](.github/DEPLOYMENT.md).

## Residual (operator)

- Published desktop tag remains **v6.6.6**; landing titles may still mention workspace 6.8.0.
- Cutting a `v6.8.0` Universal DMG is a release decision, not a landing deploy.
