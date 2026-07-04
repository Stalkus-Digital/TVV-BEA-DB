# 17 — Authentication Architecture

**Status:** Phase 2 — architecture plan only, no code implemented. Confirmed by direct search this session: **zero authentication code exists anywhere in this repository.** No `middleware.ts`, no session/JWT/cookie handling, no `User` table or type, no password hashing, no login route. The only auth-shaped code in the entire codebase is `src/modules/supplier/adapters/tripjack/services/tripjack-auth.service.ts`, which prepares (but never sends, per `NotImplementedError`) a request to authenticate *this system* against *TripJack* — unrelated to authenticating a human user against this system.

## Why This Has Been Correct Until Now

Every module built in this project so far has been verified by direct `curl` access from the same machine running the dev server — there has been no real caller to authenticate. `docs/01_CURRENT_SYSTEM_AUDIT.md` established this was true of the original prototype too. Building auth prematurely, before knowing which roles/permissions the real admin surface needs, would have meant guessing — consistent with this project's standing discipline of not inventing architecture ahead of an explicit spec. Now that all planned business modules are complete and Phase 2 has explicitly begun, the shape of what needs protecting is fully known, which is what this document defines.

## Two Distinct Trust Boundaries

This system has always had two audiences, and they need different treatment:

1. **The public website** (external, separate repo, consumes `/api/website/*` only) — reads only, no write path, intentionally public per `docs/02`'s "Website uses APIs only" / "no page should directly access the database" principle. **Should stay unauthenticated** for reads; the existing `docs/09_WEBSITE_API.md` open question about API-key/service-to-service auth for this specific surface remains a separate, smaller decision (see "Website API Auth" below), not the same problem as admin auth.

2. **Every other route** (`/api/inventory/*`, `/api/suppliers/*`, `/api/destinations/*`, `/api/packages/*`, `/api/quotes/*`, `/api/bookings/*`, `/api/geography/*`) — the operational admin surface: sales staff creating quotes, ops staff managing inventory/packages, finance staff recording payments. **Every one of these 78 routes is currently open with no protection at all** and must be gated before any real deployment.

## Recommended Approach: Session-Based Auth via a Lightweight Provider

Given this project's stated preference throughout (hand-rolled, dependency-free foundation pieces behind interfaces — logger, config, DI, Result<T> were all built this way rather than pulling in a library) the same philosophy applies here, with one exception: **authentication is exactly the kind of security-critical code this project should not hand-roll.** Session handling, password hashing, and token verification are areas where a battle-tested library meaningfully reduces risk versus a bespoke implementation, unlike logging or DI where the "library" is genuinely simple. Recommend **Auth.js (NextAuth)** — it is the Next.js–native option, supports credentials-based login (email/password for internal staff, no need for social login) and session storage backed by the same Postgres database `docs/16` is already introducing.

### New Entities (additive to `docs/16`'s schema)

```
User          id, email, passwordHash, fullName, role, isActive, createdAt, updatedAt
Session       id, userId, expiresAt, createdAt   (or JWT-based, no table, per Auth.js strategy choice)
```

### Roles (RBAC)

Derived directly from `docs/02`'s Module Ownership section and this project's actual domain objects — not invented generically:

| Role | Can access |
|---|---|
| `ADMIN` | Everything, including user management (once it exists) |
| `OPS` | Inventory, Destination, Package, Booking (confirm/cancel/ticket/complete, travellers, documents) |
| `SALES` | Quote (create/update/send/duplicate), Booking (create — i.e. convert an approved quote), read-only on Inventory/Destination/Package |
| `FINANCE` | Booking payments/invoices, read-only elsewhere |

This is a starting point, not a final design — it should be revisited once real staff workflows are observed, but it maps cleanly onto the module boundaries already in place (each role's write access lines up with one or two modules, not an arbitrary cross-cutting permission set).

### Enforcement Point: `middleware.ts`

A single `src/middleware.ts` (currently absent) gates every route under `/api/*` except `/api/website/*` and `/api/health`:

```
matcher: ["/api/inventory/:path*", "/api/suppliers/:path*", "/api/destinations/:path*",
          "/api/geography/:path*", "/api/packages/:path*", "/api/quotes/:path*",
          "/api/bookings/:path*"]
```

Per-route role checks (e.g., "only FINANCE or ADMIN may call `POST /api/bookings/:id/payments`") belong in each route handler or a thin wrapper around `jsonSuccess`/`jsonError`, not duplicated per file — a `requireRole(role[])` helper in `src/api/` (alongside the existing `jsonSuccess`/`jsonError`) is the natural extension point, keeping the "API layer: authentication, validation, permissions" responsibility exactly where `docs/02`'s Layer 2 already says it belongs.

### Website API Auth (separate, smaller decision)

`docs/09_WEBSITE_API.md` left this open and it's still open: whether the external website needs a shared API key when calling `/api/website/*` server-to-server, versus staying fully public. Recommend: **stays public**, since the data returned (published packages/destinations) is already meant to be publicly visible on the live site — an API key would add operational overhead (key rotation, distribution to the separate website repo) without a corresponding security benefit for data that's public by design. Revisit only if abuse/scraping becomes a real problem.

### Audit Trail Retrofit

Multiple modules explicitly deferred user-attribution fields because no auth existed yet:
- `PackageVersion` ("No user-attribution field: no auth/user system exists anywhere in this codebase yet")
- `QuoteVersion` (same reasoning, same comment)
- `BookingStatusHistory`/`BookingTimelineEntry` (record *what* changed, never *who* changed it)

Once `User` exists, add `createdByUserId`/`changedByUserId` (nullable, for backward compatibility with pre-auth historical records) to each of these — an additive column, not a breaking change, consistent with the expand-contract discipline used throughout this project.

## Phased Rollout

1. **Phase A**: `User` table + Auth.js credentials login + `middleware.ts` gating all admin routes behind "any authenticated user" (no role granularity yet). This alone closes the critical "every write path is open to the internet" gap.
2. **Phase B**: role-based enforcement per route, using the table above as the starting permission map.
3. **Phase C**: audit-trail retrofit (`createdByUserId` etc.) across Package/Quote/Booking's version and history records.

Phase A is the minimum bar for any production deployment; B and C can follow incrementally without blocking a first production release, since Phase A alone eliminates the critical (not just medium) risk identified in `docs/15`.
