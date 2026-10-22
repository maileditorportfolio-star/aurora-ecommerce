# Aurora Commerce

[![CI](https://github.com/maileditorportfolio-star/aurora-ecommerce/actions/workflows/ci.yml/badge.svg)](https://github.com/maileditorportfolio-star/aurora-ecommerce/actions/workflows/ci.yml)

A production-ready, full-stack e-commerce platform: a **Next.js 14** storefront paired with an **Express + Prisma + MySQL** API, complete with JWT auth, role-based admin controls, live chat, and a seeded demo catalogue. The API is covered by **77 Vitest specs** and the storefront by **20 React Testing Library specs**, all runnable without a database.

This repository contains **source code only**. No database, no credentials, and no runtime data are committed — you create your own environment from the provided `.env.example` files.

---

## Table of contents

1. [Features](#features)
2. [Tech stack](#tech-stack)
3. [Requirements](#requirements)
4. [Download the project](#download-the-project)
5. [Local setup](#local-setup)
6. [Project structure](#project-structure)
7. [Available scripts](#available-scripts)
8. [Testing](#testing)
9. [Customizing the project](#customizing-the-project)
10. [API reference](#api-reference)
11. [Deployment](#deployment)
12. [Docker](#docker)
13. [Troubleshooting](#troubleshooting)

---

## Features

### Storefront (Next.js 14 App Router)

- **Home** — hero, animated aurora gradient, feature grid, product highlights
- **Catalogue** (`/products`) — search, category filter, price/rating sorting, responsive grid
- **Product detail** (`/products/[slug]`) — gallery, discount badge, stock state, related products
- **Cart** — persistent drawer + cart page, quantity editing, live totals
- **Checkout** — shipping details, COD / bKash / Nagad / card options, order placement
- **Account** (`/account`) — profile, order history, password change
- **Admin console** (`/admin`) — dashboard, orders board, products CRUD, customers, analytics
- **Support chat** — floating widget backed by Socket.IO
- **Motion** — Framer Motion transitions and scroll reveals throughout

### API (Express)

- **JWT auth** — register, login, profile, change password
- **Role-based access control** — `CUSTOMER` and `ADMIN` guards on every privileged route
- **Zod validation** — every request body is schema-validated before it reaches the database
- **Prisma + MySQL** — typed data layer with migrations and idempotent seed data
- **Socket.IO** — real-time chat messages
- **Security** — Helmet, CORS allow-list, rate limiting on auth endpoints, bcrypt password hashing
- **Consistent responses** — `{ success, data | message, details }` envelope across every endpoint

---

## Tech stack

| Layer     | Technology                                             |
| --------- | ------------------------------------------------------ |
| Frontend  | Next.js 14.2 (App Router), React 18, TypeScript        |
| Styling   | Tailwind CSS, Framer Motion, Lucide icons               |
| State     | Zustand (cart + auth, persisted to `localStorage`)      |
| Backend   | Node.js, Express 4, Socket.IO                           |
| Database  | MySQL 8 / MariaDB via Prisma 6                          |
| Auth      | `jsonwebtoken` (JWT) + `bcryptjs`                       |
| Validation| Zod                                                     |
| Security  | Helmet, `express-rate-limit`, CORS                      |

---

## Requirements

- **Node.js 18.17+** (developed on 20/24)
- **npm 9+**
- **MySQL 8+** or **MariaDB 10.6+** running locally
- A MySQL user with permission to create databases (or an existing empty database)

Check your versions:

```bash
node -v
npm -v
mysql --version
```

---

## Download the project

### Option A — clone with Git (recommended)

```bash
git clone https://github.com/maileditorportfolio-star/aurora-ecommerce.git
cd aurora-ecommerce
```

Already have it locally but want the latest? Inside the project folder:

```bash
git pull origin main
npm install
```

### Option B — download as a ZIP

1. Open the repository on GitHub: <https://github.com/maileditorportfolio-star/aurora-ecommerce>
2. Click **Code → Download ZIP**
3. Unzip it and rename the folder to `aurora-ecommerce`
4. Open a terminal inside that folder

```bash
cd aurora-ecommerce
npm install
```

> The project uses **npm workspaces**, so a single `npm install` at the repository root installs the client and server dependencies together.

---

## Local setup

### 1. Install dependencies

```bash
npm install
```

### 2. Create the database

```sql
CREATE DATABASE aurora_commerce CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 3. Configure environment variables

**Server** — copy `server/.env.example` to `server/.env`:

```bash
# Windows PowerShell
Copy-Item server/.env.example server/.env

# macOS / Linux
cp server/.env.example server/.env
```

Edit `server/.env`:

```ini
PORT=4000
NODE_ENV=development

# Database (MySQL / MariaDB)
DATABASE_URL="mysql://root:yourpassword@localhost:3306/aurora_commerce"

# Auth — CHANGE THIS to a long random string
JWT_SECRET="change-me-to-a-long-random-string"
JWT_EXPIRES_IN="7d"

# Security
BCRYPT_ROUNDS=12
AUTH_RATE_LIMIT=20

# Client
CLIENT_URL="http://localhost:3000"
CORS_ORIGINS="http://localhost:3000,http://127.0.0.1:3000"

# Storefront
SHIPPING_FLAT_RATE=60
SHIPPING_FREE_THRESHOLD=5000
TAX_RATE=0

# Logging (trace, debug, info, warn, error, fatal)
LOG_LEVEL=debug
```

**Client** — copy `client/.env.example` to `client/.env.local`:

```bash
Copy-Item client/.env.example client/.env.local   # Windows
cp client/.env.example client/.env.local           # macOS / Linux
```

```ini
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_SOCKET_URL=http://localhost:4000
```

> `.env` and `.env.local` are git-ignored — your secrets never leave your machine.

### 4. Create the schema and seed demo data

```bash
npm run prisma:migrate   # applies migrations to your database
npm run seed             # inserts demo categories, products and accounts
```

Optional — browse the data in a GUI:

```bash
npm run prisma:studio
```

### 5. Run both apps

```bash
npm run dev
```

- Storefront → <http://localhost:3000>
- API → <http://localhost:4000/api/health>

### Demo accounts (created by the seed)

| Role     | Email                  | Password    |
| -------- | ---------------------- | ----------- |
| Admin    | `admin@aurora.com`     | `aurora123` |
| Customer | `customer@aurora.com`  | `aurora123` |

> Change or delete these before deploying anywhere public — see [Customizing the project](#customizing-the-project).

---

## Project structure

```
aurora-ecommerce/
├── .github/
│   ├── workflows/ci.yml        # Format, lint, typecheck, test, build, Docker
│   └── dependabot.yml          # Weekly npm / actions / Docker updates
├── client/                     # Next.js 14 storefront
│   ├── app/                    # App Router routes
│   │   ├── page.tsx            # Home
│   │   ├── products/           # Catalogue + product detail
│   │   ├── cart/  checkout/  account/
│   │   ├── login/  register/
│   │   ├── admin/              # Admin console (layout, orders, products, customers, analytics)
│   │   ├── layout.tsx          # Root layout, fonts, metadata, viewport
│   │   └── globals.css         # Tailwind layers + custom utilities
│   ├── components/
│   │   ├── admin/  chat/  home/  layout/  motion/  product/  ui/
│   ├── lib/                    # api.ts (typed API client), utils.ts (currency, dates)
│   ├── store/                  # Zustand stores: auth.ts, cart.ts
│   ├── tests/                  # Vitest setup + React Testing Library specs
│   ├── types/                  # Shared TypeScript types
│   ├── tailwind.config.js      # Theme tokens (colors, fonts, shadows, animations)
│   ├── vitest.config.ts
│   ├── Dockerfile
│   └── next.config.js
│
├── server/                     # Express + Prisma API
│   ├── prisma/
│   │   ├── schema.prisma       # Data model
│   │   ├── migrations/         # Versioned SQL migrations
│   │   └── seed.js             # Idempotent demo seed
│   ├── src/
│   │   ├── index.js            # Entry point
│   │   ├── app.js              # Express app, middleware, CORS
│   │   ├── config/             # env.js, prisma.js, logger.js (Pino)
│   │   ├── controllers/        # auth, product, order, admin, chat
│   │   ├── middleware/         # auth.js (guards), error.js
│   │   ├── routes/             # Route definitions
│   │   ├── services/           # token.service.js
│   │   ├── socket/             # Socket.IO chat
│   │   ├── utils/              # ApiError, asyncHandler
│   │   └── validation/         # schemas.js (Zod)
│   ├── tests/                  # Vitest specs + Prisma mock harness
│   ├── vitest.config.js
│   ├── Dockerfile
│   └── .env.example
│
├── docker-compose.yml          # MySQL 8 + API + storefront
├── .prettierrc                 # Shared formatting rules
├── package.json                # npm workspaces root + shared scripts
└── .gitignore
```

---

## Available scripts

Run from the repository root unless noted.

| Command                  | What it does                                                |
| ------------------------ | ----------------------------------------------------------- |
| `npm run dev`            | Runs API (nodemon) and storefront (`next dev`) together      |
| `npm run dev:server`     | API only, on `:4000`                                          |
| `npm run dev:client`     | Storefront only, on `:3000`                                   |
| `npm run build`          | Prisma generate + production build of both workspaces         |
| `npm start`              | Runs the built API and the built storefront                   |
| `npm run lint`           | ESLint for the API and `next lint` for the storefront          |
| `npm run format`         | Rewrites every file with Prettier                             |
| `npm run format:check`   | Fails if any file is not Prettier-formatted                   |
| `npm run typecheck`      | `tsc --noEmit` for the client                                 |
| `npm test`               | Runs the API and storefront suites                            |
| `npm run test:server`    | API specs only (Vitest + Supertest)                          |
| `npm run test:client`    | Storefront specs only (Vitest + Testing Library)             |
| `npm run test:coverage`  | Both suites with an HTML coverage report                     |
| `npm run audit`          | `npm audit --audit-level=high --omit=dev`                    |
| `npm run prisma:migrate` | Create/apply a development migration                         |
| `npm run prisma:deploy`  | Apply migrations in production (no prompts)                  |
| `npm run prisma:studio`  | Browse your database in a GUI                                |
| `npm run seed`           | Insert demo data (safe to re-run)                            |
| `npm run docker:up`      | Builds and starts MySQL, the API and the storefront          |
| `npm run docker:down`    | Stops the Docker Compose stack                               |

---

## Testing

The repository ships with two independent Vitest suites. Neither needs MySQL,
so `npm test` works on a clean checkout.

```bash
npm test                # everything
npm run test:server     # 77 API specs
npm run test:client     # 20 storefront specs
npm run test:coverage   # + coverage reports
```

| Suite      | Tooling                                | What it covers                                                                 |
| ---------- | -------------------------------------- | ------------------------------------------------------------------------------ |
| API        | Vitest, Supertest, mocked Prisma client | Auth, checkout and orders, products, admin metrics, chat, structured logging   |
| Storefront | Vitest, jsdom, React Testing Library    | Checkout flow (validation, totals, submission, errors) and the product catalogue |

The API is CommonJS, so the Prisma mock is injected into `require.cache` before
the app is loaded. That keeps the HTTP layer, middleware and validation fully
exercised without touching a real database.

CI (`.github/workflows/ci.yml`) runs formatting, linting, typechecking, both
test suites, an audit, both production builds and both Docker image builds on
every push and pull request.

---

## Customizing the project

### Change the store name

Search and replace `Aurora` across the client:

| Location                                | What it controls                       |
| --------------------------------------- | -------------------------------------- |
| `client/app/layout.tsx`                 | Page titles, meta description, OG/Twitter cards, keywords |
| `client/components/layout/header.tsx`    | Header logo wordmark, nav labels       |
| `client/components/layout/footer.tsx`    | Footer links, tagline, copyright       |
| `client/components/admin/sidebar.tsx`    | Admin console wordmark and footer      |
| `client/components/home/hero.tsx`       | Hero headline and sub-copy             |
| `client/components/chat/chat-widget.tsx` | Support chat header                    |

### Change the color theme

`client/tailwind.config.js` holds every design token:

```js
colors: {
  indigo: { 50: '#eef2ff', 500: '#6366f1', 600: '#4f46e5', ... },  // brand accent
  ink:    { 50: '#f8fafc', 900: '#0f172a', ... },                  // neutrals / text
},
fontFamily: {
  sans: ['Outfit', 'Inter', 'system-ui', ...],
},
```

Swap the `indigo` ramp for your brand color and the whole UI follows — the components reference `indigo-*` and `ink-*` utilities rather than raw hex values. `bg-aurora`, `shadow-soft`, `shadow-glow` and the animations (`float`, `gradient-pan`, `marquee`, `shimmer`) are defined in the same file.

Fonts are loaded in `client/app/layout.tsx` via `next/font/google` — swap `Outfit` / `Inter` there and in `fontFamily`.

### Change the currency

`client/lib/utils.ts`:

```ts
export function formatCurrency(value: number, currency = 'BDT'): string {
  return new Intl.NumberFormat('en-BD', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(value ?? 0);
}
```

Set `currency = 'USD'`, `'EUR'`, `'INR'`… and change the locale to match.

### Change shipping, tax and thresholds

Edit `server/.env` — no code changes needed:

```ini
SHIPPING_FLAT_RATE=60        # flat shipping fee
SHIPPING_FREE_THRESHOLD=5000 # free shipping above this order subtotal
TAX_RATE=0                   # tax rate applied at checkout
```

Defaults live in `server/src/config/env.js` if you prefer to hard-code them.

### Add or change products

**Through the admin UI** (easiest): sign in as `admin@aurora.com` → **Admin → Products** → create, edit, feature, or archive (archive = soft delete, `active = false`).

**Through the seed file**: edit `server/prisma/seed.js` — the `categories` and `products` arrays — then run `npm run seed`. The seed is idempotent (upserts by slug), so it is safe to re-run.

Product images are plain URLs, so any external host (or your own CDN) works.

### Add a new category

Add it to `server/prisma/seed.js` and re-seed, or create it directly in **Prisma Studio**. The category slug becomes the catalogue filter (`/products?category=<slug>`).

### Change the admin account

Edit the `admin` block in `server/prisma/seed.js` (email, name, password) and re-run `npm run seed`. To change an existing account's password from the UI, sign in and use **Account → Change password**.

### Point the storefront at a different API

Edit `client/.env.local`:

```ini
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
NEXT_PUBLIC_SOCKET_URL=https://api.yourdomain.com
```

Remember to allow the storefront origin in `CORS_ORIGINS` on the server.

### Add a new API endpoint

1. Add a Zod schema in `server/src/validation/schemas.js`
2. Add the handler in `server/src/controllers/<area>.controller.js`
3. Register the route in `server/src/routes/<area>.routes.js`
4. Wrap it in `asyncHandler` and guard it with `requireAuth` / `requireAdmin`
5. Add the typed client method in `client/lib/api.ts`

### Extend the data model

Edit `server/prisma/schema.prisma`, then:

```bash
npm run prisma:migrate   # prompts for a migration name
npm run prisma:generate  # regenerate the typed client
```

---

## API reference

Base URL: `http://localhost:4000/api`

Every response uses the envelope `{ success, data, message, details }`.

### Auth

| Method | Endpoint              | Auth  | Description                |
| ------ | --------------------- | ----- | -------------------------- |
| POST   | `/auth/register`      | —     | Create account             |
| POST   | `/auth/login`         | —     | Sign in, returns a JWT     |
| GET    | `/auth/me`            | token | Current profile            |
| PATCH  | `/auth/me`            | token | Update name / phone        |
| PATCH  | `/auth/password`      | token | Change password            |

### Products

| Method | Endpoint             | Auth  | Description                       |
| ------ | -------------------- | ----- | --------------------------------- |
| GET    | `/products`          | —     | List + filter + paginate          |
| GET    | `/products/categories` | —  | List categories                   |
| GET    | `/products/:slug`    | —     | Detail + related products         |
| POST   | `/products`          | admin | Create                            |
| PATCH  | `/products/:id`      | admin | Update                            |
| DELETE | `/products/:id`      | admin | Archive (soft delete)             |

Query parameters for `GET /products`: `search`, `category` (slug), `featured` (`true`), `sort` (`newest`, `oldest`, `price-asc`, `price-desc`, `rating`, `popular`), `page`, `limit` (default `12`, max `48`).

### Orders

| Method | Endpoint                     | Auth  | Description               |
| ------ | ---------------------------- | ----- | ------------------------- |
| GET    | `/orders`                    | token | My orders                 |
| POST   | `/orders`                    | token | Place an order            |
| GET    | `/orders/:orderNumber`       | token | Order detail (own or admin) |
| GET    | `/orders/admin/all`          | admin | All orders, filterable    |
| PATCH  | `/orders/:orderNumber/status` | admin | Update order status       |

Statuses: `PENDING`, `CONFIRMED`, `PROCESSING`, `SHIPPED`, `DELIVERED`, `CANCELLED`.

### Admin & chat

| Method | Endpoint             | Auth  | Description                        |
| ------ | -------------------- | ----- | ---------------------------------- |
| GET    | `/admin/stats`       | admin | Revenue, pipeline, top products, low stock |
| GET    | `/admin/customers`   | admin | Customers with order count and lifetime value |
| GET    | `/chat/:conversationId` | —  | Chat history                        |
| POST   | `/chat`              | optional | Send a message                 |

---

## Deployment

### 1. Prepare the server

```bash
npm ci
npm run build
```

Set production environment variables on the host — `NODE_ENV=production`, a real `DATABASE_URL`, and a strong `JWT_SECRET` (the API refuses to boot in production with the default secret).

Apply migrations without prompts:

```bash
npm run prisma:deploy
```

### 2. Run the API

```bash
npm run start:server
```

Put it behind a reverse proxy (Nginx / Caddy) and terminate TLS there. The app listens on `PORT` (default `4000`).

### 3. Deploy the storefront

`client/` is a standard Next.js app. Deploy to Vercel, or build and run it on your own server:

```bash
npm run build:client
npm run start:client
```

Set `NEXT_PUBLIC_API_URL` and `NEXT_PUBLIC_SOCKET_URL` to your public API URL **before building** — they are inlined at build time.

### 4. Seed or create your first admin

```bash
npm run seed
```

Then sign in and change the seeded passwords immediately.

---

## Docker

The whole stack — MySQL 8, the API and the storefront — runs with one command.
Prisma migrations are applied automatically on API startup.

```bash
cp .env.example .env        # optional: override defaults
npm run docker:up           # builds and starts everything
```

| Service      | URL                             |
| ------------ | ------------------------------- |
| Storefront   | <http://localhost:3000>         |
| API          | <http://localhost:4000/api/health> |
| MySQL        | `localhost:3306`                |

Seed the demo catalogue inside the running API container:

```bash
docker compose exec server npm run seed
```

Useful commands:

```bash
npm run docker:logs         # follow all container logs
npm run docker:down         # stop the stack
docker compose down -v      # stop and delete the database volume
```

Both images are multi-stage and run as the unprivileged `node` user with a
container health check. They are also built in CI to catch Dockerfile
regressions.

---

## Troubleshooting

**`Error: listen EADDRINUSE :::4000`** — another process holds the port. Find and stop it, or change `PORT` in `server/.env`.

**`Environment variable not found: DATABASE_URL`** — `server/.env` is missing or `DATABASE_URL` is unset. Copy `server/.env.example` to `server/.env` and fill it in.

**`Can't reach database server`** — MySQL is not running, or the host/port/credentials in `DATABASE_URL` are wrong. Test the connection with `mysql -u root -p -h localhost`.

**Prisma says the schema is out of sync** — run `npm run prisma:migrate` to create the missing migration.

**Storefront loads but shows no products** — the client cannot reach the API. Confirm `NEXT_PUBLIC_API_URL` matches the API host and that the API's `CORS_ORIGINS` includes your storefront origin.

**`JWT_SECRET must be set to a unique value in production`** — set a real secret before running with `NODE_ENV=production`.

**Stale build after editing the client** — stop the dev server and delete `client/.next`, then rebuild.

---

## License

Released for use and modification. Replace the branding, catalogue and copy with your own before going live.
