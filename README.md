# TVV Travel OS — Backend

The system of record for The Vacation Voice: inventory, suppliers, packages, quotes, bookings, CRM and website content. It is both the **admin dashboard** (58 pages) and the **API** (216 routes) that the public website consumes.

The public website ([TVV Frontend Final](https://github.com/Stalkus/tvv-frontend-final)) holds no database and no business logic — it renders what this backend serves. Everything happens here.

> **Scope of this README:** what exists in the repo today, verified against the code. Anything not yet built is in [Known gaps](#known-gaps) and labelled as such. If this README disagrees with the code, the code is right — please fix this file.

---

## Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript, React 19 |
| ORM | Prisma 7 (`@prisma/adapter-pg`) |
| Database | PostgreSQL |
| UI | Tailwind CSS, Radix, Lucide |
| Payments | Razorpay |
| AI | OpenAI (`openai` SDK) |
| Media | Cloudinary |
| Email | Nodemailer (SMTP; logs to console if unconfigured) |
| Queue | BullMQ + Redis (optional; runs synchronously if unset) |
| Tests | Vitest, Playwright, MSW, Supertest |

## Quick start

```bash
cp .env.example .env          # fill in DATABASE_URL at minimum
npm install
npx prisma migrate dev        # applies prisma/migrations
npm run dev                   # http://localhost:3000
```

Run the backend on **3000** and the frontend on **3001** (`next dev -p 3001` in that repo). `CORS_ALLOWED_ORIGINS` defaults to `http://localhost:3001`, so this pairing works out of the box. Both repos' `dev` script is a bare `next dev`, so start the backend first or pass the port explicitly.

**Seeding:** `npm run db:seed` is currently broken — `prisma.config.ts` points at `prisma/seed.ts`, which does not exist. The working seed scripts are `scripts/seed-geo.ts` (countries/states/cities) and `scripts/seed-pg.js`. `GET /api/seed` also seeds geography, but see [Security notes](#security-notes) before relying on it.

## Layout

```
src/app/          Admin UI pages + API route handlers
src/modules/      Bounded contexts — the actual business logic
src/features/     Admin UI feature compositions (admin-packages, admin-bookings, …)
src/components/   Shared admin UI
src/shared/       DI container, database, config, logger, health, CORS
src/middleware.ts The single auth gate for every /api/* request
prisma/           Schema (58 models) + migrations
```

### Modules

Each is a bounded context under `src/modules/`, registered into a hand-rolled DI container (`src/shared/di`) via its own `module.ts`. Repositories are Prisma-backed; the `in-memory-store.ts` files that remain in some modules are legacy and are **not** what gets registered.

| Module | Files | Owns |
|---|---|---|
| `supplier` | 105 | Supplier ports/adapters + the supplier runtime (see [Suppliers](#suppliers)) |
| `auth` | 73 | JWT sessions, API keys, roles, permissions, audit log |
| `booking` | 71 | Bookings, travellers, payments, invoices, vouchers, timeline |
| `package` | 69 | Packages, days, items, pricing, rules, versions, AI generation |
| `website` | 36 | The public Website API — DTOs, transformers, SEO |
| `customer` | 34 | Customer-scoped `/api/me/*` surface |
| `quote` | 33 | Quotes and quote versions |
| `observability` | 32 | Request context, metrics, logs |
| `inventory` | 30 | Polymorphic `InventoryItem` catalog |
| `destination` | 28 | Destination hierarchy + geography |
| `frontend` | 25 | Frontend compatibility layer (`/api/v1/*`) |
| `storage` | 24 | Media, signed URLs |
| `crm`, `payments`, `email`, `ferry`, `ai` | 1–3 each | Thin — mostly delegate elsewhere |

## API surfaces

Four surfaces, distinguished by who may call them. The allow-list lives in `src/modules/auth/middleware/route-permission-map.ts`.

| Prefix | Auth | Consumer |
|---|---|---|
| `/api/website/*` | Public | Public website — the intended surface |
| `/api/v1/*` | Public | Frontend compatibility layer (legacy paths) |
| `/api/external/*` | API key (`x-api-key` or Bearer) | Public website — catalog, enquiries, bookings |
| `/api/me/*` | Customer JWT | Logged-in customer dashboard |
| everything else | Staff JWT + permission | Admin dashboard |

### `/api/website/*` — the public Website API

The best-built surface. Proper DTOs, transformers and SEO builders in `src/modules/website`; no database shapes leak to the browser. **Prefer this surface for all new frontend work.**

```
GET /api/website/home
GET /api/website/navigation
GET /api/website/packages          ?tripType=HONEYMOON|FAMILY|…
GET /api/website/package/{slug}
GET /api/website/destinations
GET /api/website/destinations/tree
GET /api/website/destination/{slug}
GET /api/website/guides            /guides/{slug}
GET /api/website/pages/{slug}
GET /api/website/faqs              ?category=
GET /api/website/reviews           /reviews/trust-stats
GET /api/website/search
GET /api/website/site-settings
```

### `/api/v1/*` — frontend compatibility layer

Public, and **all ten routes are implemented** (`ferry/routes`, `ferry/search`, `guides`, `reviews`, `calculator/estimate`, `experiences`, `flights/airports`, `flights/search`, `packages`, `search`).

Two caveats that matter:

- **Seven of them return raw Prisma rows** — e.g. `/api/v1/experiences` is a bare `prisma.inventoryItem.findMany()`. The database shape *is* the API response. This is the direct cause of three bugs in the frontend's `docs/ISSUE_TRACE.md` (activities with no `slug`, images buried at `details.images[0]`, destinations as bare UUIDs), each fixed by an adapter in the frontend — display logic that belongs here instead. New endpoints should follow the `website` module's DTO pattern, not this one.
- **The allow-list's comment calling these "NOT_IMPLEMENTED stubs" is stale.** They were stubs once, which is why they're public. They are not stubs now. See [Security notes](#security-notes).

### `/api/external/*` — API-key surface

`packages`, `destinations`, `inventory`, `enquiries`, `bookings`. Collection routes only — there are **no** `/{slug}` detail routes here, despite the frontend's `apiPaths` referencing them.

### `/api/me/*` — customer surface

`bookings`, `bookings/{id}`, `quotes`, `quotes/{id}`, `profile`, `dashboard`, `documents`.

Ownership is enforced: handlers in `src/modules/customer` reject a null auth context and scope every query to `context.userId`. There is no wishlist endpoint.

## Auth & permissions

`src/middleware.ts` runs on every `/api/*` request before any route handler. It is **fail-closed**: `isPublicPath()` is an explicit allow-list, and anything not on it requires at least a valid identity. There is no "unknown path defaults to public" branch.

Three identity types: **staff JWT** (admin), **API key** (external, resolved to a role), **customer JWT** (`/api/me/*`).

Permissions are `RESOURCE:ACTION` across 9 resources — `INVENTORY`, `DESTINATION`, `PACKAGE`, `WEBSITE`, `QUOTE`, `BOOKING`, `USERS`, `ROLES`, `SETTINGS` — and 4 actions (`CREATE`/`READ`/`UPDATE`/`DELETE`, mapped from HTTP method). Paths map to resources via `RESOURCE_PREFIX_MAP`. A non-public path with no resource mapping still requires authentication — permission checks are additive on top of that floor, never a substitute for it.

## Suppliers

Ports and adapters under `src/modules/supplier`, sitting on a genuinely capable runtime: dispatcher, circuit breaker, retry policy, timeouts, health monitor, metrics registry, event bus, routing policy.

Capabilities: `FLIGHTS`, `HOTELS`, `ACTIVITIES`, `FERRIES`, `TRANSFERS`, `VISA`, `INSURANCE`.

Adapters: **TripJack** (the main one), **Sembark**, **Ferry**, **Manual**.

### TripJack

The adapter is real and complete at the client level — a `fetch`-based client, an auth service supporting both static-token and login-exchange flows, request/response DTOs for flight search, hotel search, hotel details/review, booking, cancellation, fare rules, seat maps and SSR, and separate flight and hotel mappers. Config comes only from env (`src/modules/supplier/adapters/tripjack/config`); no credential is ever a fallback literal.

**What is exposed to the website today:**

| Capability | Public endpoint | Notes |
|---|---|---|
| Flights | `POST /api/v1/flights/search` | Works, but see below |
| Hotels | **none** | Adapter + DTOs + mapper exist; nothing exposes them |

Two things to know before building on this:

1. `/api/v1/flights/search` hardcodes `supplierService.search("tripjack", …)` and calls the supplier service **directly, bypassing the dispatcher** — so it gets no circuit breaker, no retry, no timeout policy. `POST /api/supplier/search` does it correctly via the dispatcher, but is authenticated-only. The one public supplier route is the one that skips the reliability machinery.
2. **Hotels have no public path at all.** Reaching TripJack hotels from the website requires a new endpoint — ideally on `/api/website/*`, dispatcher-backed, with a DTO.

## Data model

58 Prisma models in `prisma/schema.prisma`, 3 migrations. The core:

- **Inventory** — `InventoryItem` is one polymorphic table for every product kind (`HOTEL`, `ACTIVITY`, `TRANSFER`, …) with kind-specific detail in `details`. `SupplierRecord` maps suppliers.
- **Geography & destinations** — `Country` → `State` → `Region` → `City`, `Airport`; plus a self-referential `Destination` tree with `DestinationCategory`. Market roots are destinations with `parentDestinationId: null` and slugs `andaman`, `domestic`, `international`.
- **Packages** — `Package` + `PackageDay`/`Item`/`Pricing`/`Rule`/`Availability`/`Version`. `tripType` is an optional enum string.
- **Sales** — `Quote`/`QuoteItem`/`QuoteVersion` → `Booking` + `BookingItem`, `Traveller`, `BookingPayment`, `BookingInvoice`, `BookingVoucher`, status history, timeline, notes.
- **Auth** — `User`, `Role`, `Permission`, `UserRole`, `Session`, `RefreshToken`, `LoginHistory`, `PasswordReset`, `AuditLog`, `ApiKey`.
- **CRM & content** — `Enquiry`, `Lead`, `CustomerProfile`, `Notification`; `CmsPage`, `CmsGuide`, `CmsConfig`, `CmsRedirect`, `LandingPage`, `MediaAsset`, `Review`, `FerryRoute`/`Schedule`/`Rate`.

## Testing

Vitest (unit + integration), Playwright (e2e), MSW and Supertest are all configured, with `npm run test:all` wiring them together.

**There are currently no tests in `src/`.** The harness is real; the suite is not written. For a system handling payments and bookings this is the largest quality gap in the repo.

```bash
npm run test              # vitest unit
npm run test:integration  # builds first
npm run test:e2e          # playwright
```

## Known gaps

Verified as missing or broken today — not aspirational.

| Gap | Detail |
|---|---|
| **TripJack hotels unreachable** | No public endpoint for `HOTELS`. Blocks dynamic hotel display on the website. |
| **Wishlist** | Frontend has `/dashboard/wishlist`; backend has no wishlist model or endpoint. |
| **`npm run db:seed`** | Points at a non-existent `prisma/seed.ts`. Use `scripts/seed-geo.ts`. |
| **Raw Prisma responses** | 7 of 10 `/api/v1/*` routes return DB rows unshaped. |
| **No `/{slug}` on `/api/external/*`** | Frontend `apiPaths` reference detail routes that don't exist. |
| **No tests** | See above. |
| **`TVV FE_A-DB/`** | A stale 351-file copy of the frontend, tracked in this repo. It is **not** the live frontend — that lives in its own repo. Ignore it; it should be deleted. |
| **270 `any` usages** | Concentrated in the `/api/v1/*` routes and admin features. |

Docs formerly referenced by this README (`ARCHITECTURE_MIGRATION.md`, `DATABASE_SCHEMA.md`, `SUPPLIER_ABSTRACTION_LAYER.md`, `INVENTORY_SYSTEM.md`, `PACKAGE_BUILDER.md`, `WEBSITE_API.md`) do not exist in this repo. The frontend's `docs/TODO_BACKEND_REQUIRED.md` is also stale — it lists `/api/me/*`, ferry, guides, reviews, experiences and calculator as missing; all are implemented.

## Security notes

Read these before deploying.

**`.env` is committed to this repository.** It is not in `.gitignore` and is present in git history on `origin/main`, carrying a live `DATABASE_URL`, Razorpay key secret and webhook secret, OpenAI key, TripJack password and token, and Cloudinary secret. Removing the file does not undo this — **every one of those credentials must be rotated at its provider**, and `.env` added to `.gitignore`.

**`/api/v1/flights/search` is public, unauthenticated and un-rate-limited**, and proxies straight to TripJack — a metered API you pay for. It is public because the allow-list still describes `/api/v1/flights` as a `NOT_IMPLEMENTED` stub, which stopped being true when the route was implemented. The justification decayed; the rule didn't. Either authenticate it, or rate-limit it behind an API key.

**`GET /api/seed` is public and writes to the database.** It is on `PUBLIC_EXACT_PATHS`. Writes are guarded by find-then-create, so it is roughly idempotent, but an unauthenticated public write endpoint should not exist in production.

**Supplier names appear in 74 source files** — `/api/supplier/*`, `/itinerary/tripjack`, admin package components, and the hardcoded `"tripjack"` in the flight search route. The ports-and-adapters structure is real, but "business code never knows a supplier's name" is an aspiration, not an enforced invariant. Worth knowing before assuming a second supplier drops in without edits above the adapter layer.

## Conventions

- **Never delete existing features. Reuse existing pages. Refactor gradually. Preserve backward compatibility. Explain why before replacing anything. Never rewrite everything at once.**
- New public endpoints go on `/api/website/*` with a DTO and transformer, following `src/modules/website`.
- Supplier calls go through the dispatcher, not the supplier service directly.
- Credentials are read only through a module's config service, never `process.env` at the call site.
