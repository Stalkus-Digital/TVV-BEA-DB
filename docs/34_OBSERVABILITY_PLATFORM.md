# 34. Observability Platform (Sprint 15)

Enterprise observability for Travel OS: structured logging, correlation/request IDs, per-module status/latency, slow-query tracking, a system-level audit timeline, and internal-only alerting. Explicitly not Sentry/Datadog/Grafana/Prometheus — internal abstractions only, same zero-dependency discipline as Logger/Config/DI. No business module changed.

## 1. Folder Tree

```
src/modules/observability/
├── types/
│   ├── log-entry.ts            # CapturedLogEntry, LogQueryFilter
│   ├── metric.ts                # CounterMetric, MetricsSnapshot
│   ├── request-context.ts       # RequestContext {requestId, correlationId}
│   ├── module-status.ts         # ModuleStatus (4-state) + ModuleStatusReport
│   ├── audit-timeline-entry.ts  # AuditTimelineCategory + AuditTimelineEntry
│   ├── system-version.ts        # SystemVersionInfo
│   ├── slow-query.ts            # SlowQueryEntry
│   ├── alert.ts                 # AlertSeverity + Alert
│   └── index.ts
├── logging/
│   ├── log-store.ts       # LogStore — bounded ring buffer, the sink every log line flows into
│   ├── log-capture.ts     # installLogCapture() — wires LogStore into shared/logger's sink
│   └── index.ts
├── metrics/
│   ├── metrics-registry.ts  # MetricsRegistry — plain named counters
│   └── index.ts
├── tracing/
│   ├── request-context.ts  # generateRequestId/resolveCorrelationId/buildRequestContext/attach+read header helpers
│   └── index.ts             # re-exported from the module's public barrel — middleware.ts needs these
├── performance/
│   ├── slow-query-tracker.ts  # SlowQueryTracker — bounded ring buffer, threshold-flagged
│   ├── timer.ts                # startTimer() — used to time each health check individually
│   └── index.ts
├── dashboard/
│   ├── module-status.service.ts   # ModuleStatusService — 3-state -> 4-state mapping, per-module latency + last-activity
│   ├── system-dashboard.service.ts # SystemDashboardService — the one aggregator every handler reads from
│   ├── system-version.service.ts  # getSystemVersion() — package.json + process info
│   └── index.ts
├── audit/
│   ├── audit-timeline.service.ts  # AuditTimelineService — self-fed, diffs module statuses between calls
│   └── index.ts
├── alerts/
│   ├── alert-rule.ts    # evaluateAlerts() — pure function, module statuses + slow queries -> Alert[]
│   ├── alert.service.ts # thin wrapper
│   └── index.ts
├── api/
│   ├── system.handlers.ts  # 6 handlers, one per exposed route
│   └── index.ts
├── module.ts   # DI registration, health check, installLogCapture(), Prisma query-event listener, recordRequestSeen()
└── index.ts    # public barrel: types, api, tracing, service accessors

src/app/api/system/
├── health/route.ts        # GET, public
├── metrics/route.ts       # GET, authenticated-only
├── logs/route.ts          # GET, authenticated-only, ?level=&scope=&limit=
├── performance/route.ts   # GET, authenticated-only
├── modules/route.ts       # GET, authenticated-only
└── version/route.ts       # GET, authenticated-only

tests/unit/observability/  # 7 files, 40 tests
```

**Small, additive changes to shared infrastructure** (not business modules — same category as prior sprints' `route-permission-map.ts`/`tsconfig.json` edits):
- `src/shared/logger/log-sink.ts` (new) + `console-logger.ts` (one extra call) — an optional capture hook, `null` by default, zero behavior change when nothing registers one.
- `src/shared/health/health-registry.ts` — added `getRegisteredChecks()`, a read-only accessor `runAll()`/`getOverallHealth()` didn't expose.
- `src/shared/database/prisma-client.ts` — added `log: [{ emit: "event", level: "query" }]` to the client constructor, enabling Prisma's own query-event emitter (no listener attached there — that lives in Observability's `module.ts`).
- `src/middleware.ts` — additive only: mints a request/correlation id and attaches it to forwarded + response headers, plus one metrics call. Zero change to the existing auth/permission logic (verified: full 275-test suite unchanged before and after).

