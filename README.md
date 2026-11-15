# OmniMon Landing

Public Astro static site for [omnimon.com.mx](https://omnimon.com.mx/) (`chochy2001/omnimon_landing`).
Nested locally under `omnimon_apps/macmon/omnimon_landing` and gitignored by both `CAPDESIS/omnimon_apps` and `CAPDESIS/omnimon`.

## Stack

- **Framework:** Astro `7.4.12` (static site generation, `site: 'https://omnimon.com.mx'` in [`astro.config.mjs`](astro.config.mjs))
- **Styling:** Tailwind CSS `^4.3.5` via `@tailwindcss/vite`
- **Runtime / Package Manager:** Bun `1.3.14` (pinned in [`.github/workflows/ci.yml`](.github/workflows/ci.yml)), TypeScript `^6.0.3`
- **Testing & Quality:** `@astrojs/check` `^0.9.12`, `bun test`, Playwright `1.65.0`, `axe-core` `4.14.0`, `sharp` `^0.35.5`
- **Analytics:** PostHog (`posthog-js ^1.450.0`) loaded only after explicit consent in the cookie banner

## Scripts & Local Validation

```bash
bun install --frozen-lockfile
bun run check                 # Typecheck and Astro diagnostics (astro check)
bun run lint                  # Alias for astro check
bun run build                 # Generates OG images (scripts/generate-og.mjs) + astro build
bun run test                  # Unit tests (src/lib) + Playwright responsive, repo_links, and legal_a11y suites
bun run test:coverage         # Unit coverage on src/lib
bun run dev                   # Local Astro dev server
bun run preview               # Preview built static output
bun run generate:og           # Regenerate Open Graph images
bun run optimize:screenshot   # Optimize hero desktop screenshot assets
```

Full CI parity also runs the FTPS and deploy-contract bash tests:

```bash
bash scripts/tests/ftps_identity_test.sh
bash scripts/tests/png_compare_test.sh
bash scripts/tests/robots_check_test.sh
bash scripts/tests/deploy_asset_gate_test.sh
bash scripts/tests/deploy_strict_contract_test.sh
bash scripts/tests/version_json_test.sh
```

## Project Structure

```
omnimon_landing/
├── astro.config.mjs                # Astro + @tailwindcss/vite config (omnimon.com.mx)
├── package.json                    # Scripts and dependencies (Astro 7.4.12, Tailwind 4.3.5)
├── public/                         # Static assets (favicon, fonts, images, .htaccess, robots.txt)
├── src/
│   ├── consts.ts                   # OMNIMON_VERSION, PUBLISHED_VERSION, RELEASE_DATE ('6.8.1', '5 Nov 2026')
│   ├── layouts/Layout.astro        # Shared layout, SEO meta, <meta name="omnimon-build"> fingerprint
│   ├── components/                 # HomePage, LanguageSwitcher, LegalDoc, ThemeToggle, CookieBanner, PostHogInit
│   ├── lib/                        # Locale, release index, legal, consent, theme helpers + *.test.ts unit suites
│   ├── styles/global.css           # Tailwind CSS 4 theme & tokens
│   └── pages/
│       ├── index.astro             # English home (/)
│       ├── en/index.astro          # Redirects /en/ -> /
│       ├── es/index.astro          # Spanish home (/es/)
│       ├── privacy.astro / terms.astro / cookies.astro (+ /es/*)
│       ├── blog/                   # Release posts v6.4.1 .. v6.8.1 (EN)
│       ├── es/blog/                # Release posts v6.4.1 .. v6.8.1 (ES, *-es)
│       └── 404.astro               # Branded 404 page
├── scripts/                        # OG generator, screenshot optimizer, FTPS/PNG/robots/version.json helpers
│   └── tests/                      # Playwright TS suites + 6 bash deploy contract tests
└── .github/
    ├── DEPLOYMENT.md               # Detailed Hostinger FTPS & parity verification runbook
    └── workflows/
        ├── ci.yml                  # Landing CI (ubuntu-latest)
        └── deploy-hostinger.yml    # Deploy landing (Hostinger FTP)
```

## Release Sync (`CAPDESIS/omnimon` `v6.8.1`)

- [`src/consts.ts`](src/consts.ts) pins `OMNIMON_VERSION = '6.8.1'`, `PUBLISHED_VERSION = '6.8.1'`, and `RELEASE_DATE = '5 Nov 2026'`, matching the `v6.8.1` GitHub Release published `2026-11-05` on `CAPDESIS/omnimon` (`OmniMon-6.8.1-macOS-Universal.dmg`, `OmniMon-6.8.1-Windows.msi`, Linux `.AppImage`/`.deb`/`.rpm`, `releases.json`, `SHA256SUMS.txt`).
- [`src/lib/releases.ts`](src/lib/releases.ts) and the EN/ES blog pages list published releases newest-first (`v6.8.1` down to `v6.4.1`; Spanish slugs end in `-es`).
- Repository links on served pages must point to `CAPDESIS/omnimon` (enforced by [`scripts/tests/repo_links.test.ts`](scripts/tests/repo_links.test.ts)), while the macOS Homebrew tap command remains `brew tap chochy2001/omnimon` (`chochy2001/homebrew-omnimon`).

## CI & Live Deploy (`https://omnimon.com.mx`)

- **CI ([`.github/workflows/ci.yml`](.github/workflows/ci.yml))**: Runs on GitHub-hosted `ubuntu-latest` (`bun install --frozen-lockfile`, `bun audit`, `bun run build`, Playwright Chromium install, `bun run test`, and all 6 `scripts/tests/*_test.sh` contract suites).
- **CD ([`.github/workflows/deploy-hostinger.yml`](.github/workflows/deploy-hostinger.yml))**: Runs on GitHub-hosted `ubuntu-latest` (`environment: production`), triggered automatically via `workflow_run` when `Landing CI` succeeds on a push to `main` (or manually via `workflow_dispatch` with a 40-char `release_sha`).
- **Verification guarantees**:
  - Strict FTPS TLS hostname verification (`HOSTINGER_FTPS_HOST` under `*.hstgr.io` via `--connect-to` to `FTP_HOST`, `scripts/ftps_identity.sh`) before sending credentials.
  - Anti-rollback check against live `<meta name="omnimon-build">` before uploading.
  - Post-upload verification of `<meta name="omnimon-build">`, `/version.json`, route status codes (`200` on built pages, `404` on missing paths, `403`/`404` on dotfiles), byte-for-byte SHA-256 asset checks, PNG structural checks (`scripts/png_compare.sh`), and Cloudflare-managed `/robots.txt` directive checks (`scripts/robots_check.sh`).
- Full operator secrets/variables and runbook: [`.github/DEPLOYMENT.md`](.github/DEPLOYMENT.md).
