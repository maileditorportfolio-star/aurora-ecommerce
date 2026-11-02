# Verification and reproducibility

This document records how Aurora Commerce is installed, built and tested, which suites can
run without external services, and the results of the last local verification. It is meant
to be readable without running anything: every claim points at a committed script, config
or workflow.

Last verified: **2026-11-02** on tag **`v0.5.2`**. The fresh-clone check below was run
against commit `c32ade0` in an empty directory with no reused `node_modules`, no
`server/.env` and no `client/.env.local`.

## Toolchain

| Tool | Version | Artifact |
| ---- | ------- | -------- |
| Node.js | 20.9+ (CI: 20, local check: 24.19.0) | `.nvmrc`, `package.json#engines`, `ci.yml` |
| npm | 10.9.0 | `package.json#packageManager`, `package-lock.json` |
| MySQL / MariaDB | 8.0 / 10.4+ | `docker-compose.yml`, CI `mysql:8` service |
| OS | CI: `ubuntu-latest`; local check: Windows 11 | `ci.yml` |

## Fresh-clone path

```bash
git clone https://github.com/maileditorportfolio-star/aurora-ecommerce.git
cd aurora-ecommerce
nvm use            # reads .nvmrc
npm ci             # reproducible install from the committed lockfile
npm run test:unit  # 122 API + 235 storefront specs, no database
npm run build      # Prisma generate + Next production build
```

To run the full gate locally:

```bash
npm run verify       # format, lint, typecheck, env docs, coverage
npm run verify:full  # verify + audit + build
```

The database-backed integration suite is opt-in because it needs MySQL:

```bash
mysql -u root -e "CREATE DATABASE aurora_commerce CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
cp server/.env.example server/.env      # set DATABASE_URL for your instance
npm run prisma:deploy
npm run seed
npm run test:integration
```

### Fresh-clone check (2026-11-02, v0.5.2)

Cloned `c32ade0` (tag `v0.5.2`) into an empty directory and ran the documented commands with
no reused `node_modules`, no `server/.env` and no `client/.env.local`:

| Command | Result |
| ------- | ------ |
| `npm ci` | 748 packages installed in 48s, exit 0 |
| `npm run test:unit` | 122 API + 235 storefront specs, exit 0 |
| `npm run build` | Prisma generate + Next.js 16.4.4 build, 14 routes, exit 0 |
| `npm run verify` | format, lint, typecheck, env docs and coverage, exit 0 |

The clean clone wrote `server/junit.xml`, `client/junit.xml`,
`server/coverage/lcov.info` and both `coverage-summary.json` files.

Coverage in the clean clone: API 97.47% statements / 83.33% branches / 96.29% functions /
97.54% lines; storefront 92.95% / 87.08% / 89.29% / 94.42%.

## Isolation matrix

| Target | Command | Needs MySQL | Needs network | Evidence |
| ------ | ------- | ----------- | ------------- | -------- |
| API unit specs | `npm run test:server` | No | No | Prisma injected through `require.cache` in `server/tests/helpers/prisma-mock.js`; no server socket is opened |
| Storefront unit specs | `npm run test:client` | No | No | `jsdom` + Testing Library fixtures in `client/tests/`; no API calls leave the process |
| Both unit suites | `npm run test:unit` | No | No | `server/vitest.config.js` excludes `tests/integration/**` |
| Coverage gates | `npm run test:coverage` | No | No | Thresholds in `server/vitest.config.js` and `client/vitest.config.ts` |
| Database integration | `npm run test:integration` | Yes (migrated + seeded) | localhost only | `server/vitest.integration.config.js`, `server/tests/integration/api.integration.test.js` |
| Production build | `npm run build` | No | No after install | `prisma generate` + `next build` |
| Docker stack | `npm run docker:up` | Containerised | Image pulls | `docker-compose.yml`, `server/Dockerfile`, `client/Dockerfile` |

The unit suites are deliberately dependency-free: they exercise the Express app, middleware,
validation and controllers without a live database, and the storefront without a live API.
Only the integration suite loads the real Prisma client and requires seeded data.

### Machine-readable test reports

Both unit suites emit JUnit XML (`server/junit.xml`, `client/junit.xml`) and coverage in
`text`, `html`, `json-summary` and `lcov` formats. The integration config emits
`server/junit-integration.xml`. CI uploads these as the `unit-test-reports` and
`integration-test-report` artifacts, so a completed run is auditable without re-executing it.

## Last verified results

| Check | Result |
| ----- | ------ |
| `npm run test:unit` | 122 API specs (13 files) + 235 storefront specs (29 files) = 357 passing |
| `npm run test:integration` | 8 passing against MariaDB 10.4.32 |
| API coverage | 97.47% statements, 83.33% branches, 96.29% functions, 97.54% lines (clean clone v0.5.2) |
| Storefront coverage | 92.95% statements, 87.08% branches, 89.29% functions, 94.42% lines |
| `npm run build` | Next.js 16.4.4 production build, 14 routes (13 static, 1 dynamic) |
| `npm run format:check` | Clean |
| `npm run lint` | Clean for both workspaces |
| `npm run typecheck` | Clean (`tsc --noEmit`) |
| `npm run check:env` | 17 server + 2 client variables documented |
| `npm run audit` | 0 high-severity production advisories; 4 moderate inherited from Sentry build tooling |

Coverage thresholds are enforced, not advisory: the API requires 95% statements/lines/
functions and 78% branches; the storefront requires 78% statements, 75% branches/functions
and 79% lines.

## CI mapping

| Workflow / job | What it proves | Reads |
| -------------- | -------------- | ----- |
| `ci.yml` → **Unit gates** | Installs with `npm ci`, verifies the lockfile, formats, lints, typechecks, validates env docs, runs both unit suites with coverage gates | `package-lock.json`, both Vitest configs, `scripts/check-env-example.js`; uploads `unit-test-reports` |
| `ci.yml` → **Build** | Both production builds succeed | Prisma schema, Next config |
| `ci.yml` → **Integration** | Migrations, seed, the real-database specs and a booted `/api/health` against a `mysql:8` service | `server/tests/integration/`, `prisma/migrations/`; uploads `integration-test-report` |
| `ci.yml` → **Docker** | Both images build from the repo root | `server/Dockerfile`, `client/Dockerfile` |
| `codeql.yml` | Static analysis on push, pull request and weekly schedule | source tree |
| `dependency-review.yml` | Rejects high-severity dependency changes in pull requests | lockfile diff |
| `release.yml` | Publishes both images to GHCR on `v*` tags | Dockerfiles |

Every CI job starts from a fresh checkout and runs `npm ci`; the **Unit gates** and
**Build** jobs together are the fresh-clone install + test + build proof. The workflow
triggers on every branch push (`branches: ['**']`) and on pull requests to `main`.

## Engineering history conventions

History is intended to be mineable as self-contained tasks:

- Conventional commit subjects (`feat`, `fix`, `test`, `docs`, `ci`, `chore`, `build`).
- A behaviour change and the spec that pins it land in the same commit. For example,
  `feat(server): add a real MySQL integration suite` contains both the specs and the
  `test:integration` wiring, and `feat(client): extract admin product form and dashboard
  charts` contains the extracted components plus nine specs.
- `CHANGELOG.md` records user-visible changes per release, and releases are tagged.
- `CONTRIBUTING.md` documents the test-first workflow and the pre-PR gate.

See [`docs/adr/`](adr/) for the architecture decisions behind the workspace layout, the
database-free unit suites, the real-database integration suite and the optional error
tracker.
