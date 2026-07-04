# 36. TripJack Live Search (Sprint 17)

Replaces the placeholder TripJack connector with a real implementation for Hotel Search/Details and Flight Search/Details/Fare Rules/Seat Map/SSR, executed through the (unmodified) Supplier Runtime. Booking, Cancellation, Ticketing, Amendments, and Payments are explicitly not implemented — `TripJackClient.book()`/`.cancel()` still throw `NotImplementedError`, untouched.

## 1. Folder Tree

No new folders — every change lives inside the existing `src/modules/supplier/adapters/tripjack/` structure, exactly as the sprint's "Keep... Architecture exactly as they are" instructed. Two new DTO files were the only additions:

```
src/modules/supplier/adapters/tripjack/
├── client/tripjack.client.ts          # MODIFIED — 7 of 9 methods now make real fetch() calls
├── config/tripjack.config.ts          # unchanged
├── dto/
│   ├── request/
│   │   ├── auth-login.dto.ts          # NEW — no auth DTO existed before this sprint
│   │   └── (9 existing files, unchanged)
│   ├── response/
│   │   ├── auth-login-response.dto.ts # NEW
│   │   └── (9 existing files, unchanged)
│   └── index.ts / request/index.ts / response/index.ts   # MODIFIED — export the 2 new files
├── index.ts                           # MODIFIED — TripJackAdapter: real search()/details()/health()
├── mappers/                           # unchanged
├── services/
│   ├── tripjack-auth.service.ts       # MODIFIED — real login, token cache, auto-refresh
│   ├── tripjack-error-handler.ts      # unchanged
│   └── tripjack-response-parser.ts    # unchanged
├── types/                             # unchanged
└── utils/                             # unchanged

tests/unit/tripjack/                   # NEW — 4 files, 42 tests
├── fake-tripjack-config.ts
├── tripjack-auth.test.ts
├── tripjack-client.test.ts
├── tripjack-adapter.test.ts
└── tripjack-runtime-integration.test.ts
```

## 2. Files Changed

| File | Change |
|---|---|
| `dto/request/auth-login.dto.ts`, `dto/response/auth-login-response.dto.ts` | **New.** No auth DTO existed among the original 9 pairs — Authentication/Token Management is this sprint's own requirement. |
| `dto/index.ts`, `dto/request/index.ts`, `dto/response/index.ts` | One new export line each. |
| `services/tripjack-auth.service.ts` | Rewritten: real `fetch()`-based login, in-memory token cache with a 60s refresh buffer, static-token passthrough (`TRIPJACK_TOKEN`), `AbortController`-based timeout. Constructor signature unchanged. |
| `client/tripjack.client.ts` | Rewritten: constructor now takes `TripJackAuth`, `TripJackErrorHandler`, `TripJackResponseParser` (previously unused by the client) in addition to `TripJackConfig`/`Logger`. 7 methods (`searchHotels`, `getHotelDetails`, `searchFlights`, `getFlightDetails`, `getFareRules`, `getSsrOptions`, `getSeatMap`) now call a shared `request<T>()` helper that attaches the auth token, calls `fetch()`, and normalizes errors/validates the response. `book()`/`cancel()` are byte-for-byte the same `NotImplementedError` throws as before. |
| `index.ts` (`TripJackAdapter`) | Constructor wires the client with its new dependencies. `search()` now dispatches to hotel or flight search by `criteria.capability` (the old version always called `searchFlights`, unconditionally, regardless of capability — a latent bug in the placeholder, never reachable before since everything threw anyway). `details()` decodes a composite `PREFIX::id::traceId` reference string to know which capability and DTO pair to use. `health()` reports Configured/Authenticated/Reachable/Latency. `book()`/`cancel()` still throw. |
| `.env.test` | Added 6 fake, non-secret `TRIPJACK_*` values so `isConfigured()` is true during tests and the real code paths run against MSW, never a real API. |
| `tests/mocks/handlers.ts`, `tests/unit/supplier/msw-readiness.test.ts` | Docstring updates only — both previously claimed "no module makes a real fetch() call," which this sprint makes false. |
| `tests/integration/supplier.test.ts` | One test updated: TripJack's health message format changed (see §5); the integration suite hits a real `next start` process with fake-but-configured credentials, so it now correctly observes "configured, but the fake domain doesn't resolve" instead of the old "NOT_CONFIGURED." |

