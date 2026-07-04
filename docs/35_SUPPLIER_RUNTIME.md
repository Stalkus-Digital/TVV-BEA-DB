# 35. Supplier Runtime (Sprint 16)

The Commerce Runtime's first piece: the infrastructure every future supplier connector (TripJack, then Ferry, then whatever comes after) will execute its requests through — capability routing, retries, timeouts, circuit breaking, metrics, health, and correlation, all built and proven against a fake test supplier. TripJack itself is still not implemented; nothing about it changed this sprint.

## 1. Folder Tree

```
src/modules/supplier/runtime/
├── types.ts            # ExecutionContext, ExecutionOutcome — cross-cutting, not a folder (see §2)
├── config.service.ts    # RuntimeConfigService — every retry/timeout/breaker knob, env-driven, no hardcoded values
├── dispatcher/
│   └── supplier-dispatcher.ts   # SupplierDispatcher — capability -> candidates -> routing policy -> execute -> normalized response
├── executor/
│   └── supplier-executor.ts     # SupplierExecutor — the one place a single supplier call actually happens
├── retry/
│   ├── retry-policy.ts          # computeBackoffDelay() — exponential + full jitter
│   └── retry-executor.ts        # executeWithRetry() — generic retry loop over any Result-returning operation
├── timeouts/
│   ├── timeout-policy.ts        # resolveTimeoutMs(operation, capability) — Hotels/Flights/Booking/Cancellation/default
│   └── with-timeout.ts          # withTimeout() — AbortController-based race, cancellation-aware
├── circuit-breaker/
│   ├── circuit-state.ts         # CircuitState (CLOSED/OPEN/HALF_OPEN), CircuitBreakerConfig, CircuitSnapshot
│   ├── circuit-breaker.ts       # CircuitBreaker — one key's state machine, automatic recovery
│   └── circuit-breaker-registry.ts  # CircuitBreakerRegistry + breakerKey(supplierCode, capability)
├── metrics/
│   ├── execution-record.ts      # ExecutionRecord, computeExecutionStats() — the one shared aggregation function
│   └── runtime-metrics-registry.ts  # RuntimeMetricsRegistry — bounded ring buffer of ExecutionRecords
├── events/
│   ├── runtime-events.ts        # RuntimeEventType (the 6 named events), RuntimeEvent
│   └── runtime-event-bus.ts     # RuntimeEventBus — node:events wrapper + recent-events ring buffer
├── cache/
│   ├── runtime-cache.ts         # RuntimeCache interface — the abstraction this sprint asked for, nothing more
│   └── in-memory-runtime-cache.ts   # InMemoryRuntimeCache — the only implementation; Redis is future work
├── policies/
│   └── routing-policy.ts        # RoutingPolicy interface + DefaultRoutingPolicy (registry order)
├── health/
│   ├── supplier-runtime-status.ts       # SupplierRuntimeStatus (per supplier+capability)
│   ├── supplier-health-monitor.ts       # SupplierHealthMonitor — derives rolling health from metrics + breaker state
│   └── supplier-runtime-health-check.ts # SupplierRuntimeHealthCheck — registers into the shared healthCheckRegistry
├── api/
│   └── runtime.handlers.ts      # 4 internal diagnostic handlers
├── module.ts   # DI registration as its OWN module ("supplier-runtime"), health check, service accessors
└── index.ts    # public barrel: api, tracing-free accessor functions, DispatchRequest/Response types

src/app/api/supplier-runtime/
├── health/route.ts             # GET, authenticated-only
├── metrics/route.ts             # GET, authenticated-only
├── events/route.ts              # GET, authenticated-only, ?limit=
└── circuit-breakers/route.ts    # GET, authenticated-only

tests/unit/supplier-runtime/   # 10 files, 57 tests
```

