# CLAUDE.md

<!-- CAPDESIS INFRA START -->
## CAPDESIS Architecture And Delivery Policy

This repo participates in the shared CAPDESIS workspace architecture. Keep this
block aligned with the canonical local docs under
`/Users/jorge/Documents/Apps/docs/`:

- `TAILSKILL_NEW_VPS_HANDOFF.md`: current VPS, Tailscale, CI runner, staging,
  production, storage, and rollback topology.
- `STAGING_RELEASE_POLICY.md`: CI -> staging -> production release gates.
- `PRODUCTION_ALERTING_RUNBOOK.md`: centralized monitoring and alert routing.
- `APP_RELEASE_READINESS_AUDIT.md`: app deploy workflow state and staging gaps.
- `SCALING_AND_LOAD_TEST_PLAN.md`: staging-first load testing and scaling
  decision rules.
- `INFRASTRUCTURE_COSTS.md`: verified VPS cost baseline and annual estimates.

Current operating model:

- Linux CI/CD runs on `ci-runner-node` (`vmi3166182`, public
  `185.237.252.45`, Tailscale `100.120.6.51`) using explicit GitHub Actions
  labels such as `[self-hosted, ci-runner-node, test-light]`,
  `[self-hosted, ci-runner-node, build-heavy]`, and
  `[self-hosted, ci-runner-node, deploy-only]`.
- Staging deploys target `staging-node` (`vmi2875906`, public
  `144.126.159.214`, Tailscale `100.97.107.71`) with staging-only secrets,
  staging domains/routes, and health/smoke/load validation.
- Production stays on `web-app-proxy` / `ancare` (`100.77.243.93`) with the
  shared Traefik edge, production Docker stacks, runtime volumes, and customer
  traffic.
- Databases stay private on `db-architecture` (`100.88.85.128`). Backups and
  storage validation live on `storage-backups` (`100.120.133.78`) and
  `capdesis-nas` (`100.124.183.32`).
- Production promotion happens manually on Monday morning in
  `America/Mexico_City` from the last known-good staging SHA. If Monday is a
  holiday, staging is red, alerts are open, or no operator is available, skip
  the promotion rather than promoting an unverified build.
- `main` may deploy automatically to staging only after CI passes. Production
  must be blocked by failed CI, failed staging deploy, failed health checks,
  failed smoke/k6 thresholds, missing backups for data-changing releases,
  unresolved P0/P1 alerts, or unavailable monitoring.
- Production and staging alerts should converge in `monitor.capdesis.com` /
  Alertmanager/Grafana. Open P0/P1 alerts block Monday promotion.
- Do not move Traefik, production databases, production secrets, or runtime
  production volumes onto `ci-runner-node` or `staging-node` without a
  separate migration plan and validation evidence.

Before changing deploy behavior in this repo, verify the current workflow
labels, staging target, production target, secrets scope, and rollback path
against the canonical docs above.
<!-- CAPDESIS INFRA END -->
