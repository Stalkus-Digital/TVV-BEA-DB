# Coding Conventions — Backend Foundation

**Status:** implemented alongside `src/shared/*` and `src/api/*`. This document is the operational companion to `docs/02_SYSTEM_ARCHITECTURE.md` (Architecture Approved) — it doesn't add new architecture, it defines *how code is written* against the architecture already approved there. Every future module (`src/modules/supplier`, `inventory`, `booking`, `package`, ...) must follow these conventions.

## 1. Folder structure

```
src/
  api/            shared API-layer concerns: response envelope, HTTP helpers — not business logic
  shared/         cross-cutting foundation every module depends on (this document's subject)
  modules/        one folder per bounded context (supplier, inventory, booking, package, destination, crm, cms, ai) — none exist yet
  app/            Next.js routes (pages + src/app/api/* route handlers)
  components/     existing UI — untouched by this foundation
```

Each future `src/modules/<name>/` owns its own `api/`, `services/`, `repositories/`, `validation/`, `types/`, per `docs/02`'s Folder Philosophy. **No shared business logic between modules** — a module may only import another module's public surface (its `index.ts`/`api/` layer), never reach into another module's `services/` or `repositories/` directly.

## 2. Imports

- **Within a module or within `src/shared`**: use relative imports (`../errors/app-error`).
- **Across a module boundary** (e.g. a route handler using `src/shared`, or one module using another's public API): use the `@/*` path alias and import only from a barrel `index.ts` (`@/shared/errors`, `@/shared/health`), never a deep path into another module's internals (`@/shared/errors/app-error` from outside `src/shared` is discouraged once the barrel exists).

## 3. Errors

- All thrown/returned errors are `AppError` or a subclass from `src/shared/errors` (`ValidationError`, `NotFoundError`, `UnauthorizedError`, `ForbiddenError`, `ConflictError`, `InternalError`). Never throw a bare `Error` or string across a module boundary.
- **Expected/domain failures** (not found, validation failure, conflict) should be returned via `Result<T, AppError>` from services and repositories — not thrown. Reserve `throw` for truly exceptional, programmer-error conditions.
- **API route handlers** are the one place both patterns converge: unwrap a `Result` and call `jsonError(result.error)` on failure, or wrap a `catch` around the whole handler body and call `jsonError(error)` — either way, the handler is what turns an error into an HTTP response, via `src/api`, nowhere else.
- Non-`AppError` (unexpected) errors never leak their raw message to a client response (`src/api/response.ts` enforces this) — log the real error server-side via `Logger`, return a generic message to the caller.

## 4. Logging

- Obtain a logger via `createLogger("<module>.<concern>")` (e.g. `createLogger("supplier.tripjack-adapter")`) — never instantiate `ConsoleLogger` directly outside `src/shared/logger`.
- `BaseService` subclasses receive a `Logger` through `ServiceContext` at construction; don't create a second logger instance inside a service that already extends `BaseService`.

## 5. Configuration & environment

- Define a module's environment variables with `validateEnv()` and an `EnvSchema` (see `src/shared/config/env.ts` for the pattern) — never read `process.env.X` directly in module code.
- Each module that needs its own env vars (e.g. a future supplier module's `TRIPJACK_API_KEY`) defines its own schema and its own config accessor the same way `ConfigService` does for app-level config — don't add module-specific keys to the shared `AppConfig`.

## 6. Repositories & services

- Every repository implements `BaseRepository<T, ID>` from `src/shared/repositories`. It has no knowledge of Prisma/any specific persistence technology baked into the interface — that's an implementation detail of the concrete class, decided when `docs/03_DATABASE_ARCHITECTURE.md` and the Prisma/Postgres setup exist.
- Every service extends `BaseService` from `src/shared/services` for a consistent, logger-equipped construction shape.

## 7. Dependency injection & module registration

- A module registers its services/repositories into the shared `Container` (`src/shared/di/container.ts`) by implementing `ModuleDefinition` (`src/shared/di/module-registration.ts`) and calling `moduleRegistry.registerModule(...)` — modules do not construct their own dependencies ad hoc if those dependencies are meant to be shared/testable.
- `createToken<T>("description")` creates the token a dependency is registered and resolved under — one token per registered thing, defined alongside the interface it represents, not inline at each call site.

## 8. Health checks

- A module that has something worth monitoring (a supplier's reachability, a queue's depth, etc.) implements `HealthCheck` (`src/shared/health/health.types.ts`) and registers it with `healthCheckRegistry.register(...)`. `GET /api/health` already aggregates whatever is registered — no module needs its own health endpoint.

## 9. API responses

- Every route handler under `src/app/api/**/route.ts` returns `jsonSuccess(data)` or `jsonError(error)` from `src/api/http.ts` — never a bare `NextResponse.json({...})` with an ad hoc shape. This is what guarantees every API response (present and future) has the same `{ success, data }` / `{ success, error }` envelope described in `docs/09_WEBSITE_API.md`.

## 10. What this foundation deliberately does not do yet

- No ORM/database wiring (Prisma + PostgreSQL are decided, not installed — see `CLAUDE.md`).
- No real logging library, schema-validation library, or DI library — all three pieces above are hand-rolled and dependency-free by deliberate choice, to keep this foundation addable without touching `package.json`. Swapping any of them for a library later means changing the one file behind its interface (`ConsoleLogger`, `validateEnv`, `Container`), not every call site.
- No modules (`supplier`, `inventory`, `booking`, `package`, etc.) exist yet — this document defines how they'll be written, not what they contain.