**Small, additive shared-infra changes** (not the Supplier Engine, not business modules — the same category as prior sprints' `route-permission-map.ts`/`health-registry.ts` edits):
- `src/shared/errors/error-codes.ts` + `common-errors.ts` — added `TimeoutError` (504) and `ServiceUnavailableError` (503). Neither existed; reusing `InternalError` for an expected, operational timeout/circuit-open condition would have been semantically wrong (`InternalError` means "unexpected, isOperational: false").

## 2. Runtime Architecture

**Registered as its own module, not folded into the Supplier Engine's.** `runtime/module.ts` self-registers as `"supplier-runtime"`, a sibling to (never an edit of) `src/modules/supplier/module.ts`'s `"supplier"` registration. It reads the existing `SupplierRegistry` through that module's own public accessor, `getSupplierRegistry()` — the same public-service-boundary discipline every other cross-module read in this project already follows, just between two sibling `module.ts` files instead of two top-level modules. This is the entire mechanism behind "Supplier Engine unchanged": nothing under `src/modules/supplier/` outside `runtime/` needed to change for this sprint to exist.

**No `types/` folder** — this sprint's explicit folder list omitted one (unlike Storage's or Auth's), so cross-cutting types (`ExecutionContext`) and the config service live as top-level files inside `runtime/`, sibling to `module.ts`, rather than inventing an unrequested folder.

**Request flow**, exactly the sprint's own diagram:
```
SupplierDispatcher.dispatch({capability, operation, call})
  -> registry.getSuppliersByCapability(capability)   [Supplier Engine, untouched]
  -> routingPolicy.order(candidates)                  [policies/]
  -> for each supplier, in order:
       SupplierExecutor.execute(supplier, capability, operation, call)
         -> breaker.canAttempt()?                      [circuit-breaker/]
         -> executeWithRetry(                          [retry/]
              () => withTimeout(call, timeoutMs)        [timeouts/]
            )
         -> breaker.recordSuccess() / recordFailure()
         -> metricsRegistry.record(...)                 [metrics/]
         -> eventBus.publish(...)                       [events/]
         -> logger.info/warn(...)                       [captured automatically by Observability's log sink]
     -> return on first success, or the last attempted outcome
```

**Execution Context & Correlation IDs**: `ExecutionContext` (`types.ts`) threads `correlationId`/`capability`/`supplierCode`/`startedAt`/`signal` through a dispatch. Correlation IDs are minted with `node:crypto`'s `randomUUID()` directly inside `SupplierExecutor`, not imported from the Observability module — a deliberate choice to keep the Runtime's only dependency the shared foundation (`@/shared/*`) and the Supplier Engine's own public accessor, satisfying "Runtime isolated" as literally as possible even though Observability's `generateRequestId()` does the identical thing and could have been reused.

**Cancellation**: native `AbortController`/`AbortSignal`, not a hand-rolled cancellation token — `withTimeout()` passes a signal into the operation (so a real future `fetch(url, { signal })` call gets genuinely aborted, not just abandoned), and `executeWithRetry()` checks `signal?.aborted` between attempts to stop retrying early.

## 3. Retry Strategy

`retry/retry-policy.ts`'s `computeBackoffDelay(attempt, config)`: exponential (`baseDelayMs * 2^(attempt-1)`, capped at `maxDelayMs`) with optional **full jitter** (uniform random in `[0, cappedDelay]`) — chosen over no-jitter/equal-jitter as the simplest well-known variant that still avoids thundering-herd retries. Every value is configurable via `RuntimeConfigService`, reading:

| Env var | Default |
|---|---|
| `SUPPLIER_RUNTIME_RETRY_MAX_ATTEMPTS` | 3 |
| `SUPPLIER_RUNTIME_RETRY_BASE_DELAY_MS` | 200 |
| `SUPPLIER_RUNTIME_RETRY_MAX_DELAY_MS` | 5000 |
| `SUPPLIER_RUNTIME_RETRY_JITTER` | true |

`retry/retry-executor.ts`'s `executeWithRetry()` is generic over any `(attempt) => Promise<Result<T, AppError>>` — not supplier-specific — and never retries a `ValidationError` (the request itself is malformed; retrying won't help), only transient failures. Verified: 12 tests covering exponential growth, capping, jitter bounds, success-on-first-try, retry-then-succeed, exhaustion, non-retryable short-circuit, the `onRetry` callback, and abort-signal-stops-retrying.

## 4. Timeout Strategy

`timeouts/timeout-policy.ts`'s `resolveTimeoutMs(operation, capability)` resolves this sprint's four named categories — Hotels, Flights, Booking, Cancellation — which don't sit on one axis: Hotels/Flights are `SupplierCapability` values, while Booking/Cancellation are **operations** (`book()`/`cancel()`, any capability). Resolved as: `book`/`cancel` always use their own timeout regardless of capability; every other operation resolves by capability where one is configured (Hotels, Flights), falling back to a configured default for every other capability (Activities, Ferries, Transfers, Visa, Insurance) so nothing is ever left without a timeout.

| Env var | Default |
|---|---|
| `SUPPLIER_RUNTIME_TIMEOUT_HOTELS_MS` | 8000 |
| `SUPPLIER_RUNTIME_TIMEOUT_FLIGHTS_MS` | 8000 |
| `SUPPLIER_RUNTIME_TIMEOUT_BOOKING_MS` | 15000 |
| `SUPPLIER_RUNTIME_TIMEOUT_CANCELLATION_MS` | 10000 |
| `SUPPLIER_RUNTIME_TIMEOUT_DEFAULT_MS` | 10000 |

