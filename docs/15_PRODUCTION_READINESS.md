# 15 — Production Readiness Audit

**Status:** Phase 2 — Platform Stabilization. This audit reviews all nine completed modules (Backend Foundation, Inventory, Supplier, TripJack Connector, Destination, Package, Website, Quote, Booking) against architecture, code-quality, and production-operations criteria. **No code was changed to produce this document** — every finding below was verified against the current repository state (file counts, grep checks, `tsc`/`next build` output), not recalled from memory alone. Five companion documents (`docs/16`–`docs/20`) turn the gaps found here into migration plans; this document does not itself propose implementation, only assesses current state and risk.

## Audit Methodology

- Grep-verified: health check registration per module, `dto/`/`cache/` folder existence, bare `throw new Error` usage outside config-loading code, direct `process.env` reads outside the `validateEnv` pattern, presence of auth/session/JWT code, raw `NextResponse.json` usage bypassing the shared envelope.
- Counted: files per module, route files per module (85 total), `package.json` dependencies.
- Checked for: test files (`*.test.ts`/`*.spec.ts`), `middleware.ts`, `.env` files, a test runner in `devDependencies`.
- Everything else (module-internal architecture, DI wiring, Result<T> usage, validation style) is drawn from having built every one of these modules directly in this project's session history, cross-checked against the module's own `docs/0X_*.md` file where one exists.

## Cross-Cutting Findings (apply across some or all modules)

