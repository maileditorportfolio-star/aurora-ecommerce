# Changelog

All notable changes to Aurora Commerce are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the project uses
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Changed

- Refreshed the fresh-clone verification for `v0.5.2`: `npm ci`, `npm run test:unit`,
  `npm run build` and `npm run verify` all exited 0 in an empty clone.

## [0.5.2] - 2026-11-02

### Added

- JUnit XML reporters for both unit suites and the integration suite, plus
  `json-summary` and `lcov` coverage output. CI uploads them as the `unit-test-reports`
  and `integration-test-report` artifacts.

### Changed

- Recorded the fresh-clone verification (`npm ci`, `npm run test:unit`, `npm run build`,
  `npm run verify`) and its coverage numbers in `docs/verification.md`.

## [0.5.1] - 2026-11-02

### Added

- `docs/verification.md` with the fresh-clone path, the isolation matrix, the last verified
  results and the CI job mapping, plus four architecture decision records under `docs/adr/`.
- `.nvmrc` and `package.json#packageManager` pin the Node and npm versions used by CI.
- `npm run test:unit`, `npm run verify` and `npm run verify:full` make the database-free and
  full verification paths explicit.
- A pull request template with the test-evidence checklist and the feature-plus-spec rule.

### Changed

- CI job names now state what needs a database (`Unit gates … no database`, `Integration —
  real MySQL specs and API smoke test`) and the test step is labelled accordingly.

## [0.5.0] - 2026-11-02

### Added

- A real MySQL integration suite (`server/tests/integration/`) with eight Supertest specs
  covering health, product reads, registration/login, auth guards, request validation and
  a checkout that decrements stock. `npm run test:integration` uses a dedicated Vitest
  config, and the CI integration job runs it after migrations and seeding.
- `ProductForm` (`client/components/admin/product-form.tsx`) extracted from the admin
  products page, with pure draft/payload helpers and matching specs.
- `RevenueTrendChart`, `OrdersByStatusChart` and `TopProductsChart`
  (`client/components/admin/dashboard-charts.tsx`) extracted from the admin dashboard,
  with specs for populated and empty data.
- A Dependency Review workflow for pull requests, a CI step that verifies
  `package-lock.json` did not change after `npm ci`, and `npm run deps:check`
  (`npm outdated --workspaces`).
- `npm run check:env`, a dependency-free script that fails when a `process.env` variable
  used by either workspace is missing from its `.env.example`, plus specs for it and a
  blocking CI step.
- A tag-driven release workflow that publishes the API and storefront images to GitHub
  Container Registry.
- A CodeQL workflow that scans the JavaScript/TypeScript source on pushes, pull requests
  and a weekly schedule.
- Coverage reports are uploaded as a CI artifact so regressions can be inspected without
  re-running the suite.
- `SECURITY.md` with the supported versions, the private reporting flow and the scope worth
  testing.

### Changed

- The root `.env.example` now mirrors every server runtime variable (database, ports,
  bcrypt/rate-limit, shipping and tax) so a root `.env` is self-contained for
  `npm run dev` and `npm start`.
- Admin pages now delegate the product form and dashboard charts to reusable components
  instead of mixing data fetching, form state and chart rendering in one file.
- Documented where per-workspace runtime dependencies live (`server/package.json` and
  `client/package.json`); the root manifest only contains workspace tooling.
- Moved `concurrently` to the root `dependencies` block because the production `npm start`
  script invokes it.

### Fixed

- Corrected the API spec count in the README to the current 122 specs.
- Split the cart-drawer close-path spec into three isolated cases so it no longer
  re-opens the drawer mid exit-animation and can flake.
- Waited for the account redirect with `waitFor` instead of asserting immediately after
  the loading state settles, removing a timing race.

## [0.4.1] - 2026-10-24

### Added

- An unauthenticated `GET /api/metrics` observability endpoint that returns the process uptime, RSS/heap usage, the live Node version, a small catalogue snapshot (users, active products, orders, categories) and an ISO timestamp, plus the matching server specs.

### Changed

