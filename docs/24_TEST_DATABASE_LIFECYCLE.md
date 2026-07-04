# 24. Test Database Lifecycle

Sprint 12 (Database Migration) moved every repository from an in-memory `Map`
to Prisma-backed PostgreSQL. That immediately broke a hidden assumption the
whole test suite had relied on since the Testing Framework sprint: an
in-memory store is process-local and disposable, so every test run — and
every parallel test file — got a fresh, empty, non-shared store for free. A
real Postgres database does not offer that for free. This document describes
the dedicated test database and the reset/seed lifecycle built to restore it.

## 1. Test database architecture

Three databases exist on the local Postgres 16 instance, each with a
distinct, non-overlapping purpose:

| Database | Purpose | Touched by test runs? |
|---|---|---|
| `tvv_hierarchy` | Legacy prototype schema, superseded. | Never. |
| `tvv_travel_os` | Developer/manual-verification database. | Never. |
| `tvv_travel_os_test` | Dedicated, disposable, resettable test database. | Every test run. |

`tvv_travel_os_test` is a separate physical database, not a schema or a set
of tables within `tvv_travel_os` — this means a full `TRUNCATE ... CASCADE`
of every table can never reach real data by construction, not just by
convention.

Connection string lives in `.env.test` (gitignored, alongside `.env`):

```
DATABASE_URL="postgresql://rahulnair@localhost:5432/tvv_travel_os_test?schema=public"
```

`tests/helpers/load-test-env.ts` loads this file with `dotenv`'s
`override: true`, and every test entry point (`vitest.config.ts`,
`vitest.integration.config.ts`, `playwright.config.ts`) imports it first,
before anything else. `override: true` means `.env.test` always wins even if
something else already populated `DATABASE_URL` earlier in the same
process — there is no code path in the test suites where a stray shell
variable or a leftover `.env` value can redirect a test run at a different
database. This was verified directly (see §6).

Child processes spawned by the test suites (`next start` for both the
integration test server and the e2e server) inherit `process.env` at spawn
time, so the override propagates to the real running server process, not
just the script that spawned it.

## 2. Test lifecycle

### Reset

`tests/helpers/reset-test-database.ts` exports `resetTestDatabase()`:

1. `assertIsTestDatabase()` — refuses to proceed unless `DATABASE_URL`
   literally points at `tvv_travel_os_test`. This is the hard backstop: even
   if every other layer above it were somehow bypassed, this check still
   has to pass before a single destructive statement runs.
2. Reads every table name from `pg_tables` (not a hardcoded list, so it
   never drifts out of sync with `schema.prisma` as models are added).
3. `TRUNCATE TABLE ... RESTART IDENTITY CASCADE` across all of them in one
   statement.

TRUNCATE, not per-row `DELETE`, both for speed and because it resets
sequences — irrelevant here since every model uses `@default(uuid())`, but
correct regardless of future schema changes.

### Seed

`resetAndSeedTestDatabase()` calls `resetTestDatabase()`, then **dynamically**
imports `@/modules/auth` and calls `ensureAuthModuleSeeded()` — dynamic, not
static, on purpose (see §4 for why).

### Per-suite wiring

