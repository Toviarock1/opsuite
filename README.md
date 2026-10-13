# Daily Sales Log

A small shop app to log sales (item, whole-naira amount, time) and see today's sales with a running total. Supports editing and deleting sales, searching by item name, and paginated browsing.

## Tech stack

- Frontend: React 18 + Vite + TypeScript + Tailwind CSS v4 (`@tailwindcss/vite`) + TanStack Query, deployed on Vercel
- Backend: Node.js + Express + TypeScript + Prisma ORM, deployed on Render
- Database: Supabase Postgres (PostgreSQL-compatible hosted DB)
- Validation: hand-written server validator returning clear `400 { error }`
- Money: `Int` (whole naira), formatted with `Intl.NumberFormat("en-NG", { currency: "NGN" })`
- Tests: Jest + ts-jest — 7 validation unit tests (`npm test`) plus 4 sales-endpoint tests against a real database (`npm run test:api`, needs `DATABASE_URL`)
- Hardening: `helmet` headers, rate limiting on write endpoints (100 per 15 min per IP), `pino` JSON logs, graceful shutdown on SIGTERM/SIGINT

## Local setup

Requirements: Node 20+, npm, a Supabase project (or any Postgres `DATABASE_URL`).

```bash
# 1. Backend
cd server
cp .env.example .env   # fill in Supabase pooler + direct URLs, CLIENT_ORIGIN
npm install
npx prisma migrate dev --name init
npm run db:seed        # 12 realistic sales for one day
npm test               # unit tests, no DB needed
npm run test:api       # endpoint tests, needs DATABASE_URL in .env
npm run dev            # http://localhost:4000

# 2. Frontend (new terminal)
cd client
cp .env.example .env   # VITE_API_URL=http://localhost:4000
npm install
npm run dev            # http://localhost:5173
```

## Environment variables

Server (`server/.env`):

| Name | Example | Why |
|------|---------|-----|
| `DATABASE_URL` | `postgresql://...:6543/postgres?pgbouncer=true` | Prisma runtime via Supabase pooler |
| `DIRECT_URL` | `postgresql://...:5432/postgres` | Migrations via direct connection |
| `PORT` | `4000` | Render injects its own port |
| `CLIENT_ORIGIN` | `https://daily-sales-log.vercel.app` | CORS allow-list, comma-separated if needed |
| `LOG_LEVEL` | `info` | Optional pino log level (`debug` locally) |

Client (`client/.env`):

| Name | Example |
|------|---------|
| `VITE_API_URL` | `https://daily-sales-log-api.onrender.com` (no trailing slash; empty = same origin) |

## API endpoints

### `GET /health`

```bash
curl https://<render-url>/health
# {"ok":true}
```

### `GET /api/sales/today`

Today = current date in `Africa/Lagos`. `total` is `SUM(amount)` over the whole day from the DB, never summed in the browser. Most recently added first, 10 per page (max 50).

```bash
curl "https://<render-url>/api/sales/today?page=1&pageSize=10&search=indomie"
```

```json
{
  "sales": [
    { "id": 1, "itemName": "Indomie carton", "amount": 12500, "soldAt": "2026-10-13T07:05:00.000Z", "createdAt": "..." }
  ],
  "total": 12500,
  "page": 1,
  "pageSize": 10,
  "totalCount": 1,
  "totalPages": 1
}
```

`search` is optional, case-insensitive, matches item names. `page`/`pageSize` fall back to defaults on bad input (never a 400).

### `POST /api/sales`

```bash
curl -X POST https://<render-url>/api/sales \
  -H 'Content-Type: application/json' \
  -d '{"itemName":"Peak milk tin","amount":1200,"soldAt":"2026-10-13T08:40:00.000Z"}'
# 201 {"sale": {...}}
```

Validation (`400 { error }`): name trimmed non-empty, max 100 chars; amount integer 1–10,000,000; `soldAt` valid date string.

### `PUT /api/sales/:id`

Same body and validation as POST. Returns `200 { sale }`, or `404 { error }` for unknown ids.

### `DELETE /api/sales/:id`

Returns `204` on success, or `404 { error }` for unknown ids.

## Deployment

Frontend (Vercel):

1. Import repo, set Root Directory to `client`.
2. Set env `VITE_API_URL=https://<your-render-service>.onrender.com`.
3. Build command `npm run build`, output `dist` (Vite defaults).

Backend (Render):

1. New Web Service, root directory `server`.
2. Build: `npm install && npx prisma migrate deploy && npm run build`.
3. Start: `npm start`.
4. Env: `DATABASE_URL` (Supabase pooler `6543?pgbouncer=true`), `DIRECT_URL` (direct `5432`), `CLIENT_ORIGIN` (your Vercel URL), `NODE_ENV=production`.
5. Run seed once: `npm run db:seed` from Render shell (or locally against the same DB).

Database (Supabase):

1. Create project, copy pooler + direct connection strings.
2. Run `npx prisma migrate deploy` from Render build (creates `sales` table + index on `soldAt`).

Production gotchas:

- **Render free tier sleeps** after inactivity — first request takes ~30–60s. The frontend shows loading + retry for this reason.
- **Supabase pooler vs direct**: runtime must use the pooler (`6543` + `?pgbouncer=true`), migrations must use direct (`5432`). Mixing them up causes connect/timeout errors.
- **`datetime-local` has no timezone**: the browser sends local wall time; the client converts to ISO (`toISOString`) before POST so the server stores true UTC.
- **`#` in the DB password must be URL-encoded** as `%23` in `DATABASE_URL`/`DIRECT_URL`, or the connection string silently breaks.

## Notes (draft — rewrite in your own words)

What I built: a daily sales log where a shop owner logs item/amount/time and sees today's sales plus a DB-computed total. It grew to include editing and deleting sales (with a confirm dialog), searching by item name, paginated browsing, and unit tests for the core logic.

My key decisions and their trade-offs:

1. I used Prisma instead of raw SQL because the project is TypeScript and Prisma gives me typed queries and automatic parameterization with less boilerplate. The trade-off is I write less SQL by hand, so I kept the schema to one small model and used `aggregate({ _sum })`, `count`, and `findMany` with `gte/lt` filters so I can still explain the exact queries being generated.
2. I compute the day bounds in Node (`Intl.DateTimeFormat` with `Africa/Lagos`, then midnight `+01:00` to UTC) and pass them as Prisma filters. This keeps the codebase Prisma-only and easy to explain, and it's safe because Lagos is fixed at UTC+1 with no daylight saving — but strictly the timezone would be nicer as SQL-side `AT TIME ZONE`, and I'd switch to `$queryRaw` if a reviewer wanted that.
3. I used TanStack Query on the frontend instead of hand-rolled fetch state because refetching after every save used to flash a loading screen. The query cache keeps the table on screen while fresh data loads in the background. The trade-off is one extra dependency and cache keys to reason about, but the code is smaller than my original `useState`/`useEffect` version.
4. I kept validation hand-written with clear 400 messages instead of adding Zod, and used Node's built-in test runner instead of adding Vitest/Jest. For three fields and pure-function tests, fewer dependencies means less to defend line-by-line.

With more time I would add shop accounts and login (right now anyone with the URL can edit everything), a day-picker so the owner can look back at past days instead of only today, and a React error-boundary fallback test plus an end-to-end smoke test of the deployed frontend.