**Not touched, verified two ways** (`src/modules/supplier/module.ts`, `services/`, `repositories/`, `types/`, `api/`, `utils/`, `validation/`, every file under `src/modules/supplier/runtime/`, every other adapter):
1. File-modification timestamps: `find src/modules/supplier/runtime -type f -mmin -240` and the same scoped to the Supplier Engine excluding `runtime/` and `adapters/tripjack/` both returned zero files.
2. Live behavior: `GET /api/health`, `GET /api/suppliers`, and `GET /api/supplier-runtime/health` all still return exactly the same shapes as before this sprint (verified via curl against a real dev server).

## 3. Authentication Flow

```
TripJackAuth.getToken()
├── TRIPJACK_TOKEN set?          -> return it directly, never call login (some TripJack
│                                    accounts issue a static long-lived key instead of a
│                                    login-exchange flow — a provisional assumption, see §8)
├── not configured (missing
│   agencyId/userId/password)?   -> UnauthorizedError ("Credential Validation")
├── cached token still valid
│   (> 60s from expiry)?         -> return cached token, no network call
└── otherwise                     -> login(): POST {apiUrl}/auth/login with
                                     {agencyId, userId, password}, AbortController-timeout-
                                     bounded (TRIPJACK_TIMEOUT_MS), parse {token,
                                     expiresInSeconds}, cache both, return the token
```

"Token refresh" is the cache-expiry check above — a call within 60 seconds of the cached token's expiry forces a fresh login rather than risking an in-flight request racing an actual expiry. There is no separate self-retry inside `login()`: if a dispatch made through the Supplier Runtime retries the whole `client.searchHotels()` call (because the runtime's retry policy decided to), the retried attempt calls `getToken()` fresh too — so auth failures get naturally retried by the same mechanism as any other transient failure, without duplicating retry logic inside the auth service itself.

Every login attempt is logged (`TripJack auth token requested` / `TripJack auth token obtained`) — never the password or resulting token value.

## 4. Hotel Search Flow

```
TripJackAdapter.search({capability: HOTELS, cityCode, checkIn, checkOut, rooms})
  -> toHotelSearchRequest(criteria)                    # loose criteria -> typed DTO
  -> TripJackClient.searchHotels(request)
       -> request<TripJackHotelSearchResponseDTO>("searchHotels", "/hotels/search", request)
            -> auth.getToken()
            -> fetch(POST {apiUrl}/hotels/search, Authorization: Bearer <token>)
            -> TripJackErrorHandler.toAppError() on non-2xx
       -> TripJackResponseParser.parse(body, ["results"])
  -> for each TripJackHotelSearchResultDTO:
       { referenceId: "HOTEL::{hotelId}::{traceId}", ...TripJackHotelMapper.toInventoryHotel(dto) }
```

**"Availability" and "Room Details"** are not separate TripJack API calls in this connector (the placeholder scaffolding from Sprint 4 only ever had `searchHotels`/`getHotelDetails` — "Keep... Architecture exactly as they are" meant not inventing two new client methods). They're modeled as facets of the same two calls: a hotel search response's `nightlyRate`/`currency` fields represent availability+rate at search time; `getHotelDetails` (via `details()`) is where room/amenity detail lives. This is a documented scope decision, not an oversight.

**Details, with Runtime caching**: `details("HOTEL::{hotelId}::{traceId}")` decodes the reference, checks `RuntimeCache` (`tripjack:hotel-details:{hotelId}`, 5-minute TTL) before calling `getHotelDetails` — verified live in tests: a second `details()` call for the same hotel makes zero additional HTTP requests.

## 5. Flight Search Flow

Identical shape to hotels: `search({capability: FLIGHTS, origin, destination, departureDate, adults, ...})` → `toFlightSearchRequest()` → `TripJackClient.searchFlights()` → `TripJackFlightMapper.toInventoryFlight()`, with `referenceId` encoded as `"FLIGHT::{resultIndex}::{traceId}"`. `details()` decodes the same way and calls `getFlightDetails`.

