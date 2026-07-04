# 16 — Database Migration Plan

**Status:** Phase 2 — architecture and migration plan only, no code implemented. Prisma + PostgreSQL are decided (per `CLAUDE.md`, since the earliest architecture pass) but not installed anywhere in this repository — this document is the concrete plan for closing that gap without a rewrite, building on the fact that every one of ~30 repository classes across 7 modules already implements the persistence-agnostic `BaseRepository<T, ID>` interface from `src/shared/repositories`.

## Why This Is Mechanical, Not a Rewrite

Every repository in the codebase was built against this interface from Sprint "Backend Foundation" onward:
```ts
interface BaseRepository<T extends { id: ID }, ID = string> {
  findById(id: ID): Promise<Result<T | null, AppError>>;
  findMany(params?: PaginationParams): Promise<Result<PaginatedResult<T>, AppError>>;
  create(data: Omit<T, "id">): Promise<Result<T, AppError>>;
  update(id: ID, data: Partial<Omit<T, "id">>): Promise<Result<T, AppError>>;
  delete(id: ID): Promise<Result<void, AppError>>;
}
```
No service, handler, or route anywhere imports `InMemoryStore` or a concrete repository class directly — every dependency is injected via `module.ts`'s DI wiring, resolved from a `Token<T>`. This means a Prisma-backed implementation of the same interface can be swapped in **one module at a time**, by changing only that module's `module.ts` registration line, with zero changes to any service, handler, or route.

## Full Entity Inventory (what needs a table)

| Module | Entities | Table count |
|---|---|---|
| Inventory | `InventoryItem` (polymorphic: HOTEL/FLIGHT/ACTIVITY/TRANSFER/VISA/INSURANCE, kind-specific `details`) | 1 |
| Supplier | *(none — `SupplierRegistry` holds adapter instances in memory as configuration, not persisted business data; nothing to migrate)* | 0 |
| Destination | `Country`, `State`, `City`, `Region`, `Airport`, `Destination` (SEO/Gallery/FAQ currently embedded arrays) | 6 |
| Package | `Package`, `PackageDay`, `PackageItem`, `PackagePricing`, `PackageRule`, `PackageAvailability`, `PackageVersion` | 7 |
| Website | *(none — pure aggregator, zero repositories of its own)* | 0 |
| Quote | `Quote`, `QuoteItem`, `QuoteVersion` | 3 |
| Booking | `Booking`, `BookingItem`, `Traveller`, `PassengerDocument`, `BookingPayment`, `BookingInvoice`, `BookingVoucher`, `BookingStatusHistory`, `BookingTimelineEntry`, `BookingNote` | 10 |
| **Total** | | **27 tables** |

(Authentication's `User`/`Session`/`Role` tables are `docs/17`'s responsibility, additive to this list, not covered here.)

## Schema Design Principles

1. **One Prisma schema file, one physical database** — the module boundary is an application-layer discipline (no shared business logic, no cross-module repository access), not a physical database-per-module split. A single Postgres instance with foreign keys between tables (e.g. `PackageItem.inventoryItemId → InventoryItem.id`) is correct and does not violate "no shared business logic between modules," because those foreign keys are only ever read through each module's own repository, never joined across module repository boundaries in application code.

2. **Preserve UUID primary keys.** Every entity today uses `randomUUID()` string IDs. Prisma's `@id @default(uuid())` preserves this exactly — no ID scheme change, no risk of breaking any `xxxId` foreign-key-shaped string field already threaded through every module's types.

3. **JSON columns for genuinely embedded, always-accessed-with-parent data**: `Destination.seo`/`gallery`/`faqs`, `Package.seo`/`faqs`, `PackageItem.slotCriteria`, `Quote.adjustments`, `Traveller.emergencyContact`, `BookingVoucher.items`/`supplierReferences`. These were deliberately kept as embedded arrays/objects on their parent entity rather than separate repositories throughout this project specifically because they're small and always read with the parent — Postgres `jsonb` is the direct translation, not a normalized child table. Do not normalize these during migration; that would be a scope-creep redesign, not a migration.

4. **`snapshot: unknown` fields stay `Json`.** `PackageVersion.snapshot` and `QuoteVersion.snapshot` are deliberately untyped freeze-points (a serialized `PackagePreview`/`{quote, items, pricing}` object) — map to Prisma's `Json` type unchanged. Do not attempt to normalize a version snapshot into relational columns; the entire point of a version is that it's an immutable blob independent of the live schema's future evolution.

5. **Fix concurrency-unsafe sequential numbering before or during migration, not after.** `Booking.bookingNumber` (`BK-000001`), `Quote.quoteNumber` (`QT-000001`), `Package.code`-style disambiguators, `BookingInvoice.invoiceNumber`, `BookingVoucher.voucherNumber` are all currently generated via `repository.countAll() + 1` — safe only because the in-memory store serializes access within one Node event loop. On Postgres with real concurrent connections, two simultaneous `POST /api/bookings` calls can compute the same `count + 1` and generate a duplicate number. **Fix**: use a Postgres sequence (`CREATE SEQUENCE booking_number_seq`) or a `SERIAL`/`IDENTITY` shadow column read at insert time, formatted into the display string at read time — not computed by counting rows.

