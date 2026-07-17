# TVV Backend — System Architecture

Travel OS backend: Next.js App Router + Prisma/Postgres. Serves admin dashboard UI and public APIs for TVV Frontend Final.

## Layout

```
src/app/       Admin UI + API route handlers
src/modules/   Bounded contexts (inventory, package, booking, website, auth)
src/middleware.ts   Auth gate for /api/*
prisma/        PostgreSQL schema
```

## API surfaces

| Prefix | Auth | Consumer |
|--------|------|----------|
| `/api/website/*` | Public | Public website |
| `/api/external/*` | API key or JWT | Public website (inventory, enquiries) |
| `/api/v1/*` | Mostly public | Legacy compatibility |
| `/api/inventory`, `/api/packages`, ... | Staff JWT | Admin dashboard |

Public allow-list: `src/modules/auth/middleware/route-permission-map.ts`

## Activities

Inventory items with `kind: ACTIVITY`. Admin: `/inventory/activities/new`. Public: `GET /api/external/inventory?kind=ACTIVITY`.

## Frontend connection

See TVV Frontend Final `docs/SYSTEM_ARCHITECTURE.md` and `docs/ISSUE_TRACE.md`.
