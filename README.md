# Daily Sales Log

A small shop app to log sales (item, whole-naira amount, time) and see today's sales in Lagos time with a running total.

## Tech stack

- Frontend: React 18 + Vite + TypeScript + Tailwind CSS v4 (`@tailwindcss/vite`), deployed on Vercel
- Backend: Node.js + Express + TypeScript + Prisma ORM, deployed on Render
- Database: Supabase Postgres (PostgreSQL-compatible hosted DB)
- Validation: hand-written server validator returning clear `400 { error }`
- Money: `Int` (whole naira), formatted with `Intl.NumberFormat("en-NG", { currency: "NGN" })`

## Local setup

Requirements: Node 20+, npm, a Supabase project (or any Postgres `DATABASE_URL`).

```bash
# 1. Backend
cd server
cp .env.example .env   # fill in Supabase pooler + direct URLs, CLIENT_ORIGIN
npm install
npx prisma migrate dev --name init
npm run db:seed        # 12 realistic sales for one day
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

Client (`client/.env`):

| Name | Example |
|------|---------|
| `VITE_API_URL` | `https://daily-sales-log-api.onrender.com` (no trailing slash) |

## API endpoints

### `GET /health`

```bash
curl https://<render-url>/health
# {"ok":true}
```

### `GET /api/sales/today`

Today = current date in `Africa/Lagos`. Total is `SUM(amount)` from the DB, never summed in the browser.

```bash
curl https://<render-url>/api/sales/today
```

```json
{
  "sales": [
    { "id": 1, "itemName": "Indomie carton", "amount": 12500, "soldAt": "2026-10-13T07:05:00.000Z", "createdAt": "..." }
  ],
  "total": 12500
}
```

### `POST /api/sales`

```bash
curl -X POST https://<render-url>/api/sales \
  -H 'Content-Type: application/json' \
  -d '{"itemName":"Peak milk tin","amount":1200,"soldAt":"2026-10-13T08:40:00.000Z"}'
# 201 {"sale": {...}}
```

Validation (`400 { error }`): name trimmed non-empty, max 100 chars; amount integer 1–10,000,000; `soldAt` valid date string.

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

## Notes (draft — rewrite in your own words)

I built a daily sales log where a shop owner logs item/amount/time and sees today's Lagos sales plus a DB-computed total.

Three decisions I made and their trade-offs:

1. I used Prisma instead of raw `pg` because the project is TypeScript and Prisma gives me typed queries and automatic parameterization with less boilerplate. The trade-off is I write less SQL by hand, so I kept the schema small and used `aggregate({ _sum })` plus `findMany` with `gte/lt` so I can still explain the exact queries Prisma generates.
2. I compute the Lagos day bounds in Node (`Intl.DateTimeFormat` with `Africa/Lagos`, then midnight `+01:00` to UTC) and pass them as Prisma `where` filters. This keeps the codebase Prisma-only and easy to explain, but strictly "today in the DB" would be nicer as SQL-side `AT TIME ZONE`. I chose clarity since Lagos is fixed at UTC+1 with no DST — but I'd switch to `$queryRaw` with `AT TIME ZONE` if the reviewer wants timezone fully DB-side.
3. I kept validation hand-written with clear 400 messages instead of adding Zod. One small function is easier to defend line-by-line than a new dependency for three fields.

With one more day I would add pagination for history, an edit/delete flow with confirm, and a simple integration test for the today endpoint (seed two days, assert only today's rows + total return).
