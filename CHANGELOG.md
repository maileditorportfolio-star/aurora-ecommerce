# Changelog

All notable changes to Aurora Commerce are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the project uses
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Changed

- The storefront now runs on Next.js 16.4 and React 19, with `@types/react` 19
  and ESLint 9 serving the new flat config.
- `npm run lint` in the storefront uses the ESLint CLI because `next lint` was
  removed in Next.js 16.

### Fixed

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
