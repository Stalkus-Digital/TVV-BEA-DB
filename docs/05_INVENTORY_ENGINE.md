# 05 — Inventory Engine

**Status:** Core Model, Kind Registry (validation dispatch), and API contracts are implemented under `src/modules/inventory/`, on top of the `src/shared`/`src/api` backend foundation. Supplier Mapping and UI Components are intentionally not built yet — see the notes under each section below for why.

## Core Model

`InventoryItem` (`src/modules/inventory/types/inventory-item.ts`) is a discriminated union over `InventoryKind`:

```
InventoryKind = HOTEL | FLIGHT | ACTIVITY | TRANSFER | VISA | INSURANCE
```

Each member shares a common base (`id`, `destinationId`, `title`, `status`, `createdAt`, `updatedAt`) plus a kind-specific `details` shape (`HotelDetails`, `FlightRouteDetails`, `ActivityDetails`, `TransferDetails`, `VisaDetails`, `InsuranceDetails` — one file each under `types/kinds/`).

**Naming note:** the implementation task described this as "Flights, Hotels, Activities, Ferries, Transfers, Visa, and Insurance" (7 nouns). This was built as 6 kinds, with `TRANSFER` carrying a `mode: "FERRY" | "ROAD"` field — matching the already-approved Business Objects glossary in `CLAUDE.md` ("Transfer: An Inventory kind covering ferries, road transfers; `mode` field distinguishes them"), not a 7th top-level kind. Flagged for confirmation; trivial to split if a separate `FERRY` kind is actually wanted.

**Flight special case, implemented as designed:** a `FLIGHT`-kind item is a Route (`originAirportCode`/`destinationAirportCode`), not a bookable flight — no fare/schedule fields exist on it, consistent with schedules always being supplier-live and never persisted as catalog.

Status lifecycle implemented: `DRAFT → ACTIVE / ARCHIVED / MAINTENANCE`. Only `DRAFT`↔`ARCHIVED` is wired today (via `create`, which defaults to `DRAFT`, and `archive`, a soft delete via status update) — `ACTIVE`/`MAINTENANCE` transitions have no dedicated service method yet, just the `status` field on the type.

## Kind Registry

Implemented as a validation-dispatch table (`src/modules/inventory/validation/inventory-item.validation.ts`): `Record<InventoryKind, DetailValidator>` mapping each kind to its own hand-rolled validator (no schema library installed — consistent with the backend foundation's "no new dependencies" choice). `validateCreateInventoryItem`/`validateUpdateInventoryItem` dispatch through this table; adding a 7th kind means one new validator file plus one new entry here, not touching the create/update functions themselves.

No UI-facing kind registry (columns, filter schema, icon, form fields) exists — that was `INVENTORY_SYSTEM.md`'s original scope for this term, and is covered by the "UI Components" note below.

## Supplier Mapping

**Not built in this pass — intentionally.** The implementation instruction for this module was explicit: "Do not integrate suppliers yet," and this project's standing rule (`CLAUDE.md`) is not to make Supplier Engine architectural decisions without an approved spec (`docs/04_SUPPLIER_ENGINE.md`, still a stub at the time). Even a bare `InventoryItemMapping` type/table is adjacent enough to Supplier Engine concerns that it was left out rather than assumed. `InventoryItem` has zero supplier-specific fields anywhere in it — nothing to remove or migrate later when this does get built.

**Update (Sprint 3 — Supplier Engine now implemented, `docs/04_SUPPLIER_ENGINE.md`):** one new, inert extension-point file now exists, `services/inventory-supplier-bridge.ts` — `getSupplierForCode()`/`getSuppliersForCapability()`, calling `@/modules/supplier`'s registry. It is deliberately **not** exported from `index.ts` or `services/index.ts`, so it changes nothing about Inventory's existing behavior and performs no search. `InventoryService`, `InventoryItem`, and every other file in this module are untouched by Sprint 3, per that sprint's explicit "do not modify Inventory architecture" instruction.

## API Contracts (implemented, not originally a named section here — added to match what exists)

`src/modules/inventory/api/`: `CreateInventoryItemRequestBody`, `UpdateInventoryItemRequestBody`, `ListInventoryQuery` DTOs, plus framework-agnostic handlers (`listInventoryHandler`, `getInventoryItemHandler`, `createInventoryItemHandler`, `updateInventoryItemHandler`, `archiveInventoryItemHandler`) that the thin Next.js routes under `src/app/api/inventory/` and `src/app/api/inventory/[id]/` call directly. Every response goes through the shared `ApiResponse` envelope (`jsonSuccess`/`jsonError` from `src/api`). Verified against a running build: create/get/list/filter-by-kind/update/archive/not-found/validation-error all exercised via `curl` against `next start`, not just `next build`.

## UI Components

**Not built — blocked, as already flagged.** This section still cannot be written until the open gap in `CLAUDE.md` is resolved: where UI/state-hook code sits relative to `src/modules/*` (docs/02's Folder Philosophy only specifies `api/services/repositories/validation/types` per module, nothing about `components/` or client state). This implementation pass only built services/repositories/validation/types/API contracts, per explicit instruction — no UI was touched or added.

## Persistence

`InMemoryInventoryRepository` (`src/modules/inventory/repositories/inventory.repository.ts`) implements `BaseRepository<InventoryItem, string>` from the shared foundation, backed by a `Map`, not a database — Prisma + PostgreSQL are still not installed (`CLAUDE.md`). Replacing it with a Prisma-backed implementation later requires no change to `InventoryService`, the API handlers, or the routes — only a new class satisfying the same interface, registered in `module.ts` in place of the in-memory one.