| Suite | Setup | Teardown |
|---|---|---|
| Unit (`npm test`) | `tests/helpers/global-setup.unit.ts`: reset+seed once before the whole run. `fileParallelism: false` so files run sequentially against the one shared database. | Reset again, then close the Prisma connection pool (`tests/helpers/test-setup.unit.ts`'s per-file `afterAll`). |
| Integration (`npm run test:integration`) | `tests/helpers/global-setup.ts`: reset+seed, **then** spawn the `next start` test server (port 3939) — in that order. | Stop the server, reset, disconnect. |
| E2E (`npm run test:e2e`) | `tests/e2e/global-setup.ts`: reset+seed via a spawned `tsx` process, **then** start the e2e server (port 3940) via the same `startTestServer()` helper. | `tests/e2e/global-teardown.ts` stops the server. |

Unit tests call `getXService()` directly — real DI-resolved, Prisma-backed
services, not a mock — so they need the same isolation guarantee the other
two suites get, not a lighter version of it.

## 3. Migration strategy

No new Prisma migrations were needed for this piece of work: the existing
single migration (`prisma/migrations/20260703112243_init`) was applied to
`tvv_travel_os_test` with `prisma migrate deploy` once, up front. Going
forward, whenever a new migration is created against the dev database, it
must also be deployed to the test database with:

```
DATABASE_URL="postgresql://rahulnair@localhost:5432/tvv_travel_os_test?schema=public" \
  ./node_modules/.bin/prisma migrate deploy
```

This is a manual step today — see §7.

## 4. Seed strategy

`prisma/seed.ts` and the test suites both reuse the exact same
`ensureAuthModuleSeeded()` from Sprint 11 (roles, permissions, bootstrap
`SUPER_ADMIN`) — no separate test-only seed logic exists, so there is only
one seeding implementation to keep correct.

**Idempotency**, confirmed by reading, not assumed: `RoleService.ensureSeeded()`
and `PermissionService.ensureSeeded()` both do a per-entry
"`findByX`, skip if present, otherwise insert" loop; the bootstrap admin
creation checks `findByEmail()` before creating. Running the seed twice in a
row inserts nothing the second time (verified in §6).

**A real bug found and fixed in this sprint's own new code, not pre-existing
business logic**: `ensureAuthModuleSeeded()` caches its own promise for the
lifetime of the process (`let seedPromise: Promise<void> | null = null` in
`src/modules/auth/module.ts`) — this is correct for its original purpose
(dedupe concurrent callers within one running server), but it means merely
*importing* `@/modules/auth` fires that unconditional, unawaited seed
attempt immediately. A **static** top-level import of it from
`reset-test-database.ts` started that auto-seed the instant the file was
loaded — racing with the explicit `resetTestDatabase()` truncate that ran a
few lines later in the same function, and once one of those two racing
seed attempts resolved and got cached, nothing in that process could ever
trigger a real reseed again. The fix: the import is now dynamic
(`await import("../../src/modules/auth")`), placed *after* the truncate
call completes, guaranteeing the module (and its auto-seed side effect)
only loads against an already-empty database.

## 5. Verification results

All verification was run against the real `tvv_travel_os_test` database, not
mocked:

- `npm test` — **26 files, 198 passed, 1 expected fail** (the pre-existing,
  intentionally-captured Package seasonal-pricing bug from the Testing
  Framework sprint — unrelated to this work). Run three times in a row with
  identical results; no hang on exit.
- `npm run test:integration` — **8 files, 38 passed**, twice in a row.
- `npm run test:e2e` — **3 passed**, twice in a row. Required removing
  Playwright's built-in `webServer` option (see §6) and pinning
  `workers: 1` (see §6).
- `npm run test:all` — full chain, exit code 0, all three suites' summaries
  clean in one run.
- **Safety guard test**: temporarily pointed `.env.test` at `tvv_travel_os`
  (the real dev database) and ran the reset script directly — it threw
  before executing any destructive statement. Restored `.env.test`
  immediately after and re-ran `npm test` to confirm nothing was left in a
  bad state. The dev database's row counts (1 user, 12 roles) were
  identical before and after every one of these runs.
- **npm script fix, unrelated to the database work but required to satisfy
  "`npm test` ... all work"**: this project's directory name contains a
  colon (`TVV BE:A-DB`), which corrupts `npm`'s `PATH` injection for bare
  command names (colon is the Unix `PATH` delimiter) — `npm test`,
  `npm run build`, etc. failed with `command not found` before any database
  work could even run. Fixed by pointing every script in `package.json` at
  its binary explicitly (`./node_modules/.bin/vitest`, etc.) instead of the
  bare name.
- **Two genuine bugs surfaced by real isolation, both fixed**:
  1. The seeding race described in §4.
  2. `TravellerService.add()`'s duplicate-traveller check
     (`t.dateOfBirth === value.dateOfBirth`, a business-logic file, left
     untouched) compares the freshly-submitted raw input string against
     the previously-stored-then-reread value. The old in-memory repository
     stored `dateOfBirth` completely verbatim; `PrismaTravellerRepository`
     was reading it back via `.toISOString()` (full timestamp), which
     never matches a plain `"1990-05-01"` input. Fixed at the persistence
     layer only — `toDomain()` now truncates to date-only on read — with no
     change to the comparison logic itself.
  3. Playwright's built-in `webServer` starts the server *before* running
     `globalSetup`, so the server's own per-route module instances (each
     Next.js production route bundle appears to hold its own independent
     copy of `ensureAuthModuleSeeded()`'s cached promise) raced each other
     seeding the same tables the moment the health check and first
     requests landed on a fresh, empty database — surfacing as intermittent
     `Unique constraint failed` errors and, once, a genuinely empty login
     response body. Fixed by removing `webServer` entirely and having
     `tests/e2e/global-setup.ts` own the full sequence explicitly:
     reset+seed first, *then* start the server.
  4. A related concurrency issue: Playwright ran the two e2e spec files
     across 2 workers by default, both hitting the same server/database
     concurrently, producing an intermittent failure on the booking-creation
     step. Fixed with `workers: 1` in `playwright.config.ts`.

## 6. Remaining production risks

- **Migration deploy to the test database is manual.** If a future sprint
  adds a Prisma migration and forgets the parallel
  `DATABASE_URL=...tvv_travel_os_test... prisma migrate deploy` step, the
  test suites will fail with a schema-mismatch error, not a silent pass.
  Loud failure, but still a manual step someone has to remember.
- **The underlying `ensureAuthModuleSeeded()` promise-cache-per-process
  design (Sprint 11) is still fragile under genuine concurrent first-boot
  traffic** — this sprint worked around it for every test entry point by
  strictly ordering "seed fully, then start serving traffic," but the
  *production* server itself has no such ordering guarantee: if a real
  production deployment's first few requests hit different route bundles
  concurrently against a brand-new, freshly-migrated database, the same
  `Unique constraint failed` race observed in Playwright's old `webServer`
  flow could theoretically happen in production too. Given `prisma/seed.ts`
  is meant to be run explicitly as a deploy step (not relied upon as
  auto-seed-on-first-request), this is a low-probability risk, but it is a
  real gap in the auth module's own seeding design, not something this
  sprint's test-database work was scoped to fix — flagged here rather than
  silently patched, since it touches `src/modules/auth/module.ts` business
  logic outside this sprint's boundary.
- **`npm run test:integration` still runs a full `npm run build` every
  time** (unchanged from the Testing Framework sprint) — correct and
  necessary (integration tests need a real compiled server), but the
  slowest step in `npm run test:all` by a wide margin.
- **No CI pipeline exists yet to enforce any of this automatically** —
  everything in this document was verified by hand, locally, this sprint.
