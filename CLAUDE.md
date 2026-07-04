# TVV Travel OS — Project Memory

## Project Name

TVV Travel OS

## Vision

An AI-powered Travel Operating System — not an OTA, not a booking website, not a CRM. It is the operational core that a separate, existing public website, the travel operations team, and the sales team all consume through APIs. Full detail: `docs/00_PROJECT_VISION.md`.

## Architecture Principles

- **Supplier Agnostic** — TripJack, Ferry operators, and every future supplier sit behind one interface per product type; business code never references a supplier by name.
- **API First** — every capability is an API before it is a UI, including for the admin's own dashboard.
- **Inventory Driven** — Hotels, Flights, Activities, Transfers, Visa, Insurance are all one polymorphic inventory model.
- **Destination First** — Destination is the anchor entity everything else (packages, activities, hotels, guides) is scoped to.
- **Headless CMS** — content is structured data served via API, not hand-built HTML tied to one output.
- **AI Ready** — AI-generated packages/content flow through the same review/publish path a human-created record would.

## Business Objects

| Object | Meaning here |
|---|---|
| **Destination** | The anchor geography entity (country → region → destination) everything else is scoped to |
| **Package** | A sellable itinerary — Static (fully pinned), Dynamic (fully live-resolved), or Semi-Dynamic (mixed) |
| **Booking** | A confirmed purchase created ONLY from an APPROVED Quote — header + frozen line items, each a snapshot of the source Quote's items. Own bounded-context entity (`src/modules/booking/`). Full detail: `docs/08_BOOKING_ENGINE.md` |
| **Traveller** | **Resolved** — its own first-class type (`src/modules/booking/types/traveller.ts`), not left implicit. Supports adult/child/infant, passport/visa/DOB/gender/nationality/emergency contact, one designated lead traveller per booking, with duplicate prevention on add (passport number or fullName+DOB match) |
| **Flight** | An Inventory kind; canonical item represents a *Route*, not a specific flight — actual fares are always live-quoted through the Supplier Engine, never persisted as catalog |
| **Hotel** | An Inventory kind; canonical item is the physical property, supplier offers/rates attach to it |
| **Activity** | An Inventory kind; canonical item plus supplier offers, same shape as Hotel |
| **Transfer** | An Inventory kind covering ferries, road transfers; `mode` field distinguishes them |
| **Supplier** | TripJack, TBO, HotelBeds, Makruzz, or a manual/contracted source — a row in `suppliers`, never a table name or a code branch |
| **Inventory** | The polymorphic core (`inventory_items` + per-kind detail tables) every sellable thing is an instance of |
| **Payment** | A manually recorded transaction against a Booking (`BookingPayment` — amount, method as free text, status) — no gateway integrated. `Booking.paymentStatus` is the aggregate computed from every payment record, driving automatic status bumps (CONFIRMED → PARTIALLY_PAID/PAID) |
| **Quote** | A priced-but-not-yet-booked itinerary shared with a customer before commitment — **resolved**: its own bounded-context entity (`src/modules/quote/`), not a Package draft state and not a Booking pre-status. Has its own status lifecycle, versioning, and expiry (`validFrom`/`validTo`). Full detail: `docs/14_QUOTE_ENGINE.md` |

## Future Integrations

