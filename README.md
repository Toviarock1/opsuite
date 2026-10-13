# Daily Sales Log

A small shop app where the owner logs sales (item, amount in whole naira, time of sale) and sees today's sales in a table with a running total. New sales appear at the top instantly. Supports editing and deleting sales (with a confirm dialog), searching by item name, and paginated browsing.

## Tech stack

- Frontend: React 18 + Vite + TypeScript + Tailwind CSS v4 (`@tailwindcss/vite`), TanStack Query, axios — deployed on Vercel
- Backend: Node.js + Express + TypeScript + Prisma ORM — deployed on Render
- Database: Supabase Postgres (PostgreSQL-compatible hosted DB)
- Validation: hand-written server validator returning clear `400 { error }`
- Money: `Int` (whole naira), formatted with `Intl.NumberFormat("en-NG", { currency: "NGN" })`
- Tests: Jest + ts-jest — 7 validation unit tests (`npm test`) plus 4 sales-endpoint tests against a real database (`npm run test:api`, needs `DATABASE_URL`)
- Hardening: `helmet` headers, rate limiting on write endpoints (100 per 15 min per IP), `pino` JSON logs, graceful shutdown on SIGTERM/SIGINT

## Folder structure

```
server/
  prisma/         # schema.prisma, seed.ts, migrations/
  src/
    db/           # (see src/lib) Prisma client singleton
    lib/          # prisma.ts, logger.ts
    routes/       # sales.ts, health.ts (+ sales.api.test.ts)
    validation/   # saleValidation.ts (+ .test.ts)
    middleware/   # errorHandler.ts, asyncHandler.ts, rateLimit.ts
    utils/        # lagosDay.ts
    app.ts        # express app factory
    server.ts     # listen + graceful shutdown
client/
  src/
    components/   # SaleForm, EditSaleForm, SaleFields, SalesTable, TotalCard,
                  # SearchBar, PaginationControls, DeleteConfirmDialog,
                  # ErrorBoundary + shared Button, Field, ErrorText
    hooks/        # useTodaySales, useSaleMutations, useDebouncedValue
    lib/          # api.ts (axios instance + typed calls)
    utils/        # formatNaira, datetime, validateSaleFields
```

Shared UI primitives (`Button` with primary/secondary/danger variants, `Field` label wrapper, `ErrorText` alert) live in `components/` so styling and focus/disabled states exist in exactly one place. `SaleFields` (the three sale inputs) is shared by the create and edit forms so their markup and checks can never drift apart.

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
| `PORT` | `4000` | Render injects its own port (empty/zero falls back to 4000) |
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

Same body and validation as POST. Returns `200 { sale }`, `400` for a bad id, `404 { error }` for unknown ids.

### `DELETE /api/sales/:id`

Returns `204` on success, `400` for a bad id, `404 { error }` for unknown ids.

Write endpoints are rate-limited (100 per 15 minutes per IP, `429` with a JSON error when exceeded); reads are unlimited.

## Notes

What I built: a daily sales log where a shop owner logs item/amount/time and sees today's sales plus a DB-computed total. It grew into editing and deleting sales with a confirm dialog, case-insensitive search, paginated browsing with newest-added-first ordering, instant cache updates so saves show immediately, and Jest suites covering validation plus the sales endpoints.

My key decisions and their trade-offs:

1. I used Prisma instead of raw SQL because the project is TypeScript and Prisma gives me typed queries and automatic parameterization with less boilerplate. The trade-off is I write less SQL by hand, so I kept the schema to one small model and used `aggregate({ _sum })`, `count`, and `findMany` with `gte/lt` filters so I can still explain the exact queries being generated.
2. I compute the day bounds in Node (`Intl.DateTimeFormat` with `Africa/Lagos`, then midnight `+01:00` to UTC) and pass them as Prisma filters. This keeps the codebase Prisma-only and easy to explain, and it's safe because Lagos is fixed at UTC+1 with no daylight saving — but strictly the timezone would be nicer as SQL-side `AT TIME ZONE`, and I'd switch to `$queryRaw` if a reviewer wanted that.
3. I used TanStack Query plus instant cache patching (prepend on create, patch on edit, remove on delete, totals adjusted) instead of refetch-and-flash because waiting on free-tier Postgres after every save felt broken. The trade-off is more cache logic to reason about, but a background invalidation still reconciles every page with the server, so the server stays the source of truth.
4. I kept validation hand-written with clear 400 messages instead of adding Zod. For three fields, one small function is easier to defend line-by-line than a new dependency — same reason the shared form fields and buttons are plain components, not a UI library.
5. I picked Jest + ts-jest over the zero-dependency Node runner because it's what most teams expect, despite the extra setup it needs. Unit tests run with no database; endpoint tests need `DATABASE_URL` and clean up their own `E2E-`-tagged rows.

With more time I would add shop accounts and login (right now anyone with the URL can edit everything), a day-picker so the owner can look back at past days instead of only today, and an end-to-end smoke test of the deployed frontend.