### Architecture
**Strength**: the `src/modules/*` bounded-context structure (docs/02, Architecture Approved) has held for all 7 business modules without a single exception found — every module owns exactly `types/services/repositories/validation/api/module.ts/index.ts`, plus module-specific extra folders (Supplier's `adapters/`, Package's `builders/pricing/rules/itinerary`, Website's `seo/navigation/homepage/search/cache`, Quote's `pricing/pdf`, Booking's `status/payments/documents/voucher`). Cross-module calls consistently go through a public service accessor (`getXService()`), never a repository — grep-verified clean at every module boundary built this session.

**Weakness**: the architecture has never been tested under concurrent load or with a real database. Every guarantee above ("Inventory Driven", "Destination First", "no shared business logic") is enforced by convention and by this session's grep checks, not by a lint rule or CI gate — nothing stops a future change from importing a repository across a module boundary except discipline.

### Dependencies
**Strength**: `package.json` carries exactly `next`, `react`, `react-dom`, `lucide-react`, plus one native build dependency (`lightningcss-darwin-arm64`) and dev tooling (`tailwindcss`, `typescript`). Logger, env validation, DI container, and Result<T> are hand-rolled specifically so the backend foundation never needed an npm install — verified: zero of `pino`, `zod`, `prisma`, `ioredis`, `bcrypt`, `jsonwebtoken`, `next-auth` are present anywhere in `dependencies`/`devDependencies`.

**Weakness**: **no test runner is installed at all** (no `vitest`, `jest`, `@testing-library/*`) and **zero test files exist in the repository** (`*.test.ts`/`*.spec.ts` grep returned nothing). Every verification claim in every sprint's `docs/0X_*.md` file ("verified live") was a manual `curl` session against a running dev server, not an automated, repeatable test. This is the single largest gap standing between "it worked when I tested it" and "it's safe to deploy."

### Repositories
**Strength**: every module implements `BaseRepository<T, ID>` from `src/shared/repositories` with zero persistence-technology leakage into the interface — swapping in Prisma changes only the concrete class, not a single call site. Confirmed structurally consistent: all ~30 repository classes across 7 modules follow the identical `InMemoryStore<T>` wrapper pattern.

**Weakness**: **the `InMemoryStore<T>` helper class is duplicated verbatim across 6 modules** (`package/repositories/in-memory-store.ts`, `website` has none — it owns no repositories — `quote/repositories/in-memory-store.ts`, `booking/repositories/in-memory-store.ts`; Inventory/Destination/Supplier predate this exact helper and hand-roll `Map`-backed CRUD per repository instead). This is deliberate (per `docs/CODING_CONVENTIONS.md`: "no shared business logic between modules") but it is genuine duplication that a database migration must either preserve per-module or consciously decide to consolidate — see `docs/16_DATABASE_MIGRATION_PLAN.md`.

**Production risk**: all data is `Map`-based, in-process memory. A server restart (or, on Vercel, a fresh Fluid Compute instance) erases every Country, Destination, Package, Quote, and Booking created. This is by design (Provider-First Architecture, explicitly deferred to Phase 2) but means **the current build cannot go to production in any form** until `docs/16` is executed.

### Health Checks
**Weakness, verified**: **Inventory has no health check.** `grep -c "healthCheckRegistry.register" src/modules/inventory/module.ts` returns 0 — confirmed by reading the file directly. Every other business module (Supplier + its 3 adapters, Destination, Package, Website, Quote, Booking) registers one. This was never caught because `GET /api/health` degrading to `"degraded"` from the three intentionally-unconfigured Supplier adapters already looks "wrong" at a glance, masking the fact that Inventory is silently absent rather than present-and-healthy. Inventory was the first bounded context built, before the "every module gets a trivial health check" convention solidified in Sprint 3 — a real gap, not a stylistic choice.

**Strength**: every health check that does exist follows the same `HealthCheck` interface / `{name, status, checkedAt}` shape, and `GET /api/health` requires zero code changes to aggregate a newly-registered one — verified true for 6 consecutive sprints.

### Module Registration & Dependency Injection
**Strength**: the guarded `if (!moduleRegistry.getModule(name))` self-registration pattern (module registers itself as a side effect of being imported, idempotent under HMR) is identical across all 7 modules — no drift.

**Weakness**: registration order is implicit, driven by whichever route handler happens to import a module first at runtime. This has worked because dependencies are acyclic (Booking → Quote → Package/Destination/Inventory, never the reverse) and the DI container's `resolve()` is itself lazy (factories run on first `resolve`, not on `registerFactory`) — but there is no explicit boot sequence, and no test asserts the dependency graph stays acyclic as the codebase grows.

**Technical debt**: the hand-rolled `Container` has no scoping (request-scoped vs. singleton), no circular-dependency detection beyond what a `resolve()` stack overflow would eventually surface, and no way to inspect the full dependency graph short of reading every `module.ts` by hand.

### Folder Structure
**Strength**: 100% consistent with `docs/CODING_CONVENTIONS.md` §1 across all 7 modules — verified by directly listing every module's top-level folders this session.

**Open gap, carried from Sprint "Destination Engine" and never resolved**: `docs/02`'s module philosophy still only names `api/services/repositories/validation/types` — it never specified where client-side UI (React components, hooks, state) for these modules should live relative to `src/modules/*`. No UI has been built against any of these 85 routes yet, so the gap has had no practical consequence, but it will block the first UI sprint that touches this backend.

### Coding Standards
**Strength**: `docs/CODING_CONVENTIONS.md` (written alongside the backend foundation) has been followed without exception — relative imports within a module, `@/*` alias + barrel-only imports across module boundaries, `createLogger("<module>.<concern>")` everywhere, no bare `ConsoleLogger` instantiation outside `src/shared/logger`.

**Weakness**: the conventions document itself has never been updated to reflect patterns that emerged organically after it was written (e.g., the "reserved but inert field" pattern, the "freeze at add/publish time" pattern, the in-module `InMemoryStore<T>` helper). A new contributor reading only `docs/CODING_CONVENTIONS.md` would miss real, load-bearing conventions that only exist as inline code comments today.

### DTO Consistency
**Significant weakness, verified**: **Website is the only module with a `dto/` folder.** Every other module's API handlers return the internal entity type directly (`Package`, `Quote`, `Booking`, `InventoryItem`, `Destination`) — confirmed by reading every module's `api/*.handlers.ts` this session. For Website this is correct by design (`docs/09`: "never expose internal Package/Destination entities"). For the other six, it is a real inconsistency: **every admin API in this system currently leaks its full internal shape** — `Package.sourceTemplateId`, `Quote.adjustments[].id`, `Booking.sourceQuoteVersionId`, internal `snapshot: unknown` blobs on `PackageVersion`/`QuoteVersion` — to any caller. This was an acceptable simplification while every "caller" was a manual `curl` command in this session; it is not acceptable once a real admin UI or a third-party integration depends on these shapes, because every future internal refactor (renaming a field, changing `PackageStatus`'s values) becomes a breaking API change with no DTO layer absorbing it.

### Validation
**Strength**: every module hand-rolls request validation via a `Result<T, ValidationError>`-returning function per input shape, consistent style (`isNonEmptyString` local helper, explicit field-by-field checks, no schema library) across all 7 modules — verified by reading `validation/*.ts` in Package, Quote, and Booking directly.

**Weakness**: validation logic is **duplicated, not shared** — `isNonEmptyString`, ISO-date checks, and 3-letter-currency-code checks are each reimplemented per module (confirmed: Quote's `validateCurrency` and Package's pricing validation both hand-roll the same 3-letter check independently). This is consistent with "no shared business logic between modules," but a currency/date/string validator is not business logic — it's a utility, and duplicating it 4+ times is unnecessary technical debt with no architectural benefit.

**Weakness**: no request body size limit, no schema-level max-length on any string field (a `title` or `internalNotes` field can currently accept an arbitrarily large string and it will be accepted, validated as "non-empty," and stored).

### API Consistency
**Strength, strongly verified**: **every single route across all 85 route files returns `jsonSuccess`/`jsonError` from `src/api/http.ts`** — a grep for raw `NextResponse.json` usage across `src/app/api/` returned zero matches. The `{success, data}`/`{success, error}` envelope is genuinely universal, not just documented as a convention.

**Weakness**: no API versioning exists anywhere (`/api/website/*` was explicitly flagged as an open decision in Sprint 7 and never resolved; the rest of the API surface never even considered it). Every route is also unauthenticated (see Authentication Readiness below) and every route accepts unbounded pagination (`pageSize` is read from the querystring with no upper bound enforced anywhere — a request for `pageSize=999999999` would be accepted by every list endpoint in the system).

### Error Handling & Result<T>
**Strength**: the `Result<T, AppError>` pattern is used with zero deviation for every expected/domain failure across all 7 business modules — `NotFoundError`/`ValidationError`/`ConflictError` are the only error types constructed anywhere in module code (verified: `throw new Error` outside `src/shared/*` and config-loading code returns zero matches). `src/api/response.ts` guarantees a non-`AppError` never leaks its raw message to a client.

**Weakness**: there is no centralized error-reporting integration (no Sentry, no error-tracking SDK of any kind) — an `InternalError` today is logged to stdout via `ConsoleLogger` and nothing else. In production this means unexpected failures are invisible unless someone is actively tailing logs.

### Logging
**Strength**: `ConsoleLogger` emits structured JSON (`{timestamp, level, scope, message, meta}`) to stdout/stderr, already the right *shape* for a log aggregator to ingest without changes.

**Weakness**: `minLevel` defaults to `"debug"` with no environment-driven override anywhere in the codebase — every deployment, including a hypothetical production one today, would log at `debug` verbosity unless a future change wires `LOG_LEVEL` through `validateEnv`. No request-ID/correlation-ID exists, so log lines from concurrent requests are not currently groupable — a real gap for debugging production incidents at any real traffic volume. No log shipping/aggregation destination is configured (stdout only).

### Caching Readiness
**Verified**: `cache/` exists in exactly one module (Website), as an interface only (`WebsiteCache` port, zero implementation, zero consumer — confirmed via `grep -rn "cache/" src/modules/website` and reading `website-cache.port.ts`). No other module has even a placeholder for caching. `docs/02`'s explicit Caching Strategy (cache Airport List/Destination List/Hotel Metadata/Static Inventory; never cache Flight/Hotel Prices/Availability/Seat Maps) has never been implemented anywhere. Full plan: `docs/20_REDIS_CACHE_PLAN.md`.

### Database Readiness
**Verified, most consequential finding of this audit**: **zero database exists.** No ORM, no DB client, no `.env` file anywhere in the repo (confirmed: `find . -maxdepth 1 -iname ".env*"` returns nothing), no connection string, nothing. All 10+ repository interfaces across 7 modules are `BaseRepository`-shaped specifically so this is a mechanical, interface-preserving migration rather than a rewrite — but it has not started. Full plan: `docs/16_DATABASE_MIGRATION_PLAN.md`.

### Authentication Readiness
**Verified, second most consequential finding**: **zero authentication exists anywhere.** No `middleware.ts` file exists in the entire `src/` tree (confirmed via `find`). No session, JWT, cookie, or password-hashing code exists outside TripJack's own (non-functional, `NotImplementedError`-throwing) `tripjack-auth.service.ts`, which authenticates *to TripJack*, not *to this system*. All 85 routes — including every write path (`POST /api/bookings`, `POST /api/bookings/:id/payments`, `DELETE` operations) — are open to any caller who can reach the server. This has been correct and explicitly acknowledged throughout every prior sprint ("no auth exists anywhere in this codebase yet") because the whole system has been built and verified via direct `curl` access. It is the single hardest blocker to production. Full plan: `docs/17_AUTHENTICATION_ARCHITECTURE.md`.

### Scalability
**Strength**: statelessness at the request-handling layer is good — no route handler holds request-scoped mutable state, and the DI container's singleton-per-process model means a Fluid Compute instance can serve many concurrent requests once the in-memory `Map` is replaced by a real database connection pool.

**Weakness**: the in-memory `Map` store is itself the scalability ceiling today — it is process-local, so **horizontally scaling to more than one server instance today would give each instance a different, diverging dataset**, silently. This is invisible in local dev (`next start`, one process) and would only surface as data inconsistency in a real multi-instance deployment.

**Weakness**: several read paths are O(n) full-table scans in memory (`InMemoryStore.all().filter(...)`) — fine at current data volumes, but `WebsiteSearchService`'s price-range filter is explicitly documented as "an in-memory per-candidate pricing lookup (N+1)" (`docs/09`) and would need a real query/index once on Postgres.

### Performance
**Not measured**: no load test, no profiling, no bundle-size regression check exists. `next build`'s own output (First Load JS ~102–116 kB per route) is the only performance data point available, and it reflects the frontend bundle, not API latency. Given every "backend" call today is an in-memory `Map` lookup, current API latency numbers would be meaninglessly fast and would not predict post-database-migration performance at all.

### Security
**Verified gaps, beyond Authentication above**:
- No rate limiting anywhere — any route can be called at unbounded frequency.
- No CORS configuration — Next.js's default same-origin behavior is the only thing currently preventing arbitrary cross-origin browser calls to these APIs, which is not a deliberate security control, just an unconfigured default.
- No input size limits (see Validation above) — a large-payload request is not rejected until (if ever) it would fail an unrelated business-rule check.
- No secrets exist yet to leak (verified: no `.env` file, all Supplier configs read empty defaults) — this is currently a non-issue only because nothing is configured; the moment real TripJack credentials or a database connection string are added, this becomes the top security concern with no secret-scanning or rotation policy yet in place.
- The one prior finding from early in this project (a leaked TripJack webhook bearer token found in the original prototype's `template-generator.ts` during the initial audit) was flagged as P0 and never confirmed remediated — **carried forward here as still open** until explicitly re-verified.

---

## Per-Module Audit

### Backend Foundation (`src/shared/*`, `src/api/*`)

**Strengths**: zero-dependency, interface-first design (Logger/Config/DI/Errors/Result all behind swappable interfaces); genuinely reused without modification by every one of the 7 modules built on top of it; `Result<T,E>` + `AppError` hierarchy is complete and has needed zero changes since Sprint "Backend Foundation."

**Weaknesses**: `Container` has no scoping or circular-dependency detection (see Module Registration above); `ConsoleLogger` has no env-driven level control; no request-ID/correlation middleware exists.

**Technical debt**: none significant — this is the most mature part of the codebase precisely because nothing has needed to change it.

**Production risks**: `AppError`'s `isOperational` flag exists (used by `InternalError`) but nothing currently consumes it to decide, e.g., whether to crash-and-restart a process vs. log-and-continue — a common Node production pattern that's half-wired.

**Refactoring recommendations**: add `LOG_LEVEL` to the shared `validateEnv` schema; add a request-ID middleware that threads a correlation ID into every `Logger` call for that request.

**Missing components**: rate limiting, request-ID correlation, a health check for the DI container itself (e.g., "N modules registered, M tokens resolved").

### Inventory Engine

**Strengths**: clean polymorphic `InventoryItem` discriminated union (6 kinds), provider-agnostic by construction (zero supplier-specific fields), full CRUD + archive verified live via `curl` in its own sprint.

**Weaknesses**: **no health check registered** (verified gap, see above) — the only business module missing one. No `dto/` layer (shared weakness, see above).

**Technical debt**: hand-rolled `Map`-backed repository predates the `InMemoryStore<T>` helper that later modules extracted — Inventory's repository has more duplicated CRUD boilerplate than any later module's.

**Production risks**: silently absent from `GET /api/health` — an operator watching that endpoint would never see Inventory reported as unhealthy if its (currently nonexistent) database connection failed, because there is nothing to fail.

**Refactoring recommendations**: add `InventoryModuleHealthCheck` (trivially healthy today, same as every other module) before this module goes anywhere near production monitoring.

**Missing components**: health check (concrete, small, should be first fix in Phase 2); Supplier Mapping (deliberately deferred, still valid to defer); DTO layer.

### Supplier Engine + TripJack Connector

**Strengths**: the only module with a genuinely pluggable adapter pattern already proven twice (TripJack + Ferry + Manual, all registering into the same registry with zero changes to the registry itself); `TripJackClient`'s 9 methods each correctly throw `NotImplementedError` rather than silently no-op; per-adapter health checks (`NOT_CONFIGURED` vs. generic placeholder message) are more granular than any other module's health reporting.

**Weaknesses**: `SupplierConfigService` only tracks enabled/disabled flags — no secret-rotation or credential-versioning concept exists, which will matter the moment real TripJack credentials are added (Sprint 14, still future).

**Technical debt**: `TripJackCapabilities` (TripJack's own granular capability list) and the Supplier-Engine-level capability list are intentionally separate but nothing currently validates they stay consistent with each other as either evolves.

**Production risks**: this module is the eventual owner of real external credentials and real money-adjacent operations (flight/hotel booking) — it currently has zero rate limiting, zero circuit-breaker/retry logic (mentioned in `TripJackConfig`'s "Retry Count" field but not implemented anywhere), and zero timeout enforcement beyond a configured-but-unused `Timeout` value.

**Refactoring recommendations**: before Sprint 14 (Live TripJack), implement the retry/timeout/circuit-breaker logic the config already reserves fields for; add credential rotation support to `SupplierConfigService`.

**Missing components**: real HTTP client wiring (deliberately deferred to Sprint 14 — correctly not built prematurely), circuit breaker, retry/backoff implementation, DTO layer for the Supplier ops API (`GET /api/suppliers/*` currently returns internal adapter shapes).

### Destination Engine

**Strengths**: clean two-hierarchy model (geography + self-referencing destination tree with cycle detection), all 17 routes verified live in its own sprint, correctly isolated from Inventory/Supplier.

**Weaknesses**: `getNearby()` is a heuristic (siblings → same city → same state/country), not real geo-distance math, despite `latitude`/`longitude` fields existing specifically for that upgrade — a known, previously-flagged gap, still open.

**Technical debt**: five geography entities (Country/State/City/Region/Airport) are consolidated into one file each per layer rather than getting Inventory's per-kind-file treatment — a deliberate, documented choice ("reference data, not divergent domain shapes"), but worth re-confirming it still holds once a real geo-search feature is requested.

**Production risks**: none module-specific beyond the cross-cutting findings (no DTO layer, no auth).

**Refactoring recommendations**: implement real haversine-distance-based `getNearby()` once `latitude`/`longitude` are actually populated at scale (currently optional and often null in test data).

**Missing components**: DTO layer; geo-distance calculation; a bulk-import path for geography reference data (currently one-at-a-time POST, impractical for seeding thousands of cities/airports).

### Package Engine

**Strengths**: the largest and most mature bounded context (60 files, 27 routes) — one-data-model-not-five (`resolutionMode`) principle proven across 5 builder classes; version/publish freeze pattern is the template every later module (Quote, and indirectly Booking) copied; two real bugs (code-derivation, pricing double-count) were found and fixed during this module's own live verification, evidence the verification discipline works when applied.

**Weaknesses**: `PackageItem` has no update method, only add/remove (documented, self-flagged as a possible future gap); `aiGeneratedFromId` is reserved-but-inert with no consumer yet (correctly deferred to the now-cancelled AI sprint — now genuinely orphaned since AI Engine is out of scope for the foreseeable future per this session's "STOP FEATURE DEVELOPMENT" instruction).

**Technical debt**: `Package` has no top-level `description` field — flagged repeatedly by both Website and Quote as a real, still-unaddressed content gap for customer-facing surfaces.

**Production risks**: none module-specific beyond cross-cutting (no DTO layer means `Package.snapshot: unknown` on `PackageVersion` is exposed raw to any API caller today).

**Refactoring recommendations**: add `Package.description`; decide explicitly whether `aiGeneratedFromId` should be removed now that AI Engine is off the roadmap, or kept reserved for a possible future date — leaving it silently orphaned is worse than either explicit choice.

**Missing components**: DTO layer; `PackageItem` update method; description field.

### Website API (Backend for Frontend)

**Strengths**: the only module with a proper DTO layer and the only module that took caching seriously enough to reserve an interface for it — both should be the template the other 6 modules retrofit toward, not exceptions to note and move past.

**Weaknesses**: "Popular Destinations" and the homepage hero/nav menu are static/provisional placeholders with no real data backing them (correctly self-flagged, but now has no scheduled sprint to resolve them since CMS/AI are both out of scope per this session's instruction — same "orphaned by roadmap change" issue as Package's `aiGeneratedFromId`).

**Technical debt**: the price-range search filter is an explicitly-documented in-memory N+1 lookup — fine today, will not survive a real Postgres migration without a dedicated index or materialized view.

**Production risks**: this is the highest-read-traffic module by design (it's the BFF for the public website) and is also the **only unauthenticated-by-design** module (public reads are meant to stay open) — meaning it is simultaneously the most important module to cache (`docs/20`) and the one where a missing rate limit matters most, since it will be the first thing exposed to real internet traffic.

**Refactoring recommendations**: implement the reserved `WebsiteCache` port (`docs/20`); resolve the N+1 price filter before or during the Postgres migration, not after.

**Missing components**: real cache implementation; rate limiting (specifically for this module, since it alone is meant to be public); a resolution for the orphaned "Popular Destinations"/hero placeholders now that CMS is out of scope.

### Quote Engine

**Strengths**: cleanly resolved a long-standing architectural ambiguity (is a Quote a Package draft or a Booking pre-status?) with a documented decision; versioning/freeze-on-send pattern correctly reused from Package; pricing calculator explicitly written to avoid the exact double-counting bug class found in Package's.

**Weaknesses**: no DTO layer (shared weakness) — every field of the internal `Quote`/`QuoteItem`/`QuoteVersion` entities, including the raw `snapshot: unknown` blob, is returned directly from every admin endpoint.

**Technical debt**: `send()`/`approve()`/`reject()` all independently re-check `EDITABLE_STATUSES`/`DECIDABLE_STATUSES` inline rather than through a shared state-machine module — Booking Engine (built one sprint later) extracted exactly this pattern into a dedicated `status/booking-status-machine.ts`; Quote never got the equivalent, so its status transitions are correct but less legible/testable than Booking's.

**Production risks**: none module-specific beyond cross-cutting.

**Refactoring recommendations**: extract a `status/quote-status-machine.ts` mirroring Booking's, for consistency and testability; add a DTO layer, especially before any external system (a real website checkout flow, a future CRM) ever reads Quote data directly.

**Missing components**: DTO layer; explicit status-machine module; rollback-to-version endpoint (self-flagged as intentionally not built, still open).

### Booking Engine

**Strengths**: the most rigorously guarded module in the system — explicit pure state machine (`status/booking-status-machine.ts`), the cleanest example anywhere in this codebase of respecting a cross-module "never modify X" constraint through the public-service-boundary discipline rather than either violating it or leaving the constraint unenforceable; duplicate-traveller prevention and payment-gated status transitions were both verified live with real edge cases (double-booking attempt, payment-before-CONFIRMED, terminal-state cancellation attempt).

**Weaknesses**: no DTO layer (shared weakness) — same raw-entity-exposure issue as every non-Website module, arguably more sensitive here since `Traveller` carries passport numbers and `BookingPayment` carries payment amounts/references.

**Technical debt**: `Quote.convertedBookingId` stays permanently null — a self-flagged, architecturally-forced gap (no legal write-back path without violating "never modify Quotes") that will need a deliberate decision (event-based reconciliation? Accept it as permanently inert?) rather than silent acceptance forever.

**Production risks**: **this module has the highest concentration of real production risk in the codebase** — it handles PII (passport numbers, DOB, emergency contacts) with `PassengerDocument.fileUrl` always null (no real storage), payment amounts with no audit-grade immutability guarantee beyond the `BookingStatusHistory`/`BookingTimeline` records, and sequential number generation (`BK-`/`INV-`/`VCH-` via `countAll() + 1`) that is **not concurrency-safe** — two simultaneous `POST /api/bookings` calls against a real multi-connection Postgres database could generate the same `bookingNumber`, a bug invisible today only because the in-memory store serializes all access within one Node event loop.

**Refactoring recommendations**: before the database migration, replace `countAll() + 1` sequential numbering with a database-level sequence or a UUID-based number with a human-friendly display separate from the uniqueness guarantee; add a DTO layer with explicit PII-redaction rules for any endpoint not requiring full traveler detail.

**Missing components**: DTO layer with PII handling; concurrency-safe number generation; real document storage (`docs/18`).

---

## Aggregate Risk Summary

| Risk | Severity | Blocking production? |
|---|---|---|
| No database — all data is in-process memory | Critical | Yes |
| No authentication on any route | Critical | Yes |
| No tests of any kind | Critical | Yes (no safety net for the database/auth migrations below) |
| Sequential number generation not concurrency-safe (Booking, Quote, Package) | High | Yes, once on a real DB |
| No DTO layer on 6 of 7 business modules | High | Should be, before external consumers exist |
| Inventory has no health check | Medium | No, but should fix immediately (cheap, well-understood) |
| No rate limiting / CORS policy | High | Yes, before public exposure |
| No document/blob storage | Medium | Yes, for Booking's passport/visa documents specifically |
| No caching implementation | Low | No — a performance optimization, not a correctness blocker |
| No background job infrastructure | Medium | Partially — Quote expiry is currently never enforced automatically |
| Prior leaked TripJack token — remediation unconfirmed | Unknown (carried forward, unverified) | Must be confirmed before Sprint 14 |

## Companion Documents

- `docs/16_DATABASE_MIGRATION_PLAN.md` — Prisma + PostgreSQL migration for all ~30 repositories across 7 modules.
- `docs/17_AUTHENTICATION_ARCHITECTURE.md` — admin session auth + RBAC design; Website API stays public by design.
- `docs/18_STORAGE_ARCHITECTURE.md` — blob storage for passenger documents, gallery images, vouchers/invoices.
- `docs/19_BACKGROUND_JOBS.md` — job infrastructure for quote expiry, async document generation, supplier health polling.
- `docs/20_REDIS_CACHE_PLAN.md` — implementation plan for Website's already-reserved `WebsiteCache` port.

**Recommended implementation order** is given at the end of `docs/16_DATABASE_MIGRATION_PLAN.md`, since every other companion document depends on the database migration being underway or complete.
