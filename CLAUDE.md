# CLAUDE.md

<!-- CAPDESIS INFRA START -->
## CAPDESIS Architecture And Delivery Policy

This repository (`chochy2001/omnimon_landing`) is the **public** Astro static
website for `https://omnimon.com.mx`, nested locally inside the OmniMon
workspace (`omnimon_apps/macmon/omnimon_landing`). Keep deployment behavior
aligned with [`.github/DEPLOYMENT.md`](.github/DEPLOYMENT.md) and the active
workflows under `.github/workflows/`.

Current operating model:

- **Public GitHub-hosted CI/CD only (`ubuntu-latest`).** Because this repository
  is public, both `.github/workflows/ci.yml` (`Landing CI`) and
  `.github/workflows/deploy-hostinger.yml` (`Deploy landing (Hostinger FTP)`)
  run exclusively on GitHub-hosted `ubuntu-latest` runners (`runner.environment == 'github-hosted'`).
  Never schedule jobs from this repo on private CAPDESIS self-hosted runners
  (which hold production SSH/Docker access).
- **No staging environment.** There is no staging server, staging SHA, or
  Monday-only promotion window for `omnimon_landing`.
- **Direct SHA-pinned production deployment to Hostinger FTPS.** Every push to
  `main` that passes `Landing CI` triggers `deploy-hostinger.yml` via
  `workflow_run`, checks out that exact CI-green commit SHA, enforces strict
  FTPS TLS verification (`HOSTINGER_FTPS_HOST` + `FTP_HOST`), prevents
  anti-rollback regressions on automatic pushes, uploads `dist/` to
  `https://omnimon.com.mx`, and verifies `<meta name="omnimon-build">`,
  `/version.json`, and asset integrity on the live origin.
- **Manual promotion / rollback:** Use `workflow_dispatch` on
  `deploy-hostinger.yml` with a 40-character `release_sha` ancestor of
  `origin/main` that already has a green `Landing CI` run.
- **Product repo link rule:** App links in served pages must point to
  `CAPDESIS/omnimon`, while Homebrew install instructions keep
  `brew tap chochy2001/omnimon` (`chochy2001/homebrew-omnimon`), enforced by
  `scripts/tests/repo_links.test.ts`.
<!-- CAPDESIS INFRA END -->