`timeouts/with-timeout.ts`'s `withTimeout()` races the operation against a timer using `AbortController` — the signal passed to the operation is real, cancellation-capable infrastructure a future `TripJackClient.searchHotels()` could pass straight to `fetch()`. Verified: 9 tests, including that the signal actually fires on timeout, and that an external parent-signal abort propagates into the operation's own signal.

## 5. Circuit Breaker Design

Standard three-state machine (`circuit-breaker/circuit-breaker.ts`): **CLOSED** (normal) → **OPEN** (tripped after `failureThreshold` consecutive failures, rejects immediately) → **HALF_OPEN** (one trial request allowed once `cooldownMs` has elapsed since tripping) → **CLOSED** again after `successThreshold` consecutive successes, or straight back to **OPEN** on a single failure while half-open. "Automatic recovery" is `canAttempt()`'s own cooldown check — nothing external ever resets a breaker by hand.

**Keyed by supplier + capability** (`breakerKey(code, capability)` = `"tripjack:HOTELS"`), not by supplier alone — a supplier can be healthy for Hotels while its Flights endpoint struggles, and this sprint's Health section explicitly asks for both "Per Supplier" and "Per Capability" dimensions.

| Env var | Default |
|---|---|
| `SUPPLIER_RUNTIME_BREAKER_FAILURE_THRESHOLD` | 5 |
| `SUPPLIER_RUNTIME_BREAKER_COOLDOWN_MS` | 30000 |
| `SUPPLIER_RUNTIME_BREAKER_SUCCESS_THRESHOLD` | 2 |

Verified: 9 tests covering every transition (CLOSED→OPEN, OPEN rejects within cooldown, a CLOSED success resets the failure count, OPEN→HALF_OPEN via fake timers, HALF_OPEN→CLOSED after enough successes, HALF_OPEN→OPEN on a single failure), plus the registry's per-key isolation and snapshot listing. An end-to-end executor test also confirms a real dispatch is rejected with `ServiceUnavailableError` (503) without ever invoking the supplier once its breaker is open.

## 6. Metrics

`metrics/execution-record.ts`'s `ExecutionRecord {key, supplierCode, capability, durationMs, success, timedOut, circuitRejected, retries, timestamp}` is the one raw unit every figure in this runtime derives from — `computeExecutionStats()` (pure) turns a list of records into `{count, successRate, avgDurationMs, totalRetries, totalTimeouts, totalFailures}`, reused identically by both `RuntimeMetricsRegistry`'s snapshot and `health/`'s per-key rollup, so "success rate" is never computed two different ways in two places.

`RuntimeMetricsRegistry` is a bounded (500-entry) ring buffer, the only writer being `SupplierExecutor`. Deliberately **not** shared with Observability's `MetricsRegistry` (that class isn't exported from Observability's public barrel, and reaching into its internals would violate both modules' boundary discipline) — same "duplication over cross-module coupling" precedent this project has followed since `InMemoryStore<T>`.

**Supplier Availability** is not tracked as a separate counter — it's the same `successRate`/circuit `state` figures `health/` already derives, exposed via `/api/supplier-runtime/health` rather than duplicated under `/metrics` too.

## 7. Health

`health/supplier-health-monitor.ts`'s `SupplierHealthMonitor` computes, per supplier+capability key: circuit state, rolling success rate, average latency, total executions, and last-executed timestamp — all derived from `RuntimeMetricsRegistry` + `CircuitBreakerRegistry`, never a third independent tracking mechanism. Overall status: any `OPEN` breaker → `unhealthy`; any `HALF_OPEN` breaker or a success rate below 50% → `degraded`; otherwise `healthy` (including the empty/no-executions-yet case, since nothing has failed).

`SupplierRuntimeHealthCheck` registers into the **same shared** `healthCheckRegistry` every other module uses — verified live: `GET /api/health` (the pre-existing, completely untouched route) now reports `supplier-runtime: healthy` alongside the three existing `supplier.tripjack/ferry/manual: degraded` checks, with zero code changes to that route.

## 8. Future TripJack Integration