## 2. Storage Architecture

Deliberately stateless, matching Storage's own precedent — no Prisma models, no `repositories/` folder. Every store here (`LogStore`, `MetricsRegistry`, `SlowQueryTracker`, `AuditTimelineService`) is an in-memory, process-local, bounded ring buffer or counter map:
- **LogStore**: capacity 500, drops oldest first, filterable by level/scope, plus `mostRecentForScope()` for "Last Activity."
- **MetricsRegistry**: plain `Map<string, number>` counters.
- **SlowQueryTracker**: capacity 200, threshold 200ms (`STORAGE`-style configurability not added this sprint — hardcoded, see Remaining TODOs), fed by Prisma's own query-event emitter.
- **AuditTimelineService**: capacity 200, self-fed by diffing module-status snapshots between calls — no external module ever needs to call into it for it to have real content.

This means observability data does not survive a process restart — acceptable for this sprint's scope (the same tradeoff every other in-memory store in this codebase made before its own database migration; unlike business data, restart-losing telemetry is a reasonable default, not a correctness bug).

## 3. Metrics

`MetricsRegistry` (in-process counters) + `/api/system/metrics`, which returns `{metrics, alerts, auditTimeline}`.

**Verified live, an important finding, not just a design note:** `middleware.ts` increments a `requests.seen.*` counter on every single request, but `GET /api/system/metrics`'s `counters` array stays permanently empty no matter how many requests are made — confirmed reproducibly (10+ requests through middleware, checked before and after). This is the **exact same middleware/route-handler module-instance isolation** already discovered and documented in `modules/auth/middleware/auth-guard.ts` (there: an in-memory session repository; here: this in-memory `MetricsRegistry`). Next.js's separate `nodejs` middleware runtime genuinely does not share module-level singletons with the route-handler process — this is a platform constraint, not a bug in this module's code. The counter-increment code is left in place (not dead code from its own side of the boundary) with a clear docstring explaining the limitation; see §6.

Slow-query and per-module-latency data, by contrast, **are** correctly visible via `/api/system/metrics`/`/api/system/performance`/`/api/system/modules` — both are recorded entirely within the route-handler process (Prisma queries run there; health checks run there), so they never cross the middleware/route-handler boundary at all.

## 4. Logging

`installLogCapture()` registers `LogStore.record` as `src/shared/logger`'s one optional sink — every `createLogger(scope)` call from every one of the 11 business modules, plus Observability's own, is captured automatically with zero call-site changes anywhere. Verified live: triggering a real login (`auth.session` logging "Creating session") immediately appeared via `GET /api/system/logs`.

`GET /api/system/logs?level=&scope=&limit=` — validates `level` against the real `LogLevel` union (400 on garbage input, verified live) and `limit` as a positive number.

**Correlation/Request IDs**: `middleware.ts` mints a fresh `requestId` (UUID) and resolves a `correlationId` (reused from an incoming `x-correlation-id` header, or freshly minted) for every request — verified live via `curl -i`, both appear as `x-request-id`/`x-correlation-id` response headers on every response, public or authenticated. They are also forwarded to the route handler via request headers (`readRequestContextFromHeaders`), the same header-forwarding convention `forwardAuthHeaders`/`readAuthContextFromHeaders` already established for `AuthContext`.

**Known, honest limitation**: log entries captured via `LogStore` do **not** currently carry the request's `requestId`/`correlationId` in their `meta`, because doing so would require every business module's own service code to read the forwarded headers and thread them into its own `logger.info(...)` calls — which would be a business-module change, explicitly ruled out this sprint. See Remaining TODOs.

## 5. Tracing

`tracing/request-context.ts` — `generateRequestId()`, `resolveCorrelationId()`, `buildRequestContext()`, `attachRequestContextHeaders()`, `readRequestContextFromHeaders()`. Exported from the module's public barrel specifically so `middleware.ts` can import it (the only reason `tracing/` is re-exported at the top level, unlike every other internal service).

