# Gridfinity Werkstatt — Drawer Configurator

Standalone Gridfinity drawer planner (German default + English). Set drawer size in grid units, place bins / baseplates / dividers on an interactive grid, review a live bill of materials, and submit an order with contact details.

## Run locally

```bash
cd gridfinity-configurator
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

- Planner: `/`
- Order admin: `/admin/orders` (unlock with `ADMIN_TOKEN`, default `local-dev-admin`)

Local order storage uses in-memory **PGlite** (no Postgres required). Set `DATABASE_URL` only when pointing at a real Postgres (Cursor apps hosting sets this automatically).

## Environment

| Variable | Purpose | Local fallback |
| --- | --- | --- |
| `ORDER_NOTIFY_EMAIL` | Owner mailbox for mailto / notify metadata | `orders@example.local` |
| `ORDER_WEBHOOK_URL` | Optional POST webhook on new orders | unset (skipped) |
| `ADMIN_TOKEN` | Protects order list API + admin unlock | `local-dev-admin` |
| `DATABASE_URL` | Postgres for durable orders | unset → PGlite |

Copy `.env.example` for reference. Do not commit real secrets.

## Modules (placeholder EUR prices)

**Bins:** 1×1, 1×2, 1×3, 1×4, 2×2 (3U & 6U), 2×3, 2×4, 3×3, 3×4, 4×4  
**Baseplates:** 2×2, 3×3, 4×4, 5×5, 6×4  
**Dividers:** 1×2, 2×2  

## Orders

1. Customer reviews layout → enters contact → `POST /api/orders`
2. Order is persisted (PGlite locally / Postgres when hosted)
3. Owner opens `/admin/orders`, unlocks with token, sees BOM + contact
4. Mailto link uses `ORDER_NOTIFY_EMAIL`; optional `ORDER_WEBHOOK_URL` receives JSON

No shipping and no Shopify checkout in this MVP.

## Stack

Next.js (App Router) · React · Tailwind · PGlite / Postgres