**Fare Rules, Seat Map, SSR** (`getFareRules`/`getSeatMap`/`getSsrOptions`) are real, working `TripJackClient` methods — each makes a genuine `fetch()` call, is parsed/validated, and is directly unit-tested — but **nothing calls them from the adapter**, because the frozen `Supplier` port (Supplier Engine, not modified this sprint) has no dedicated method for any of the three; only `search`/`details`/`book`/`cancel`/`sync` exist. This is the same "implemented at the client layer, not yet wired above it" pattern Sprint 4 already established for the mappers — not a gap introduced here, and not fixable without a Supplier Engine change, which this sprint explicitly forbids.

**Mapping (TripJack DTO → Inventory Models → Website Models)**: the first hop is real — every mapped result exposed by `search()`/`details()` is the mapper's clean, TripJack-free output (`MappedInventoryHotel`/`MappedInventoryFlight`, both unchanged), never the raw DTO (verified in tests: a search result has no `nightlyRate`/`currency` field, only `starRating`/`address`/`title`). The second hop — into Website's own DTOs — is **not built this sprint**: no business module (Website, Package, Inventory) currently calls into the Supplier Engine at all (verified true since Sprint 3), so there is no real caller to wire this into yet. Flagged honestly in §8, not silently skipped.

## 6. Runtime Integration

Every real HTTP-making test in `tests/unit/tripjack/tripjack-runtime-integration.test.ts` goes through `SupplierDispatcher.dispatch()` — the same public entry point any future real caller (a Website/Package search feature, once that integration exists) would use — never by calling `TripJackAdapter.search()` directly and unwrapped. Verified, with real (MSW-mocked) HTTP underneath:

- A successful hotel search dispatched through the runtime returns the mapped result and the runtime's own `RuntimeMetricsRegistry` records one real execution keyed `tripjack:HOTELS`.
- A successful flight search dispatched through the runtime, same shape, keyed `tripjack:FLIGHTS`.
- A transient 500 is retried by the runtime's own retry policy (not any retry logic inside TripJack) — the mocked endpoint fails once, succeeds on the second attempt, and the recorded metric shows `retries: 1`, with a `REQUEST_RETRIED` event published.
- Two consecutive dispatches against a permanently-failing mocked endpoint (`failureThreshold: 1`) trip the circuit breaker; the *second* dispatch is rejected with `ServiceUnavailableError` **without the mocked TripJack endpoint ever being called again** (call-count assertion) — proving the breaker, not TripJack itself, is what stops the second attempt.
- An externally-aborted signal (`AbortSignal.timeout(50)` passed into `dispatch()`) is what actually abandons a slow-to-resolve mocked request — proving cancellation propagates from the dispatch call, through the executor, into the client's own `fetch()` signal.

The Supplier Runtime's health/metrics/circuit-breaker surfaces (`/api/supplier-runtime/health`, `/metrics`, `/circuit-breakers`, `/events`) require zero code changes to reflect any of this — they were built generically in Sprint 16 to reflect *any* supplier's real execution data, and do so automatically the moment something dispatches through them. No production caller does that yet in this codebase (same honest gap Sprint 16 itself flagged), so a fresh `/api/supplier-runtime/health` call on a live server still correctly shows `statuses: []` — verified live, not just asserted.

## 7. Metrics

All five explicitly-named metrics (Searches, Failures, Timeouts, Latency, Retries) are recorded by the **unmodified** `SupplierExecutor`/`RuntimeMetricsRegistry` from Sprint 16 — TripJack contributes nothing new to how metrics are recorded, only real data to record. Confirmed in `tripjack-runtime-integration.test.ts`:
- **Searches**: one `ExecutionRecord` per dispatch, keyed `tripjack:{capability}`.
- **Failures**: `success: false` on the circuit-breaker test's failing dispatch.
- **Timeouts**: `timedOut` behavior proven via a deliberately-aborted signal (see §6) rather than waiting out the real 8-second default per-capability timeout.
- **Latency**: `durationMs` on every record, real wall-clock time around the mocked HTTP call.
- **Retries**: `retries: 1` on the transient-failure test.

## 8. Remaining TODOs

