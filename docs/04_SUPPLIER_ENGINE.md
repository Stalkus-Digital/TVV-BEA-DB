# 04 — Supplier Engine

**Status:** Implemented under `src/modules/supplier/` — Sprint 3. Ports, Registry, and three placeholder adapters (TripJack, Ferry, Manual) exist and are wired via DI; no real supplier API is connected, per explicit instruction.

## Ports

`Supplier` (`src/modules/supplier/types/supplier.port.ts`) is the one interface every supplier — TripJack, Ferry, Manual, and every future one — implements:

```
initialize()    — real, working: reads this supplier's config, logs, returns ok()
health()        — real, working: reports honest status (placeholder adapters report "degraded")
capabilities()  — real, working: static metadata, no external call
search()        — throws NotImplementedError
details()       — throws NotImplementedError
book()          — throws NotImplementedError
cancel()        — throws NotImplementedError
sync()          — throws NotImplementedError
```

**Why the split isn't uniform**, since the sprint brief's "methods should throw NotImplementedError" could be read as applying to all eight: `capabilities()` returning real data is what makes dynamic capability discovery possible at all (a throwing `capabilities()` would make `SupplierRegistry.getSuppliersByCapability()` unusable), and `initialize()`/`health()` needing to actually work is what makes supplier registration and the health-check integration testable, both explicitly required by this sprint's Testing section. Only the five methods that would require a real external call throw — resolved this way rather than applying the instruction uniformly and breaking the sprint's own test requirements; flagged here rather than silently decided.

`SupplierCapability` (`FLIGHTS | HOTELS | ACTIVITIES | FERRIES | TRANSFERS | VISA | INSURANCE`) is defined independently of Inventory's `InventoryKind` — the Supplier Engine imports nothing from `src/modules/inventory` (verified: `grep -rn "modules/inventory" src/modules/supplier/` matches only comments, no imports).

## Adapters

`BaseSupplierAdapter` implements the real three methods and the NotImplementedError-throwing five; `FerryAdapter` and `ManualSupplierAdapter` still just supply a code/name/capability list and do nothing beyond what `BaseSupplierAdapter` already does. **`TripJackAdapter` was expanded in Sprint 4** from a single flat file into a full connector folder — `src/modules/supplier/adapters/tripjack/` (client/config/dto/mappers/services/types/utils) — full detail in `docs/10_TRIPJACK_INTEGRATION.md`. Its public contract (code, name, `capabilities()` return value) is unchanged, so this required zero changes to `module.ts` beyond nothing at all — only `adapters/index.ts`'s import path moved from `./tripjack.adapter` to `./tripjack`. None of the three adapters is exported from the module's public `index.ts` — only reachable from `module.ts`'s own composition root, which is what makes "never instantiate suppliers directly" structural rather than a convention.

## Supplier Registry

`SupplierRegistry` (`src/modules/supplier/services/supplier-registry.ts`) is the only way any code obtains a live `Supplier` instance: `getSupplier(code)`, `getAllSuppliers()`, `getSuppliersByCapability(capability)`. Capability discovery is genuinely dynamic — `getSuppliersByCapability` filters live adapters by calling their real `capabilities()`, not a hardcoded lookup table.

## Health Checks

Every registered supplier is wrapped in `SupplierHealthCheck` (`utils/`) and registered into the *shared* `healthCheckRegistry` at bootstrap (`module.ts`) — `GET /api/health` required zero changes and now aggregates `self` + `supplier.tripjack` + `supplier.ferry` + `supplier.manual` automatically. Verified live: overall status reports `"degraded"` (accurate — three placeholders, nothing broken, nothing real).

## Configuration

`SupplierConfigService` (own accessor, same pattern as the shared `ConfigService`, per `docs/CODING_CONVENTIONS.md` §5 — module-specific keys don't get added to the shared one) currently reads three boolean enabled/disabled flags (`TRIPJACK_ENABLED`, `FERRY_ENABLED`, `MANUAL_SUPPLIER_ENABLED`, all with safe defaults). No API keys, no secrets, no credentials anywhere — there's nothing real to configure yet. Real credentials get added here, never hardcoded, only when a supplier is actually implemented.

## Dependency Injection

`module.ts` registers, via `Container` factories (nothing manually `new`'d outside this file): the three adapters, `SupplierRegistry`, `InMemorySupplierRecordRepository`, `SupplierService`. A fire-and-forget async bootstrap then registers all three adapters into both the registry and the health-check registry on first import — verified end-to-end with `curl` against a running `next start`, not just type-checked.

## Repositories

`SupplierRecordRepository` (in-memory, same pattern as Inventory's) persists *metadata about* registered suppliers (code, name, capabilities, status, registeredAt) — distinct from the live adapter instance, and the concrete home for docs/02's "Supplier Engine Owns: ... Health, Credentials, Logs" once there's something real to store.

## API (read-only, ops-facing — not part of this sprint's named deliverables, added because "Testing: verify supplier registration" needed something to curl)

```
GET /api/suppliers?capability=HOTELS   — list, optional capability filter
GET /api/suppliers/:code               — detail
GET /api/suppliers/:code/health        — one supplier's health snapshot
```

## Inventory Integration

**No existing Inventory file was modified.** One new file, `src/modules/inventory/services/inventory-supplier-bridge.ts`, exposes `getSupplierForCode()`/`getSuppliersForCapability()` — Inventory is now *capable* of reaching the Supplier Registry, exactly as instructed, but this file is deliberately not exported from Inventory's `index.ts` or `services/index.ts`, so nothing about Inventory's existing behavior changes and no search is performed. Wiring it into a real `InventoryService.search()` is future work.

## Remaining TODOs before TripJack implementation

See the chat response for the full four-part sprint summary; the short version: real request/response shapes for `search`/`book`/etc. (today's are intentionally loose `[key: string]: unknown` placeholders), real TripJack credentials via `SupplierConfigService`, a decision on whether `search()` results need per-capability typed shapes now or can stay generic until Package Builder needs them, and `docs/10_TRIPJACK_INTEGRATION.md` populated as its own spec before any of that gets built — per this project's standing Architecture → Review → Implementation workflow.