Nothing about `docs/10_TRIPJACK_INTEGRATION.md`'s Remaining TODOs changed. When TripJack's real HTTP calls are eventually implemented (that document's TODO #2), the intended integration point is: `TripJackAdapter.search()`/`details()`/`book()`/`cancel()` stop throwing `NotImplementedError` and instead call `getSupplierDispatcher().dispatch({ capability, operation, call: (supplier, signal) => (supplier as TripJackAdapter)... })` — or, more likely, `TripJackClient`'s nine methods each get wrapped by the dispatcher one layer up, at whatever future call site invokes them, so `TripJackClient` itself never needs to know the Runtime exists. Either way, this sprint deliberately built the seam without touching the connector, so that future sprint is additive, not a rework.

## 9. Remaining TODOs

- **No business module or connector actually calls the dispatcher yet** — by design (`TripJack HTTP calls` explicitly out of scope). Every `/api/supplier-runtime/*` diagnostic endpoint correctly returns empty data today; this is expected, not a bug.
- **`RuntimeCache` has no consumer** — same "prepare abstraction only" instruction as Storage's provider pattern. Nothing caches anything yet because no capability has a cache-worthy read (e.g. a static airport list) implemented.
- **Routing policy is intentionally minimal** (`DefaultRoutingPolicy` = registry order) — `Supplier` carries no priority/weight field on its port, and this sprint didn't add one. A future weighted or least-latency policy is a second class satisfying the same `RoutingPolicy` interface, not a dispatcher change.
- **No fan-out / concurrent multi-supplier dispatch** — failover is sequential (try the next supplier only after the previous one fails or is circuit-broken). Concurrently racing the same request against multiple real suppliers is a business decision (cost, duplicate bookings) deliberately left out of this infrastructure-only sprint.
- **Correlation IDs aren't threaded into Observability's captured logs** — the Runtime's own `logger.info/warn(...)` calls are captured automatically (zero coordination needed, same sink every module already writes through), but the `correlationId` lives only in the log's own `meta`, not cross-referenced with Observability's `x-request-id`/`x-correlation-id` HTTP-level ids, since a supplier dispatch isn't tied to any one inbound HTTP request in this sprint's scope.
- **No dedicated `PermissionResource` for `/api/supplier-runtime/*`** — authenticated-only (any valid identity), not permission-scoped, same deliberate choice as `/api/storage/*` and `/api/system/*`, avoiding any touch to Auth's RBAC seed data this sprint.
- **Timeout/retry/breaker config values are process-wide singletons** (`RuntimeConfigService.getInstance()`), not per-supplier-overridable — every supplier shares the same Hotels/Flights/Booking/Cancellation timeout today; a future sprint may want TripJack-specific overrides once real latency data exists.

## 10. Verification

```
tsc --noEmit           -> clean, checked after every file added this sprint, not just at the end
npm test               -> 47 files, 331 passed, 1 expected fail (pre-existing, unrelated)
npm run test:integration -> 8 files, 38 passed
npm run test:e2e         -> 3 passed
npm run build             -> succeeds; 4 new routes registered:
  /api/supplier-runtime/health
  /api/supplier-runtime/metrics
  /api/supplier-runtime/events
  /api/supplier-runtime/circuit-breakers
```

**Isolation, verified two ways:**
1. File-modification timestamps (not `git diff` — this repository's last commit predates dozens of uncommitted sprints, so nearly every file in the tree shows as "modified" relative to it and `git diff` is not a meaningful signal here): `find src/modules/supplier -type f -not -path "*/runtime/*" -mmin -180` and the same scoped to `adapters/tripjack/` both returned zero files — nothing outside `runtime/` was touched this sprint.
2. Live behavior: `GET /api/health` (pre-existing route, zero code changes) picked up `supplier-runtime: healthy` automatically the moment the runtime's routes were exercised, exactly like every prior module's health check has.

**Live-tested via curl**: `GET /api/supplier-runtime/health` without a token → `401` (fail-closed default correctly applies, no public allow-list entry added); with a valid admin token → `200`, `{status: "healthy", statuses: []}` (correctly empty — nothing has dispatched yet); `/metrics`, `/circuit-breakers`, `/events` all returned correctly-shaped, correctly-empty responses for the same reason.

Unit tests: 10 files, **57 tests** — `retry-policy`/`retry-executor` (12), `timeout-policy`/`with-timeout` (13), `circuit-breaker`/`circuit-breaker-registry` (9), `metrics` (7), `events` (3), `cache` (5), `executor` (5, against a fake `Supplier` test double — success, timeout marking, real-backoff retry-then-succeed, circuit-open rejection without calling the supplier), `dispatcher` (6, capability routing, sequential failover across two fake suppliers, `preferredSupplierCode` pinning, not-found for an unmatched capability), `health` (4).