- **All endpoint paths and request/response shapes remain provisional** — `/auth/login`, `/hotels/search`, `/hotels/details`, `/flights/search`, `/flights/details`, `/flights/fare-rules`, `/flights/ssr`, `/flights/seat-map` are reasonable guesses, not real TripJack API documentation (docs/10's TODO #1 is still open). Changing any path is a one-line edit in `TripJackClient`.
- **Static-token vs. login-exchange is an assumption, not a confirmed fact** — `TRIPJACK_TOKEN` is treated as an optional pre-provisioned key that skips login entirely; real TripJack account documentation may show this isn't how their auth actually works, in which case that branch in `TripJackAuth.getToken()` should be removed.
- **Fare Rules / Seat Map / SSR are unreachable from the adapter** — real, tested, working `TripJackClient` methods with no calling path through the frozen `Supplier` port (no `getFareRules`/`getSeatMap`/`getSsrOptions` method exists on that interface). Wiring them in requires either a Supplier Engine port change (out of this sprint's scope) or a different access pattern (e.g. exposing them directly from this connector's own public barrel for a future ancillary-services feature to call).
- **"→ Website Models" is not built** — no business module calls the Supplier Engine yet at all (the same gap Sprint 3/4 already flagged), so there is nothing to map Inventory-shaped results into. The mapper output is deliberately Website-agnostic and ready for whichever future integration needs it.
- **No production caller dispatches TripJack through the Runtime** — proven only by this sprint's own tests, same honest gap already flagged in `docs/35`.
- **Book/Cancel/Ticketing/Amendments/Payments remain fully unimplemented**, exactly as instructed — `TripJackClient.book()`/`.cancel()` are untouched, still throwing `NotImplementedError`.
- **`TripJackAuth`'s login call has no retry of its own** — by design (see §3), but means a single transient network blip during login inside a dispatch that itself has no retries left (e.g. `SupplierOperation.BOOK`/`CANCEL`, not applicable here since those aren't implemented) would surface immediately. Not a concern for search/details, which do go through the Runtime's retry policy.
- **Hotel-details cache has no invalidation path** — 5-minute TTL only; if a real TripJack rate/availability changes inside that window, a cached `details()` call would return stale data. Acceptable for static content (name/address/amenities), a real risk if TripJack's actual response ever embeds live pricing in the same payload.

## 9. Verification

```
tsc --noEmit             -> clean, checked after every file changed this sprint
npm test                  -> 51 files, 369 passed, 1 expected fail (pre-existing, unrelated)
npm run test:integration  -> 8 files, 38 passed (1 test updated for the new health-message format)
npm run test:e2e          -> 3 passed
npm run build              -> succeeds, no route changes (no new API routes added this sprint)
```

**New tests**: `tests/unit/tripjack/` — 4 files, 42 tests, all against MSW-mocked HTTP, never the real TripJack API:
- `tripjack-auth.test.ts` (9) — credential validation, static-token passthrough, real login, caching, automatic refresh near expiry, manual invalidation, error mapping, timeout.
- `tripjack-client.test.ts` (12) — all 7 real methods' success/validation-failure paths, auth-failure short-circuiting before any HTTP call, non-2xx error mapping, and a regression check that `book()`/`cancel()` still throw.
- `tripjack-adapter.test.ts` (12) — capabilities unchanged, hotel/flight search producing correctly-encoded references and mapper-clean output, details for both capabilities (including cache-hit verification), malformed/unknown reference handling, all four health states, and the same `book()`/`cancel()` regression check at the adapter level.
- `tripjack-runtime-integration.test.ts` (6) — see §6, the acceptance-critical proof that TripJack executes through the Runtime.

**Isolation, verified two ways** (§2): file-modification timestamps show zero touched files outside `adapters/tripjack/`, and live curl confirms `/api/health`, `/api/suppliers`, and `/api/supplier-runtime/*` are byte-for-byte unchanged in shape.

**A real bug found and fixed during this sprint, not left in**: the first draft added a static `import { getRuntimeCache } from "@/modules/supplier/runtime"` at the top of the adapter file, creating a genuine circular module graph (`supplier/module.ts` → `adapters/tripjack` → `runtime` → `runtime/module.ts` → `supplier/module.ts`) that made `TripJackAdapter` resolve to `undefined` at the Supplier Engine's own registration site (`TypeError: TripJackAdapter is not a constructor`, caught by the test suite, not silently shipped). Fixed by deferring that one import to a dynamic `await import(...)` inside `hotelDetails()`, called well after both modules finish their synchronous evaluation — same fix class as this project's earlier "auth seeding must be dynamically imported" finding from the test-isolation sprint.
