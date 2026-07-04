# 21 — Testing Framework

**Status:** Phase 2 — Platform Stabilization. Implements `docs/15_PRODUCTION_READINESS.md`'s top finding ("zero tests of any kind exist"). Vitest (unit + integration), Supertest (HTTP-level integration), Playwright (full cross-module e2e flows via its `request` API-testing fixture), and MSW (external-call mocking infrastructure, staged for Sprint 14). **No `src/` file was changed to build this** — verified: `git diff --stat -- src/` is empty. Every test targets the codebase exactly as it stood at the end of Sprint 9 (Booking Engine).

## 1. Folder Structure

```
tests/
├── unit/                          Vitest — no server, no network, <4s for the whole suite
│   ├── shared/                    Backend Foundation: Result<T>, AppError, DI Container,
│   │                              ModuleRegistry, HealthCheckRegistry, ConsoleLogger, api/response.ts
│   ├── inventory/                 validation (kind dispatch), InventoryService CRUD
│   ├── supplier/                  SupplierRegistry, placeholder adapters, MSW readiness
│   ├── destination/                DestinationService: slug uniqueness, cycle detection, breadcrumbs
│   ├── package/                     pricing-calculator, rule-evaluator, validation, ManualPackageBuilder
│   ├── website/                      seo-builder, destination.transformer, homepage enrichment
│   ├── quote/                         quote-pricing-calculator, validation, full status lifecycle
│   └── booking/                       payment-calculator, booking-status-machine, full lifecycle
├── integration/                   Vitest + Supertest — boots a real `next start` server once
│   ├── health.test.ts
│   ├── inventory.test.ts
│   ├── supplier.test.ts
│   ├── destination.test.ts
│   ├── package.test.ts
│   ├── website.test.ts
│   ├── quote.test.ts
│   └── booking.test.ts
├── e2e/                            Playwright — full cross-module business flows over real HTTP
│   ├── full-sales-funnel.spec.ts   country → destination → package → quote → booking → payment → ticket → complete
│   └── rejection-and-cancellation.spec.ts
├── fixtures/
│   └── payloads.ts                 Valid, uniqueness-safe request-body builders (countryPayload, quotePayload, etc.)
├── helpers/
│   ├── api-client.ts                Shared Supertest agent + expectSuccess() envelope unwrapper
│   ├── scenario-builder.ts           buildBaseScenario() / buildApprovedQuoteScenario() — the same
│   │                                 country→destination→hotel→package(→quote→approve) chain every
│   │                                 sprint's manual curl verification built by hand, now reusable
│   ├── test-server.ts                 Spawns/kills `next start` on port 3939 for the integration suite
│   ├── test-logger.ts                  Silent Logger for unit-constructing a service directly
│   └── global-setup.ts                  Vitest globalSetup wiring test-server into the integration config
└── mocks/
    ├── handlers.ts                      MSW request handlers (staged for Sprint 14 — see §3)
    └── server.ts                         msw/node setupServer()

vitest.config.ts                Unit suite — fast, no globalSetup
vitest.integration.config.ts    Integration suite — globalSetup boots next start, fileParallelism off
playwright.config.ts            E2E suite — own webServer on port 3940, request-only (no browser install)
```

## 2. Coverage Plan

### What's covered today (all 8 requested modules, verified passing: 26 unit files / 199 tests, 8 integration files / 38 tests, 2 e2e files / 3 tests)

| Module | Unit | Integration | E2E |
|---|---|---|---|
| Backend Foundation | Result<T>, AppError subclasses, DI Container, ModuleRegistry, HealthCheckRegistry (incl. throwing-check safety net), ConsoleLogger, `api/response.ts`'s error-leak boundary | Covered indirectly via every other module's HTTP round-trip | — |
| Inventory | Validation (kind dispatch, hotel detail rules), full CRUD via an injected in-memory repo | Full CRUD over real HTTP, kind filtering, 404/400 paths | Present as catalog setup in both e2e flows |
| Supplier | SupplierRegistry (register/lookup/dynamic capability filter), placeholder adapter behavior (health/capabilities/NotImplementedError rejection) | Read-only ops API (list/get/health), TripJack's `NOT_CONFIGURED` vs. generic placeholder distinction | — |
| Destination | Slug uniqueness, cycle-detection boundary (parentDestinationId is create-only), breadcrumbs, archive | Full chain, duplicate-slug 409, breadcrumbs, nearby, PATCH-cannot-change-parent | Present in both e2e flows |
| Package | **Regression-locked**: base-price double-count fix, title-with-spaces code derivation fix; rule-evaluator (pax + booking window); ManualPackageBuilder end-to-end | Day/item/pricing/publish/clone flow, duplicate-inventory 409, rule evaluation | Present in full-sales-funnel |
| Website API | seo-builder (fallbacks, empty-baseUrl case), destination.transformer (DTO leak check), **regression-locked**: homepage/search enrichment fix | Published-only visibility, DTO leak check, search, 404 on unpublished slug | Package visibility checked in full-sales-funnel |
| Quote | Validation (traveler details, adjustments, currency), full status lifecycle (send/approve/reject/convert guards, double-conversion block, item-lock-on-decision), pricing calculator | Full HTTP lifecycle, item dual-reference rejection, duplicate() | Full lifecycle + rejection flow |
| Booking | payment-calculator (PENDING/PARTIAL/PAID/REFUNDED math), booking-status-machine (every transition, all terminal-state blocks), full lifecycle incl. double-booking + duplicate-traveller prevention | Full HTTP lifecycle incl. payment-gated status, voucher/invoice generation | Full happy path + cancellation flow |