No distributed tracing / spans across service calls is implemented — "Tracing" this sprint means request/correlation ID propagation only, not a span/trace-tree model (would need actual cross-process calls to justify, and this system has none yet — no external HTTP calls to trace across).

## 6. Health

Two coexisting health surfaces, deliberately not merged:
- **`GET /api/health`** (pre-existing, untouched) — the original `{status, checks}` shape, still exactly as it was.
- **`GET /api/system/health`** (new, public) — a richer view: `{status, modules: [{name, status, latencyMs}], version, generatedAt}`.
- **`GET /api/system/modules`** (new, authenticated-only) — the full "Module Status" feature: every registered module's `{name, status, latencyMs, lastActivityAt, details}`.

**4-state model** (`ModuleStatus`: HEALTHY/WARNING/DEGRADED/OFFLINE), deliberately layered on top of the existing shared `HealthStatus` (healthy/unhealthy/degraded) rather than modifying it — `src/shared/health` is depended on by all 11 business modules and was left untouched. `ModuleStatusService` times each registered `HealthCheck` individually (via the new `getRegisteredChecks()` accessor) and maps:
- `unhealthy` -> OFFLINE
- `degraded` -> DEGRADED
- `healthy` + latency ≥ 500ms -> WARNING (a state only Observability adds, synthesized from timing data the shared registry never captured)
- `healthy` + latency < 500ms -> HEALTHY

Verified live: `GET /api/system/health` and `GET /api/system/modules` both correctly report `database`/`observability`/`self`/`auth` (and, after exercising more routes in the same process, every module whose route had been hit) with real per-check latencies and `lastActivityAt` timestamps. Module registration is lazy/import-triggered — same pre-existing behavior as every other module (Customer, Storage), not something this sprint changed or needs to fix.

`observability` itself is registered into the shared `healthCheckRegistry` (trivially healthy, same convention as every other module).

## 7. Performance

- **Slow-query tracking**: real, system-wide, zero per-repository changes — `prisma-client.ts`'s new `log` config plus `module.ts`'s one `prisma.$on("query", ...)` listener means every query from every one of the ~30 repositories across 11 modules is timed automatically. Verified live: `GET /api/system/performance` showed `totalQueriesTracked` increasing across requests (all fast locally, none crossing the 200ms threshold — expected on trivial local queries).
- **Per-module latency**: real, from `ModuleStatusService` timing each health check with `process.hrtime.bigint()`.
- **Middleware processing latency / full request-response timing**: **not implemented**, and after investigation, not honestly achievable this sprint without either (a) touching every route.ts to time its own handler (a business-module change) or (b) a Next.js request-lifecycle hook this version doesn't expose across the middleware/route-handler boundary. What IS real: `recordRequestSeen()` executes correctly inside middleware on every request — its output just isn't visible from the route-handler side, per §3's finding. Full HTTP request/response duration is best measured by Vercel's own platform-level function-duration metrics in production, not rebuilt here.

## 8. Remaining TODOs

