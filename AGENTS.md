# AGENTS.md — Aurora Commerce (local memory)

Project memory for coding agents working in this repo. Read this first; it saves a
full exploration pass. `README.md` remains the human-facing documentation.

## Project snapshot

- **Repo**: `aurora-ecommerce` (Aurora Cyber) — npm workspaces monorepo, GitHub repo `maileditorportfolio-star/aurora-ecommerce`.
- **client/** — storefront: **Next.js 16.4.2 (App Router, Turbopack) + React 19.3 + TypeScript 5.7**, Tailwind 4, Zustand, Framer Motion, Vitest 5 + React Testing Library.
- **server/** — API: **Express 4 + Socket.IO 4 + Prisma 6 + MySQL 8**, Zod, Pino, JWT (`jsonwebtoken`) + `bcryptjs`.
- **Upgrade status**: the Next 16 / React 19 upgrade is **done and green** (commit `23580a5`). Verified locally on 2026-10-22: `lint` clean, `tsc --noEmit` clean, `next build` succeeds (14 routes), 82 server specs + 20 client specs pass.
- **Toolchain**: Node 20.9+ (CI uses Node 20; local machine runs 24.19.0), npm 9+ (10.9.0).

## Quick start

```powershell
# 1. deps (single install at the root covers both workspaces)
npm install

# 2. env files (both are git-ignored; copy once)
Copy-Item server/.env.example server/.env      # edit DATABASE_URL + JWT_SECRET
Copy-Item client/.env.example client/.env.local  # NEXT_PUBLIC_API_URL / NEXT_PUBLIC_SOCKET_URL

# 3. database (needs MySQL 8 / MariaDB 10.6 running)
#    CREATE DATABASE aurora_commerce CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
npm run prisma:migrate
npm run seed

# 4. run both apps
npm run dev            # storefront :3000, API :4000
```

- Storefront <http://localhost:3000> · API health <http://localhost:4000/api/health>
- Seeded logins: `admin@aurora.com` / `customer@aurora.com`, password `aurora123` (change before any public deploy).
- Docker alternative: `npm run docker:up` (MySQL 8 + API + storefront), `npm run docker:down`.

## Verify before you hand work back

Run from the repo root; this mirrors the CI gates.

```powershell
npm run format:check   # Prettier
npm run lint           # eslint (server) + eslint flat config (client)
npm run typecheck      # tsc --noEmit, client only
npm test               # 82 server + 20 client specs, no database needed
npm run build          # prisma generate + next build
```

`npm run lint:fix` / `npm run format` rewrite files. The CI `Dependency audit` step
is `continue-on-error` (Prisma/Vitest dev-tooling advisories remain).

## Layout map

| Path | What lives there |
| --- | --- |
| `client/app/` | App Router routes: `page.tsx` (home), `products/`, `cart/`, `checkout/`, `account/`, `login/`, `register/`, `admin/` |
| `client/components/` | `admin/ chat/ home/ layout/ motion/ product/ ui/` |
| `client/lib/` | `api.ts` (typed fetch wrapper, token in `localStorage` key `aurora_token`), `utils.ts` (currency, dates) |
| `client/store/` | Zustand: `auth.ts`, `cart.ts` (persisted) |
| `client/types/index.ts` | Shared TS types |
| `client/tests/` | Vitest + RTL specs + `setup.ts` |
| `server/src/` | `app.js` (Express app, CORS), `index.js` (entry), `config/` (env, prisma, logger), `controllers/`, `middleware/` (auth guards, error), `routes/`, `services/token.service.js`, `socket/`, `utils/` (ApiError, asyncHandler), `validation/schemas.js` |
| `server/prisma/` | `schema.prisma`, `migrations/`, `seed.js` (idempotent) |
| `server/tests/` | 82 Vitest specs with a Prisma mock harness |
| `.github/workflows/ci.yml` | quality → build → docker jobs |

## Conventions

- **API envelope**: every response is `{ success, data | message, details }`. `client/lib/api.ts` unwraps `payload.data` and throws `ApiError` (status + field details).
- **Server**: validate every body with Zod *before* it reaches Prisma; wrap async handlers in `asyncHandler`; throw `ApiError` for expected failures; log with Pino (never `console.log`).
- **Client**: Server Components by default; add `'use client'` only where state/handlers need it. Call the API through `client/lib/api.ts`, never raw `fetch` against a literal URL.
- **Styling**: Tailwind utility classes with the tokens in `client/tailwind.config.js`; Framer Motion for transitions.
- **Formatting**: Prettier — single quotes, semicolons, trailing commas, 100 cols, 2-space indent, LF.
- **Naming**: kebab-case files/folders, PascalCase components, camelCase vars.
- **Git**: Conventional Commits (`feat(server):`, `chore(client):`, `fix(build):`), one logical change per commit, never commit `.env` or secrets.

## Next.js 16 notes (this is not Next 14)

Next 16 removed/renamed APIs. Before changing storefront code, read the bundled docs —
they ship with the installed package and are the source of truth:

- `node_modules/next/dist/docs/` (hoisted to the **repo root** in this workspace, not `client/`)
- Upgrade guide: `node_modules/next/dist/docs/01-app/02-guides/upgrading/version-16.md`

Key facts already applied in this repo:

- `next lint` is **removed** → the client uses the ESLint 9 flat config (`client/eslint.config.mjs` + `eslint-config-next/core-web-vitals`) and the plain `eslint .` CLI.
- **Turbopack is the default** bundler for `next dev` *and* `next build`.
- **Async request APIs**: `params`, `searchParams`, `cookies()`, `headers()` are Promises — always `await` them.
- `middleware.ts` → **`proxy.ts`** (none in this repo today).
- `cacheComponents` (PPR / `use cache`) is **opt-in** via `next.config.js`; it is off here, so pages stay statically prerendered (`○` static, `ƒ` dynamic).
- `next/image` defaults changed (`qualities`, `imageSizes`, `minimumCacheTTL`); `images.domains` and `next/legacy/image` are deprecated.
- Removed: AMP support, runtime configuration, `experimental.dynamicIO` / `experimental.useCache`.
- `client/next-env.d.ts` is rewritten by the CLI: `next dev` points at `.next/dev/types/*`, `next build` at `.next/types/*`. The committed version is the **dev** variant — after a build, `git checkout -- client/next-env.d.ts` to keep the tree clean.
- `client/AGENTS.md` contains an auto-generated block that `next dev` re-adds; keep it committed, do not hand-edit it.
- The root `package.json` description still says "Next.js 14" — stale, but harmless.

## Environment variables

`server/.env`: `PORT=4000`, `NODE_ENV`, `DATABASE_URL` (`mysql://user:pass@localhost:3306/aurora_commerce`),
`JWT_SECRET` (long random string), `JWT_EXPIRES_IN=7d`, `BCRYPT_ROUNDS=12`, `AUTH_RATE_LIMIT=20`,
`CLIENT_URL=http://localhost:3000`, `CORS_ORIGINS` (comma-separated allow-list),
`SHIPPING_FLAT_RATE=60`, `SHIPPING_FREE_THRESHOLD=5000`, `TAX_RATE=0`, `LOG_LEVEL=debug`.

`client/.env.local`: `NEXT_PUBLIC_API_URL=http://localhost:4000`, `NEXT_PUBLIC_SOCKET_URL=http://localhost:4000`.

`NEXT_PUBLIC_*` values are inlined at build time — changing one requires a rebuild, and a
dev server restart is needed for the value to be picked up.

## Gotchas

- The **server** needs a live MySQL to boot; the **tests** mock Prisma and run without one.
- `npm run build` runs `prisma generate` first, so a broken `DATABASE_URL` in `server/.env` can fail the build.
- The storefront is a client-side-heavy app: most routes are static shells that fetch after mount, so an empty catalogue means the API is down, not a Next bug.
- `output: 'standalone'` in `client/next.config.js` with `outputFileTracingRoot` at the repo root — the Docker build context must be the **repo root**, not `client/`.
- `client/public/` must exist for the storefront image (fixed in commit `9cfb8bf`).
- Changelog discipline: `CHANGELOG.md` has an `[Unreleased]` section — add entries there for user-visible changes.