### What's intentionally NOT covered (by design, not oversight)

- **TripJack connector's DTO mappers/error-handler/response-parser** (`src/modules/supplier/adapters/tripjack/`) — these are pure, already-isolated functions with no live consumer yet (Sprint 14 is still future); low risk, deferred rather than tested against a spec that doesn't exist yet.
- **Geography's City/State/Region/Airport CRUD specifically** — Country and Destination are covered directly; the other four entities share the exact same generic CRUD pattern (confirmed by reading their repository/service files), so testing one is representative of testing all five without 4x the maintenance burden. Flagged here rather than silently assumed.
- **Every validation branch of every module** — representative valid/invalid cases plus every previously-real bug are covered; exhaustive boundary-value testing of every field (e.g. every possible malformed `slotCriteria` shape) is not, and shouldn't be chased for its own sake.

## 3. Test Strategy

- **Unit tests answer "does this function/service do the right thing in isolation."** No server, no HTTP — either a pure function (`computePrice`, `canTransition`, `buildSeoDTO`) called directly, or a service constructed with a real in-memory repository (`new InventoryService({ logger }, new InMemoryInventoryRepository())`). A subset of "unit" tests (Package/Quote/Booking lifecycle tests) go through the real module-registered DI graph (`getPackageService()`, `getQuoteService()`, etc.) rather than manually wiring every dependency by hand — this is still server-free and fast, and it exercises the actual cross-module composition (Quote calling Package/Destination/Inventory's real services) the same way production does, which manually re-wiring each dependency would not.
- **Integration tests answer "does the real HTTP route → handler → service → repository chain work."** A single real `next start` process is booted once per suite run (`globalSetup`), and every test hits it via Supertest. `fileParallelism: false` is deliberate: every test shares one running server's in-memory `Map` store, and parallel file execution against shared mutable state would be flaky by construction, not a real concurrency bug — see `docs/16`'s note that concurrency-safety only needs to be solved once a real database exists.
- **E2E tests answer "does the full, real business flow work end-to-end."** No admin UI exists yet (`docs/02`'s open UI-placement gap), so Playwright's `request` fixture — not a browser — drives full cross-module scenarios exactly like every sprint's manual `curl` verification did. This is a deliberate scope decision: when a real UI ships, browser-based specs are additive to this config, not a replacement for it.
- **Regression-first, going forward.** Two bugs already fixed in prior sprints (Package's base-price double-count, Website's homepage/search enrichment gap) now have permanent regression tests locking in the correct values. **One new bug was found while writing this suite** (see §4) — it was captured as a test, not fixed, per this sprint's explicit "no business logic changes" instruction and the standing "every bug becomes a regression test before being fixed" policy this sprint establishes.
- **MSW is infrastructure, not yet a real consumer.** Grep-verified: zero `fetch()` calls exist anywhere in `src/`. `tests/mocks/` is staged and proven to work (see `msw-readiness.test.ts`) against a synthetic TripJack endpoint, ready for Sprint 14 rather than mocking an integration that doesn't exist today.
- **Fixtures over copy-paste.** `tests/fixtures/payloads.ts`'s `unique()` helper guarantees every test-created Country/Destination/Package/Quote gets a collision-free name/slug/code, which is what makes running integration tests against one shared in-memory server safe without a database reset between tests.

## 4. Remaining Gaps

1. **A live product bug was found, not fixed**: `pricing-calculator.ts`'s seasonal-adjustment amount is double-counted in the final total — the exact same bug class as the already-fixed base-price bug, in the seasonal path instead. Captured as `it.fails(...)` in `tests/unit/package/pricing-calculator.test.ts` with the correct expected value documented inline. **This should be the very first fix taken up once this sprint's "no business logic changes" restriction lifts**, using the test already written as the acceptance criterion.
2. **No CI wiring yet.** These suites run locally (`npm test`, `npm run test:integration`, `npm run test:e2e`) but nothing runs them automatically on push/PR — a GitHub Actions (or equivalent) workflow is the natural next step, not built this sprint since none was requested and it's an infrastructure decision (which CI provider, which triggers) rather than a testing-framework decision.
3. **Coverage is unmeasured in aggregate.** `npm run test:coverage` reports ~39% statement coverage, but that number only reflects the unit suite in isolation (coverage instrumentation doesn't span the separate `next start` process integration/e2e tests boot) — the real, combined coverage is meaningfully higher but not currently reported as one number. Worth a follow-up once CI exists to merge coverage reports across suites.
4. **TripJack connector internals remain untested** (see §2) — acceptable today since nothing calls them yet, but should be revisited as part of Sprint 14's own scope, not bolted on now against a live API contract that doesn't exist.
5. **No load/performance testing** — `docs/15` already flagged this as unmeasured; this sprint's tests prove correctness, not throughput or latency under concurrent load.
6. **Concurrency is not exercised.** Every test here runs against a single in-memory store with no real concurrent writers — `docs/16`'s flagged concurrency-unsafe sequential numbering (`BK-`/`QT-`/`INV-`/`VCH-`) cannot be meaningfully tested until a real database with real concurrent connections exists; a regression test for it belongs in that migration's own test pass, not here.
7. **Geography's City/State/Region/Airport modules** share Country/Destination's tested CRUD pattern but aren't individually exercised — see §2's explicit reasoning; flagged as a conscious scope boundary, not silently skipped.