- **Metrics counters recorded in `middleware.ts` are invisible to `/api/system/metrics`**, confirmed live (§3) — the same middleware/route-handler module-instance isolation already known from Auth's session repository. Fix requires a real shared store (e.g. a Postgres-backed counter via `$executeRaw`), not an in-memory `Map`, mirroring exactly why `DatabaseHealthCheck` works correctly from both contexts today.
- **Correlation/request IDs are not injected into captured log entries.** Doing so for every module's own service-level logs would require each module's route handlers to read the forwarded headers and pass them through — out of scope as a "no business module changes" sprint. Currently, correlation is only possible by cross-referencing a response's `x-request-id` header against `LogStore` entries by timestamp/scope manually.
- **No distributed tracing / span model** — only request/correlation id propagation exists; there are no external service calls in this system yet to justify a span tree.
- **Slow-query threshold (200ms) and log/query ring-buffer capacities are hardcoded**, not wired through `validateEnv` like every other module's config (Storage's `StorageConfigService` is the pattern to follow later).
- **Alerts are internal-only and pull-based** (read via `/api/system/metrics`, evaluated fresh on every call) — there is no push/paging mechanism, which is correct per this sprint's explicit "no Sentry/Datadog" instruction, but means nobody is notified of a CRITICAL alert unless they poll the endpoint.
- **No dedicated `PermissionResource` for `/api/system/*`** — authenticated-only (any valid identity), not permission-scoped, same deliberate choice as `/api/storage/*` and `/api/suppliers` (avoids touching Auth's RBAC seed data this sprint).
- **In-memory data does not survive a process restart** — acceptable for telemetry (unlike business data), but worth an explicit decision if long-term log/metric retention is ever needed (would point toward a real log-shipping destination, still explicitly out of scope per "no Sentry/Datadog/Grafana/Prometheus").

## 9. Tests

`tests/unit/observability/` — 7 files, 40 tests, all against pure logic or in-memory classes constructed directly (no DI container, no server):
- `log-store.test.ts` — record/list ordering, ring-buffer eviction, level/scope filtering, custom limits, `mostRecentForScope`.
- `metrics-registry.test.ts` — increment (default and custom amount), snapshot sorting, reset.
- `request-context.test.ts` — request id uniqueness, correlation id reuse-vs-mint (including blank-string handling), header round-trip, partial-header failure.
- `slow-query-tracker.test.ts` — threshold classification, `listSlow` vs `listAll`, ring-buffer capacity, configured threshold exposure.
- `module-status.test.ts` — the 3-state -> 4-state mapping function directly (`mapHealthStatusToModuleStatus`, extracted specifically for testability).
- `audit-timeline.test.ts` — no-entry-on-first-observation, transition-recorded-on-change, no-entry-on-no-change, direct `record()`.
- `alert-rule.test.ts` — OFFLINE->CRITICAL, DEGRADED->WARNING, WARNING(latency)->WARNING, slow-query CRITICAL threshold, no-alert cases, aggregation across both sources.

Full suite result:
```
npm test                 -> 38 files, 274 passed, 1 expected fail (pre-existing, unrelated)
npm run test:integration -> 8 files, 38 passed
npm run test:e2e         -> 3 passed
```
All green both before and after every shared-infra edit (log sink, health-registry accessor, Prisma log config, middleware change) — checked at each step, not just at the end.

## 10. Build

```
npm run build
```
Succeeds. All 6 new routes registered as dynamic (`ƒ`) functions:
```
/api/system/health
/api/system/logs
/api/system/metrics
/api/system/modules
/api/system/performance
/api/system/version
```
`tsc --noEmit` clean throughout every step of this sprint.

## 11. Health (live verification summary)

- `GET /api/system/health` (public, no token): `200`, `x-request-id`/`x-correlation-id` response headers present, `status: "healthy"`, module list populated.
- `GET /api/system/modules` (no token): `401 UNAUTHORIZED` — confirms the fail-closed default correctly applies (only `/api/system/health` is on the public allow-list).
- `GET /api/system/modules` (valid admin token): real per-module `{status, latencyMs, lastActivityAt}`, including `auth`, `database`, `observability`, `self` once those modules' routes had been exercised in-process.
- `GET /api/system/logs?limit=10` (valid token): returned real captured log lines (`auth.session "Creating session"`, `auth.role "Roles seeded"`, `auth.permission "Permissions seeded"`) after triggering a real login — proving system-wide capture works with zero changes to Auth's own code.
- `GET /api/system/logs?level=bogus`: `400 VALIDATION_ERROR`, as designed.
- `GET /api/system/performance` (valid token): real `totalQueriesTracked` count and per-module latencies.
- `GET /api/system/version` (valid token): `{name, version: "0.1.0", nodeVersion, environment, startedAt, uptimeSeconds}`.
- `GET /api/system/metrics` (valid token): confirmed the §3/§8 finding — `counters: []` even after 10+ requests, `alerts: []` and `auditTimeline: []` (both correctly empty, since nothing has actually transitioned status or triggered a threshold in this short-lived verification session).