- TripJack (flights & hotels)
- Ferry API (audit finding: not actually present in the current codebase despite being referenced as existing — see `docs/01_CURRENT_SYSTEM_AUDIT.md` for the discrepancy; confirm before scoping `docs/11_FERRY_INTEGRATION.md`)
- AI (package generation, content generation)
- Website (existing, separate repo — consumes this system's API, is never rebuilt by this project)
- Future Suppliers (TBO, HotelBeds, Makruzz, Manual/contracted)

## Future Engine Modules (approved in architecture, not yet scheduled for implementation)

`docs/02_SYSTEM_ARCHITECTURE.md` (Architecture Approved) names two Engine-layer modules that don't yet appear anywhere else in this project's docs. They stay in the architecture as approved future modules — do not implement either until explicitly scheduled:

- **Search Engine** — cross-cutting search over Inventory/Packages/Destinations. No API contract, data model, or folder scoping exists yet.
- **Notification Engine** — event-driven notifications (e.g. the Booking Created → voucher/email/CRM-notify chain sketched in `docs/02_SYSTEM_ARCHITECTURE.md`'s Event Flow section). No API contract, data model, or folder scoping exists yet.

Neither has a corresponding numbered file in `docs/02`–`13`; when one is scheduled, give it its own doc rather than folding it into an unrelated engine's file.

## Governing Migration Principles (standing — apply to all future work on this project)

- Never delete existing features.
- Reuse existing pages — routes/URLs are a hard constraint.
- Refactor gradually — no big-bang rewrites.
- Minimize breaking changes; always preserve backward compatibility.
- If something needs replacing, explain why first, and ship the replacement as a migration path (expand → migrate → cut over → contract), never an atomic swap.
- Never rewrite everything at once.

## Documentation Structure

- `docs/00`–`docs/13` — the canonical, numbered architecture series (this project's primary reference going forward). As of this writing, `00_PROJECT_VISION.md`, `01_CURRENT_SYSTEM_AUDIT.md`, and `02_SYSTEM_ARCHITECTURE.md` (Architecture Approved) are populated; `03`–`13` are headings + TODO only, pending dedicated passes.
- `docs/CODING_CONVENTIONS.md` — unnumbered, companion to `docs/02`; defines how code is actually written against the approved architecture (imports, errors, logging, DI, health checks, API responses). Written alongside the `src/shared`/`src/api` backend foundation.
- Root-level `README.md`, `ARCHITECTURE_MIGRATION.md`, `DATABASE_SCHEMA.md`, `SUPPLIER_ABSTRACTION_LAYER.md`, `INVENTORY_SYSTEM.md`, `PACKAGE_BUILDER.md`, `WEBSITE_API.md` — an earlier, narrative-form pass over much of the same ground, produced before the `docs/` series existed. They are not deleted or moved (per the governing principles above) and remain useful source material for populating `docs/03`–`13`, but `docs/` is now the primary reference (`docs/02_SYSTEM_ARCHITECTURE.md` is Architecture Approved and already the source of truth, not something still being populated from these). Reconciling/retiring the overlap is a decision for the project owner, not taken unilaterally here. **Exception, decided:** their folder-structure proposals specifically are superseded — see below.

## Approved Folder Architecture

**`src/modules/*` is the approved architecture, decided over the earlier `src/domain` proposal.** Every future document must align with it — this is not a case-by-case choice.

Per `docs/02_SYSTEM_ARCHITECTURE.md`'s "Folder Philosophy" (Architecture Approved):
```
src/modules/
  crm/  inventory/  supplier/  destination/
  booking/  package/  pricing/  cms/  ai/
```
Each module is its own bounded context, owning its own `api/`, `services/`, `repositories/`, `validation/`, `types/`. No shared business logic between modules.

**Superseded:** the `src/domain/{models,ports}` + top-level `src/services/` + `src/state/` layered structure described in the root-level `SUPPLIER_ABSTRACTION_LAYER.md`, `INVENTORY_SYSTEM.md`, and `PACKAGE_BUILDER.md` (e.g. `src/domain/inventory/`, `src/suppliers/gateway/`, `src/services/inventory/`). Those documents' *domain content* (ports, DTOs, table designs, flows) is still valid source material; their *folder-structure sections* specifically are not — when `docs/04`, `05`, `07` etc. get populated from them, the folder trees must be rewritten against `src/modules/*`, not copied forward.

**Open gap, not yet resolved — flag before populating `docs/05_INVENTORY_ENGINE.md` or `docs/07_PACKAGE_BUILDER.md`:** `docs/02`'s module philosophy only names `api/services/repositories/validation/types` per module — it doesn't say where UI components, client-side state hooks, or the Next.js `src/app/` route tree fit relative to `src/modules/*`. The superseded docs had answers to this (e.g. `src/components/inventory/`, `src/state/inventory/`) but those specific answers don't carry over automatically just because the rest of that structure is superseded. This needs an explicit decision, not an inferred one.

## Current Stack

Next.js (App Router), React, TypeScript, Tailwind — in place today. Prisma + PostgreSQL are decided but **not yet present** in the codebase (no ORM, no DB client, no `.env` anywhere in `src/`) — their introduction is Phase 0/3 work, additive alongside the existing static pages, not a rewrite.

## Backend Foundation (implemented)

`src/shared/*` and `src/api/*` now exist — the reusable, module-agnostic foundation every future `src/modules/*` bounded context builds on: config service + env validation, logger, `AppError`/subclasses, `Result<T,E>`, `BaseRepository`/`BaseService` interfaces, a lightweight DI container + module registration pattern, a health-check registry (backing the one real route so far, `GET /api/health`), and the shared `ApiResponse` envelope. Full conventions: `docs/CODING_CONVENTIONS.md`.

No new npm dependencies were added to build this — logger, env validation, and DI are hand-rolled by deliberate choice, each behind an interface so swapping in a real library later changes one file, not every call site. No modules (`supplier`, `inventory`, `booking`, `package`, etc.) exist yet; this is only the ground they'll stand on. Existing UI, business logic, and all 20 pre-existing routes are untouched — verified via `tsc --noEmit` and a full `next build` after this foundation was added.

## Inventory Engine (implemented)

`src/modules/inventory/` is the first real bounded context, built on the shared foundation above: `InventoryItem` (discriminated union over `HOTEL | FLIGHT | ACTIVITY | TRANSFER | VISA | INSURANCE`), per-kind hand-rolled validators dispatched through a Kind Registry, an in-memory `InventoryRepository` (no DB yet), `InventoryService` (CRUD + archive), DI-registered via `module.ts`, and a full API surface (`GET/POST /api/inventory`, `GET/PATCH/DELETE /api/inventory/:id`) returning the shared `ApiResponse` envelope. Full detail: `docs/05_INVENTORY_ENGINE.md`.

**Deliberately not built**: Supplier Mapping (would edge into Supplier Engine territory, which still has no approved spec — see below) and UI components (blocked on the open `src/modules/*` UI-placement gap, still unresolved). `InventoryItem` has zero supplier-specific fields — provider-agnostic by construction, not by convention.

**Naming flag, unresolved**: an implementation instruction described 7 product types including "Ferries" and "Transfers" separately; built as 6 kinds with `TRANSFER.details.mode: "FERRY"|"ROAD"`, matching the Business Objects glossary below. Confirm if a separate top-level `FERRY` kind is actually wanted instead.

Verified beyond `next build`: the built server was started and every CRUD path (create, get, list, filter-by-kind, update, archive, not-found, validation-error) was exercised with `curl` against real HTTP responses, not just type-checked.

## Supplier Engine (implemented — Sprint 3)

`src/modules/supplier/` — Ports & Adapters, completely isolated (verified: `grep -rn "modules/inventory" src/modules/supplier/` matches only comments, zero imports). `Supplier` interface (`initialize/health/capabilities` real; `search/details/book/cancel/sync` throw `NotImplementedError`), `SupplierRegistry` (the only way to obtain a live adapter — never exported from the module's public barrel, only reachable from `module.ts`'s composition root), three placeholder adapters (`TripJackAdapter`, `FerryAdapter`, `ManualSupplierAdapter` — no API connected, no credentials, capabilities: `[FLIGHTS,HOTELS]` / `[FERRIES]` / `[HOTELS,ACTIVITIES]`), `SupplierConfigService` (own accessor per §5 of `docs/CODING_CONVENTIONS.md`, only enabled/disabled flags exist — no secrets), and `SupplierHealthCheck` registering every adapter into the *shared* `healthCheckRegistry` — `GET /api/health` required zero changes and now reports `self` + all three suppliers automatically (verified live: overall status `"degraded"`, accurate for three unimplemented placeholders). Read-only ops API: `GET /api/suppliers[?capability=]`, `GET /api/suppliers/:code`, `GET /api/suppliers/:code/health`. Full detail: `docs/04_SUPPLIER_ENGINE.md`.

**Inventory integration**: one new, inert file — `src/modules/inventory/services/inventory-supplier-bridge.ts` (`getSupplierForCode`/`getSuppliersForCapability`) — not exported from Inventory's barrel, so Inventory's existing behavior is unchanged and no search is actually performed yet. No existing Inventory file was modified.

**Deliberate deviation from a literal reading of the sprint brief**: "capabilities()" and "initialize()"/"health()" were implemented as real, working methods rather than throwing `NotImplementedError` like the other five — a uniform read would have made dynamic capability discovery and the health-check integration (both explicitly required deliverables) impossible to satisfy. Reasoning recorded in `docs/04_SUPPLIER_ENGINE.md`.

TripJack and Ferry are explicitly **not** implemented — placeholders only, per that sprint's acceptance criteria.

## TripJack Connector (implemented — Sprint 4, architecture only, no live API)

`src/modules/supplier/adapters/tripjack/` — the flat `tripjack.adapter.ts` from Sprint 3 was expanded into a full connector folder (`client/config/dto/mappers/services/types/utils`), still registered under the exact same `code`/`name`/`capabilities()` contract, so `module.ts` needed no changes beyond `adapters/index.ts`'s import path. `TripJackConfig` reads 7 values (API URL, Agency ID, User ID, Password, Token, Timeout, Retry Count) via the shared `validateEnv` pattern — nothing hardcoded, all-empty defaults. `TripJackClient` (the only file that would ever hold a real HTTP call) has 9 methods, each logging a prepared request then throwing `NotImplementedError`. `TripJackAuth`, `TripJackErrorHandler` (real, working — pure error-shape normalization), `TripJackResponseParser` (real, working — pure validation), `TripJackCapabilities` (TripJack's own internal, more granular capability list, distinct from and not replacing the Supplier-Engine-level one), 9 request + 9 response DTOs, and 2 mapper classes (`TripJackFlightMapper`, `TripJackHotelMapper`) producing Inventory-shaped plain objects **without importing `src/modules/inventory`** — isolation holds (verified: `grep -rn "modules/inventory" src/modules/supplier/adapters/tripjack/` matches only an explanatory comment). `health()` now reports `NOT_CONFIGURED` specifically (verified live via `curl`), distinct from Ferry/Manual's generic placeholder message. Full detail: `docs/10_TRIPJACK_INTEGRATION.md`.

## Project Strategy: Provider-First (decided — supersedes the live-TripJack-first direction Sprint 4 was heading toward)

**TripJack live authentication was started (Sprint "TripJack Auth") and explicitly halted before any code was written** — no credentials or TripJack API documentation existed anywhere in the project (verified: no `.env`, no `TRIPJACK_*` env vars set, no API spec file). Rather than guess at a real third-party auth contract, the project direction changed: **build the complete Travel OS on mock/in-memory suppliers first; TripJack becomes the final integration phase (Sprint 14), Ferry after it (Sprint 15).** The TripJack Connector architecture from Sprint 4 is frozen as-is — correct, not touched, not extended with live calls. New roadmap: Destination (5) → Website API (6) → Package Builder (7) → Booking (8) → CMS (9) → AI Package Builder (10) → Website Integration (11) → CRM (12) → Pricing (13) → Live TripJack (14) → Live Ferry (15).

**Binding rule going forward**: TripJack is a Supplier, not the business. Inventory, Destination, Package Builder, and Bookings are the business. No business-layer module may import from `src/modules/supplier` directly — only through the same Registry pattern Inventory's (still-inert) bridge already established.

## Destination Engine (implemented — Sprint 5)

`src/modules/destination/` — the primary business object per docs/00/02 ("Everything belongs to a destination"), isolated from both Inventory and Supplier (zero imports from either, grep-verified). Two hierarchies: geography (`Country → State → City`, plus `Region` and `Airport`, five entities deliberately consolidated into one types/validation/repository/service file each — reference data, not divergent domain shapes like Inventory's kinds) and destination-to-destination (`parentDestinationId`, self-referencing, cycle-checked on create, capped at 20 levels). `getBreadcrumbs()` and `getChildren()` both verified live end-to-end (created Andaman Islands → Havelock Island/Neil Island, breadcrumbs returned root-first, nearby correctly returned the sibling). `getNearby()` is a heuristic today (siblings → same city → same state/country) — no geo-distance math yet, `latitude`/`longitude` fields exist for that upgrade. `Destination` holds SEO (embedded), Gallery and FAQ (embedded arrays, managed via dedicated add/remove service methods — verified live), and `guideReferenceIds` (reference-only, CMS doesn't exist yet). Duplicate-slug creation correctly rejected with `ConflictError` (verified live). 17 routes under `/api/destinations/*` and `/api/geography/*`, all through the shared `ApiResponse` envelope; `destination` health check registered (trivially healthy, no external dependency). Full detail: `docs/06_DESTINATION_ENGINE.md`.

**"Do NOT duplicate Inventory, reference IDs only" was satisfied structurally**, same discipline as Supplier Engine's isolation: `Destination` has no field that could hold copied inventory data. The existing `InventoryItem.destinationId` link (built in Sprint 2) is untouched — this sprint added no new coupling in either direction, per "do not change existing modules."

## Package Engine (implemented — Sprint 6)

`src/modules/package/` — the largest bounded context so far (60 module files + 24 routes). Isolated from Supplier/TripJack (zero imports, grep-verified); a genuine consumer of Inventory and Destination via their public service accessors (the approved direction per docs/02), limited to exactly four files (`package-item.service.ts`, `package-day.service.ts`, `package.service.ts`, `itinerary/package-itinerary.service.ts`).

**One data model, not five**: `PackageItem.resolutionMode` (`PINNED`/`SLOT`) is what makes Manual/Dynamic/AI/Supplier/Mixed packages one shape — `Package.sourceType` is a derived label set by whichever of the 5 Builder classes constructed it. Full domain: `Package`, `PackageDay`, `PackageItem` (8 kinds: `DESTINATION`/`HOTEL`/`FLIGHT`/`TRANSFER`/`ACTIVITY`/`VISA`/`INSURANCE`/`MEALS` — Ferry folded into `TRANSFER`, same decision as every prior sprint), `PackagePricing`, `PackageRule`, `PackageAvailability`, `PackageVersion` — each its own repository; `PackageTemplate`/`PackageSEO`/`PackageFAQ` are flags/embedded fields on `Package`, not separate entities (flagged as a scope decision, not assumed).

**Two real bugs found and fixed during end-to-end verification, not left in**: (1) the builder orchestration defaulted a package's `code` to its raw title, which broke on any title with spaces — fixed to let validation's own slugify+uppercase derivation run instead of bypassing it. (2) the pricing calculator double-counted the base price in `compute()`'s total (an informational "Base (per adult)" line was summed alongside "Adults × N", which already included it) — a ₹45,000 base showed as ₹148,950 instead of the correct ₹103,950. Both reproduced via `curl` before the fix and re-verified after.

Verified live end-to-end: built a real package (Manual builder, referencing an actual Inventory hotel and an actual Destination), confirmed duplicate-inventory rejection (`CONFLICT`), rule evaluation correctly failing under-minimum pax, price computation, publish (version 1 created, `currentVersionId` set), and clone/duplicate producing auto-disambiguated codes/slugs. `package` health check registered (trivially healthy). Full detail: `docs/07_PACKAGE_BUILDER.md`.

**Known gap, flagged**: `aiGeneratedFromId` exists on `Package` (reserved for Sprint 10) but nothing persists a non-null value yet — same reserved-but-inert pattern as Destination's `guideReferenceIds`.

## Website API — Backend for Frontend (implemented — Sprint 7)

`src/modules/website/` — a pure aggregator, zero repositories of its own, every read through `getPackageService()`/`getDestinationService()`/`getPackagePricingService()` (Package's and Destination's public service accessors), never a repository. Isolated from Supplier/TripJack (zero imports, grep-verified). Resolves the open gap `docs/09_WEBSITE_API.md` had been carrying since Sprint 5: the public-facing facade is its own bounded context, not a thin unowned route layer.

7 routes (`/api/website/{home,packages,package/:slug,destinations,destination/:slug,search,navigation}`), all returning `dto/website-*.dto.ts` shapes — never the internal `Package`/`Destination` entity (verified by inspection: no `currentVersionId`/`sourceTemplateId`/raw pricing rules ever appear in a response). `cache/website-cache.port.ts` is an interface only, per explicit instruction — no concrete implementation, nothing depends on one yet (same reserved-but-inert pattern as `Package.aiGeneratedFromId`). SEO: canonical URLs via a `WebsiteConfigService`-held base URL (same `validateEnv` pattern as every module), meta/OG fallbacks, and explicitly-flagged-provisional JSON-LD placeholders for breadcrumbs and tourist-trip schema.

**Bug found and fixed during verification, not left in**: homepage/search package cards initially skipped destination+price resolution for performance, showing empty `destinationName`/`fromPrice` on every card. Fixed by making `WebsitePackageService.toSummaryDTO()` public and reusing it (via constructor injection, avoiding a circular import with `module.ts`) from `HomepageService` and `WebsiteSearchService`. Reproduced (`destinationName: ""`) before the fix, re-verified (`destinationName: "Havelock Island", fromPrice: 90000`) after.

Verified live end-to-end: built a full chain (destination → hotel → published package with pricing + FAQ), then confirmed homepage, package detail (itinerary/gallery-from-item-images/FAQs/related/breadcrumbs/SEO all correctly assembled), destination detail (featured packages, empty `guides: []`, breadcrumbs), search (keyword match, price-range filtering both directions), navigation (dynamic popular destinations), and correct `NOT_FOUND` responses for missing slugs. `website` health check registered (trivially healthy).

**Known gaps, flagged**: `Package` has no top-level `description` field, so `WebsitePackageDetailDTO` has none either (not fabricated from day descriptions). "Popular Destinations" and the hero banner/nav menu are static/provisional placeholders — real versions need Booking-Engine analytics and CMS (Sprint 9) respectively. Full detail: `docs/09_WEBSITE_API.md`.

## Quote Engine (implemented)

`src/modules/quote/` (30 module files, 12 routes) — resolves the Quote ambiguity flagged in the Business Objects table above: its own bounded-context entity, not a Package draft state and not a Booking pre-status. A genuine consumer of Package, Destination, and Inventory via their public service accessors only (`getPackageService()`, `getDestinationService()`, `getInventoryService()`, never a repository — grep-verified zero imports from `src/modules/supplier`, `src/modules/website`, or any booking module).

Status lifecycle: `DRAFT → SENT → APPROVED → CONVERTED`, with `REJECTED` reachable from DRAFT/SENT. `send()` freezes items + computed pricing into an immutable `QuoteVersion` (same principle as `PackageVersion`/`publish()`). Items lock once APPROVED/REJECTED/CONVERTED (verified live: item mutation against an APPROVED quote returns `CONFLICT`). Pricing adjustments (markup/discount) live directly on the Quote (`adjustments: QuoteAdjustment[]`) rather than a separate pricing entity — `duplicate()` deliberately copies them, unlike Package's `clone()`, since here they're the quote's own state, not a reusable record. `convertToBooking()` requires APPROVED and returns a `BookingHandoffPayload`; `Quote.convertedBookingId` is reserved-but-inert (same pattern as `Package.aiGeneratedFromId`) since no Booking module exists yet to populate it. PDF-ready data model (`QuotePdfData`) is a pure data assembly, no rendering library installed (same discipline as Website's cache port).

Verified live end-to-end: full prerequisite chain (country → destination → hotel → package) → created a quote with traveler details + a 10% markup + flat discount → added PACKAGE/INVENTORY/CUSTOM line items → computed pricing correctly (`58000` subtotal → `62300` total) → sent (version created) → convert-before-approval correctly rejected → approved → item-edit-after-approval correctly rejected → converted (payload returned, `convertedBookingId` stayed null) → re-conversion correctly rejected → duplicated (items + adjustments copied into a fresh DRAFT) → duplicate remained editable. `tsc --noEmit` and `next build` both clean (12 new routes, 47 total, every pre-existing route unchanged). `quote: healthy` registered in `GET /api/health`. Full detail: `docs/14_QUOTE_ENGINE.md`.

**Known gap, flagged**: no rollback-to-version endpoint (unlike Package) — a meaningful Quote rollback would need to also restore the item list, a larger decision left open rather than half-built.

## Booking Engine (implemented — Sprint 9)

`src/modules/booking/` (60 module files, 16 routes) — created **only** from an APPROVED Quote (`BookingService.createFromQuote()` is the sole entry point). Never modifies Packages or Quotes: zero imports of either's repository anywhere in this module (grep-verified). The one touch on Quote is a single call to Quote's own public `convertToBooking()` service method — the sanctioned state transition Quote itself exposes (requires APPROVED, flips Quote to CONVERTED, returns a `BookingHandoffPayload`) — same public-service-boundary discipline as every other module edge in this project (Package → Inventory/Destination, Quote → Package/Destination/Inventory). Consumes the immutable `QuoteVersion` snapshot (`sourceQuoteVersionId` = Quote's `currentVersionId` at conversion time).

Lifecycle: `DRAFT → CONFIRMED → PARTIALLY_PAID/PAID → TICKETED → COMPLETED`, `CANCELLED` reachable from any non-terminal state — enforced by a pure state machine (`status/booking-status-machine.ts`). All 10 domain objects from the brief implemented, each its own repository: `Booking`, `BookingItem` (frozen 1:1 copy of the source Quote's items, no API to edit), `Traveller` (duplicate prevention on passport number or fullName+DOB, verified live), `PassengerDocument`, `BookingPayment`, `BookingInvoice`, `BookingVoucher`, `BookingStatusHistory`, `BookingTimeline`, `BookingNote`.

Payments are manual (no gateway) — `payments/payment-calculator.ts` (pure) computes the aggregate `paymentStatus`/`amountPaid` from every recorded payment, automatically bumping `Booking.status` through the state machine (verified live: partial ₹20,000 of ₹65,000 → `PARTIALLY_PAID`; the remaining ₹45,000 → `PAID`, unlocking `ticket()`). `SupplierBookingReference` stays a placeholder (`NOT_REQUIRED`/null) on every `BookingItem` — no TripJack/Ferry call anywhere in this module. Voucher and Invoice are persisted, sequentially-numbered, PDF-ready data models only (no rendering library, same discipline as Quote's PDF model).

**8 routes explicitly requested; 8 more added** (flagged, not silently expanded) because the stated domain objects/lifecycle would otherwise be unreachable: `ticket`/`complete` (TICKETED/COMPLETED have no other path), `items` (read-only), `travellers` (add/remove, duplicate-prevented), `documents`, `payments` (otherwise `BookingPayment` + required "Payment validation" would be dead code), `notes`, `timeline`, `status-history`.

Verified live end-to-end: full chain (country → destination → hotel → package → quote sent+approved → booking), booking-creation correctly rejected from a non-APPROVED quote then succeeded once approved (quote → CONVERTED), double-booking from the same converted quote correctly blocked, payment-before-CONFIRMED blocked, partial→full payment correctly drove PARTIALLY_PAID→PAID, ticket/complete succeeded in order and CANCELLED correctly blocked once COMPLETED, a separate DRAFT booking cancelled directly, duplicate-traveller prevention confirmed on both match types, voucher/invoice/notes/documents all generated correctly. `tsc --noEmit` and `next build` both clean (16 new routes, 63 total, every pre-existing route unchanged — file counts for all 6 prior modules match exactly). `booking: healthy` registered in `GET /api/health`. Full detail: `docs/08_BOOKING_ENGINE.md`.

**Known gap, flagged**: `Quote.convertedBookingId` stays permanently `null` — no write-back path exists from Booking to Quote without either a Quote→Booking import or Booking writing to Quote's repository directly, both ruled out by "never modify Quotes."

## Testing Framework (implemented — Phase 2, Platform Stabilization)

`tests/` — Vitest (unit + integration), Supertest (HTTP-level integration), Playwright (`request`-fixture-based e2e, no browser install needed since no admin UI exists yet), and MSW (external-call mocking, staged for Sprint 14). Zero `src/` files changed to build this (verified: `git diff --stat -- src/` empty) — no business logic or architecture changes, per this phase's explicit instruction. All three suites verified green: 26 unit files / 199 tests (198 passing + 1 deliberately-expected failure, see below), 8 integration files / 38 tests, 2 e2e files / 3 tests.

**A real, previously-unknown bug was found while writing these tests, not fixed**: `pricing-calculator.ts`'s seasonal-adjustment amount is double-counted in the final total (`resolveSeasonalAdjustment`'s amount is pushed as its own line item AND folded into `adultUnitPrice` before "Adults × N" is computed — the exact same double-counting bug class as the already-fixed base-price bug, in the seasonal path instead). Captured as `it.fails(...)` in `tests/unit/package/pricing-calculator.test.ts` with the correct expected total documented inline, per this phase's new standing policy: **every bug found from now on becomes a regression test before it becomes a fix.** This is the first fix queued for whenever business-logic changes are next authorized.

Two previously-fixed bugs (Package's base-price double-count, Website's homepage/search enrichment gap) now have permanent regression tests locking in their correct values — both currently pass.

Unit tests run against either a pure function directly, a service constructed with a real in-memory repository, or (for Package/Quote/Booking lifecycle coverage) the real module-registered DI graph (`getQuoteService()` etc.) — server-free but exercising real cross-module composition. Integration tests boot one real `next start` process (`tests/helpers/global-setup.ts`) and hit it via Supertest; `fileParallelism: false` is deliberate since every test shares that one process's in-memory store. E2E tests drive the full country→destination→package→quote→booking→payment→ticket→complete funnel, plus a rejection and a cancellation flow, over real HTTP via Playwright's API-testing fixture — the same sequence every sprint's manual `curl` verification built by hand, now automated and repeatable.

**Known gaps, flagged**: no CI wiring yet (runs locally only); coverage (~39% statement, unit-suite-only) isn't merged across all three suites; TripJack connector internals remain untested (nothing calls them yet); concurrency is never exercised (single in-memory store — genuinely testable only once `docs/16`'s database migration lands). Full detail: `docs/21_TESTING_FRAMEWORK.md`.

## Authentication & Authorization Platform (implemented — Sprint 11, Platform Stabilization)

`src/modules/auth/` (63 module files) + `src/middleware.ts` + 21 new routes (106 total) — a complete, hand-rolled RBAC platform per this sprint's explicit spec (Auth.js, previously recommended in `docs/17`, was NOT used this time; the sprint asked for `src/modules/auth/{jwt,sessions,roles,permissions,audit,middleware,...}` built to this project's own module conventions instead, and that's what was built). Zero business-module files changed — every existing route becomes protected purely by `src/middleware.ts` now existing.

All 10 domain objects implemented (`User, Role, Permission, UserRole, RefreshToken, Session, LoginHistory, PasswordReset, AuditLog, ApiKey`), 12 roles seeded (`SUPER_ADMIN` through `API`), 36 permissions (9 resources × 4 CRUD actions) with a role→permission matrix mapped to real module ownership. Hand-rolled HS256 JWT (`node:crypto`, no `jsonwebtoken` dependency — `timingSafeEqual` signature comparison), `scrypt` password hashing (Node's own recommended KDF, not bcrypt), selector/validator refresh tokens with rotation-reuse theft detection (verified live), account lockout after 5 failed attempts, device/IP tracking, and all 7 required audit event types.

**Major architectural finding, verified live, not assumed**: Next.js runs `src/middleware.ts` in a module context that does **not** share this project's in-memory `Map` repositories with the route-handler process — confirmed by a session created via `POST /api/auth/login` being immediately unreachable from a session-revocation check added to middleware. JWT verification and permission-matrix checks work correctly in middleware (both pure/stateless — they need only the shared `AUTH_JWT_SECRET` env var and a hardcoded permission matrix, not a repository lookup); session-revocation-on-logout and API-key verification do not reliably enforce from middleware today as a direct, temporary consequence — both are fully implemented and will start working correctly the moment `docs/16`'s database migration gives both contexts the same external database to query, rather than two separate in-process Maps. Logout does correctly revoke the session and refresh token (verified: refreshing afterward fails); only the already-issued short-lived (15 min) access token keeps working until its own expiry, the standard stateless-JWT tradeoff.

**Bug found and fixed during verification, not left in**: `createUserHandler` initially returned the full `User` entity including `passwordHash` in the API response. Fixed by adding `api/user.transformer.ts`'s `toPublicUser()`, applied to every handler that returns a `User`.

The previous sprint's entire test suite (26 unit / 8 integration / 2 e2e files) needed updating to authenticate, since every route they exercise is now correctly gated — added `tests/helpers/api-client.ts`'s auto-authenticating client and `tests/e2e/fixtures.ts`'s authenticated Playwright fixture; zero business-logic assertions changed, all 236 tests (198 unit + 38 integration + 3 e2e, plus 1 pre-existing expected-fail) pass. Build required a new `next.config.ts` (`experimental.nodeMiddleware: true`) since `node:crypto` isn't available in Next's default Edge middleware runtime — confirmed by a real build failure before this was added. `auth: healthy` registered in `GET /api/health`.

**Known gaps, flagged**: row-level permission scoping (a CUSTOMER can read any Quote, not just their own) — resource-level grants only this sprint; no email provider wired anywhere (password-reset tokens are logged server-side, not emailed); bootstrap `SUPER_ADMIN` (`admin@tvv-travel-os.local` / `ChangeMe123!`) and `AUTH_JWT_SECRET`'s dev-default must both be rotated before any non-local deployment. Full detail: `docs/22_AUTH_PLATFORM.md`.

## A note on this file's location

This file was created at the repository root (`/CLAUDE.md`), not inside `/docs`, even though the numbered file list in the originating brief grouped it with the `/docs` series. Reason: a `CLAUDE.md` at the project root is the file Claude Code conventions auto-load as project memory in every future session; placed inside `/docs` it would not be. Since this file's stated purpose is to *be* project memory, root placement is what makes it actually function that way. Flagged explicitly per the standing "explain why before deviating" principle above, rather than silently placed.