- Bumped `zod` to `^4.6.7` in the API workspace to close the GHSA-mrhx-c7xc-m3w5 advisory (oversized constrained collections could exhaust memory during validation).

### Fixed

- Restored the README test counts (112 API specs, 224 storefront specs) and documented the `/api/health` and `/api/metrics` observability endpoints.

## [0.4.0] - 2026-10-23

### Added

- Structured error tracking via an optional Sentry adapter (`server/src/config/error-tracker.js`). It stays disabled when `SENTRY_DSN` is empty, reports unhandled rejections and 5xx responses, and flushes on shutdown.
- `@vitest/coverage-v8` in both workspaces so `npm run test:coverage` runs server-side and client-side coverage.
- Enforced coverage gates: the API must keep 95% statements/lines/functions and 78% branches; the storefront 78% statements, 75% branches/functions and 79% lines.
- Server specs for error tracking, the error middleware and the token service, plus storefront specs for the admin console (dashboard, analytics, orders, products, customers), both Zustand stores, `lib/api` and `lib/utils`, and the shared layout, cart drawer, product and auth components.
- A MySQL-backed CI integration job that applies migrations, seeds the database and waits for `/api/health`.
- Root `prisma:deploy` script and `SENTRY_*` entries in both `.env.example` files and `docker-compose.yml`.

### Changed

- CI now runs `npm run test:coverage` instead of `npm test`, and the production-dependency audit is blocking.
- The storefront now runs on Tailwind CSS 4 (`@tailwindcss/postcss`, `@config`/`@source` in `globals.css`, legacy `tailwind.config.js` tokens kept via `@config`), upgrading from Tailwind 3.
- Both workspaces run Vitest 5 (server specs + client specs), bumped from Vitest 3.
- `deepmerge-ts` is pinned forward through a root npm `overrides` entry, clearing the remaining high-severity advisory in the production dependency tree.
- All packages bumped to `0.4.0`; root package description updated to Next.js 16.

### Fixed

- The storefront now runs on Next.js 16.4 and React 19, with `@types/react` 19
  and ESLint 9 serving the new flat config.
- `npm run lint` in the storefront uses the ESLint CLI because `next lint` was
  removed in Next.js 16.
- The mobile navigation closes from the link handler instead of an effect that
  set state on every route change.
- The product detail page tracks the slug it has loaded, so navigating between
  products no longer issues a synchronous state update before fetching and can
  no longer apply a stale response.

## [0.2.1] - 2026-10-22

### Added

- Vitest test suites for the API (82 specs) and the storefront (20 specs), and
  root `test`, `test:server`, `test:client` and `test:coverage` scripts.
- Structured Pino logging with request logging, status-based severity and
  redaction of credentials, cookies and tokens.
- Health endpoint that checks the database connection and reports `503` when it
  is unreachable.
- Configurable `BCRYPT_ROUNDS` and `AUTH_RATE_LIMIT` environment variables.
- Prettier configuration plus `format` and `format:check` scripts, and ESLint
  across both workspaces.
- Multi-stage Dockerfiles for the API and the storefront, with a Compose stack
  that runs MySQL 8, the API and the storefront together.
- GitHub Actions CI (format, lint, typecheck, tests, audit, builds, Docker) and
  Dependabot configuration.
- `CONTRIBUTING.md` and root `.env.example` for Docker Compose.

### Changed

- Password hashing cost and the auth rate limit are now read from the
  environment instead of being hard-coded.
- `morgan` was replaced by `pino-http` for HTTP logging.
- The storefront builds in Next.js standalone output mode.

### Fixed

- Admin product queries no longer select a non-existent `sold` field.
- Password changes now persist through `prisma.user.update` instead of a
  non-existent `save()` call.
- Missing `Viewport` type import in the root layout.
- The product catalogue is split into a server page and a client component so
  it builds with the App Router.

## [0.1.0] - 2025-01-01

### Added

- Initial release: Next.js 14 storefront, Express + Prisma + MySQL API, JWT
  auth with role-based access, admin console, Socket.IO support chat and a
  seeded demo catalogue.