6. **No cross-module Prisma relations that would require joining across a module's repository boundary in application code.** A `PackageItem.inventoryItemId` foreign key at the database level is fine (referential integrity is a database concern); a service in one module calling `prisma.packageItem.findMany({ include: { inventoryItem: true } })` reaching into another module's table directly would violate the same boundary this project has held since Sprint 1 — that read must still go through `getInventoryService().getById()`.

## Migration Strategy — Expand, Migrate, Cut Over, Contract

Per `CLAUDE.md`'s Governing Migration Principles ("never rewrite everything at once," "ship as a migration path"), migrate **one module at a time**, in dependency order (leaf modules first, so a module's Prisma-backed dependencies are already durable before it's migrated):

**Order**: Inventory → Destination → Supplier *(no-op, nothing to migrate)* → Package → Website *(no-op)* → Quote → Booking.

This mirrors the exact build order of the modules themselves — no module was ever built before the modules it depends on, so migrating in the same order guarantees a module's dependencies are already on Postgres before it needs to be.

Per module:

1. **Expand**: add the module's Prisma models to `schema.prisma`, run `prisma migrate dev` to create the tables — additive, the in-memory implementation keeps serving all traffic, nothing observes a difference yet.
2. **Implement**: write `Prisma<Entity>Repository` classes implementing the exact same repository interface the in-memory version does — no new interface, no service-layer change.
3. **Migrate**: switch that module's `module.ts` `registerFactory` call from `new InMemory<X>Repository()` to `new Prisma<X>Repository(prismaClient)`. This is the entire cutover — one line per repository, one module at a time.
4. **Verify**: re-run that module's existing live-verification `curl` sequence (documented in its own `docs/0X_*.md` file) against the Postgres-backed version, confirm identical behavior. *(This is also the moment to add the automated tests flagged as missing in `docs/15` — retrofitting a manual verification script into an automated one is the natural checkpoint.)*
5. **Contract**: once verified, delete that module's `InMemoryStore`/`InMemory<X>Repository` classes. Do not keep both implementations "just in case" past this point — per the Governing Migration Principles, the expand-migrate-cutover-contract cycle is meant to complete, not linger indefinitely as dual-maintenance debt.

Because each module's cutover is independent, this can proceed as 5 separate, low-risk changes (Inventory, Destination, Package, Quote, Booking) rather than one large-blast-radius rewrite — directly satisfying "never rewrite everything at once."

## Seed Data

No seed script exists today — every entity in every module's live verification this session was created by hand via sequential `curl` calls (country → destination → hotel → package → quote → booking). Before Postgres migration, write a `prisma/seed.ts` that reproduces this same chain programmatically, both as a development convenience and as the first real automated regression check across module boundaries (see `docs/15`'s "no tests" finding — this is the cheapest, highest-value first test to write).

## Rollback Strategy

Because the interface never changes, rollback per module is the inverse of step 3 above: revert `module.ts`'s `registerFactory` line back to the `InMemory` implementation. This is safe as a rollback **only** during the migration window before "Contract" (step 5) deletes the in-memory class — plan each module's contract step as a separate, deliberate commit so a rollback window always exists until the team is confident.

## What This Plan Does Not Cover

- Connection pooling / Prisma Client instantiation strategy for serverless (Fluid Compute reuses instances, so a module-level singleton `PrismaClient` is correct — do not create a new client per request).
- Read replicas, sharding, or any scaling topology beyond a single Postgres instance — out of scope until real traffic data justifies it.
- The `User`/`Session` tables authentication will need — see `docs/17_AUTHENTICATION_ARCHITECTURE.md`.

## Recommended Implementation Order (applies to all of docs/16–20)

This is the master sequencing referenced from `docs/15_PRODUCTION_READINESS.md`:

1. **Add a test runner and a first regression suite** (not a numbered doc — a prerequisite finding from `docs/15`). Write it against the *current in-memory implementation* first, so it exists as a safety net before any of the migrations below begin, and so the same suite can be re-run against Postgres in step 2 to prove behavioral equivalence.
2. **Database migration** (this document) — Inventory → Destination → Package → Quote → Booking, one module at a time, each with its own expand/migrate/cutover/contract cycle and re-verification.
3. **Fix Inventory's missing health check** — trivial, independent, no reason to wait (can happen in parallel with step 2).
4. **Authentication** (`docs/17`) — must land before any real traffic reaches admin routes; can begin schema/design work in parallel with step 2 but the `User` table itself should be created during the database migration, not as a separate migration later.
5. **Storage** (`docs/18`) — needed specifically for Booking's passenger documents and any real gallery/voucher/invoice file output; independent of auth, can run in parallel with step 4.
6. **Background jobs** (`docs/19`) — depends on step 2 being complete (jobs need durable state to act on, e.g. a real Quote-expiry sweep needs Quotes to survive a restart).
7. **Redis cache** (`docs/20`) — last, and lowest risk: a pure performance optimization on top of an already-durable, already-authenticated system. Implementing it before the database migration would mean caching data that can vanish on restart anyway, which is not a meaningful optimization.
