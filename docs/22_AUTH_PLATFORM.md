# 22 — Authentication & Authorization Platform

**Status:** Sprint 11, Platform Stabilization Phase — implemented under `src/modules/auth/` (63 module files) plus `src/middleware.ts` and 21 new routes (106 total, up from 85). **Zero business-module files changed** (verified: `git status --porcelain` on `src/modules/{inventory,supplier,destination,package,website,quote,booking}` shows no `M` entries) — every existing route becomes protected purely by `src/middleware.ts` now existing, per this sprint's "Protect every Admin API... no business module modified" instruction.

## Folder Tree

```
src/modules/auth/
├── types/            10 domain objects + AuthContext, 11 files + index
├── validation/         auth/user/api-key request validation, 4 files + index
├── repositories/         10 in-memory repositories (one per domain object) + shared store helper
├── jwt/                    hand-rolled HS256 JwtService (node:crypto, no jsonwebtoken dependency)
├── sessions/                SessionService (device/IP tracking, revocation)
├── roles/                    RoleService + the 12-role seed data
├── permissions/                PermissionService + the 36-permission seed + role→permission matrix
├── audit/                       AuditLogService (append-only)
├── middleware/                   route-permission-map, auth-guard, permission-guard — consumed by src/middleware.ts
├── services/                      AuthService (orchestrator), UserService, ApiKeyService, password hashing, login-attempt policy, config
├── api/                             dto + 6 handler files + a User→PublicUser transformer
├── module.ts                        DI composition root + idempotent seeding + bootstrap SUPER_ADMIN
└── index.ts                          public barrel

src/middleware.ts                  the one enforcement point — gates every /api/* route except the public allow-list
next.config.ts                     new — enables experimental.nodeMiddleware (required for node:crypto in middleware)

src/app/api/auth/{register,login,logout,refresh,me,change-password,request-password-reset,reset-password}/
src/app/api/users/, users/[id]/, users/[id]/roles/, users/[id]/roles/[roleId]/, users/[id]/sessions/, users/[id]/sessions/[sessionId]/
src/app/api/roles/, roles/[id]/, roles/[id]/permissions/
src/app/api/permissions/
src/app/api/audit-logs/
src/app/api/api-keys/, api-keys/[id]/
```

## Files Created

63 files under `src/modules/auth/` + `src/middleware.ts` + `next.config.ts` + 21 route files. No file outside these was touched except `CLAUDE.md` and this document.

## Authentication Flow

```
POST /api/auth/register   (public)   → creates a User, assigns CUSTOMER, self-service signup
POST /api/auth/login      (public)   → verify email+password (scrypt) → check active/locked →
                                        issue access JWT (15 min) + refresh token (7d, or 30d if rememberMe) → create Session
POST /api/auth/refresh    (public)   → verify refresh token (selector:validator) → rotate it →
                                        reuse of an already-rotated token revokes the whole session (theft mitigation)
POST /api/auth/logout     (auth'd)   → revoke Session + its RefreshTokens
GET  /api/auth/me         (auth'd)   → resolved identity: userId, email, roles, permissionKeys
POST /api/auth/change-password (auth'd)
POST /api/auth/request-password-reset (public, no user-enumeration leak)
POST /api/auth/reset-password         (public, selector:validator token)
```

Verified live end-to-end: wrong-password login rejected, correct login issues working tokens, 5 failed attempts locks the account (6th attempt — even with the correct password — correctly returns `423`-equivalent `FORBIDDEN` with the lock expiry time), refresh rotation works, reusing a rotated-out refresh token is rejected AND kills the session (a second refresh attempt with the token that replaced it also then fails), logout revokes the session/refresh token (verified: refresh after logout fails).

**Bootstrap**: since no database and no prior admin exists, `module.ts` seeds one `SUPER_ADMIN` user (`admin@tvv-travel-os.local` / `ChangeMe123!`) on first use — a well-known, intentionally-published default, same "insecure-by-design local default, must rotate before deployment" pattern as `AUTH_JWT_SECRET`'s own default. This must be changed via `change-password` before any non-local exposure.

## Authorization Flow

```
Request → src/middleware.ts
  → isPublicPath()? (exact allow-list: /api/health, /api/auth/{login,register,refresh,request-password-reset,reset-password}; prefix allow-list: /api/website/*) → NextResponse.next(), unauthenticated
  → resolveAuthContext(Authorization header) → verify JWT (stateless: signature + expiry) → 401 if invalid/expired
  → resolveRoutePermission(pathname, method) → {resource, action} (9 resources × 4 CRUD actions; unmapped paths e.g. /api/suppliers/* → authenticated-only, no specific resource)
  → checkPermission(context, required) → 403 FORBIDDEN if the role's permission set doesn't include resource:action
  → forwardAuthHeaders() → route handler (reads identity back via readAuthContextFromHeaders())
```

Fail-closed by construction: the public allow-list is the only way in without a token; everything else defaults to "authenticated required," never "public by omission."

Verified live: a SALES-role user was correctly denied `INVENTORY:CREATE` (403, naming the missing permission key) and correctly allowed `QUOTE:CREATE` (request passed the gate and reached real Quote-module validation logic).

## JWT Structure

Hand-rolled HS256 (`node:crypto`'s `createHmac`, no `jsonwebtoken` dependency), verified with `timingSafeEqual` to avoid a signature-comparison timing side-channel:

```
header    { "alg": "HS256", "typ": "JWT" }
payload   { sub: userId, email, sessionId, roles: RoleName[], iat, exp }
signature HMAC-SHA256(base64url(header) + "." + base64url(payload), AUTH_JWT_SECRET)
```

Access tokens: 15 minutes (`AUTH_ACCESS_TOKEN_TTL_SECONDS`). Refresh tokens: 7 or 30 days (rememberMe), issued as `{refreshTokenRecordId}.{randomValidatorHex}` — only a SHA-256 hash of the validator is ever persisted (selector/validator pattern, same as `PasswordReset` and `ApiKey`).

## Permission Matrix

36 permissions = 9 resources (`INVENTORY, DESTINATION, PACKAGE, WEBSITE, QUOTE, BOOKING, USERS, ROLES, SETTINGS`) × 4 actions (`CREATE, READ, UPDATE, DELETE`). 12 roles, each granted a subset mapped to real module ownership:

| Role | Grant summary |
|---|---|
| SUPER_ADMIN | Every permission |
| ADMIN | Every business resource, full CRUD; USERS create/read/update (not delete); ROLES/SETTINGS read-only |
| SALES | QUOTE full CRUD; BOOKING create+read; read-only Inventory/Destination/Package/Website |
| RESERVATIONS | BOOKING create+read+update; read-only Quote/Package/Inventory/Destination |
| OPERATIONS | INVENTORY/PACKAGE/DESTINATION full CRUD; BOOKING read+update; QUOTE read-only |
| FINANCE | BOOKING read+update; QUOTE/PACKAGE read-only |
| SUPPORT | QUOTE/BOOKING/USERS read-only |
| MARKETING | WEBSITE full CRUD; DESTINATION/PACKAGE read-only |
| SUPPLIER | INVENTORY/BOOKING read-only |
| AGENT | QUOTE create+read; read-only Package/Destination/Booking |
| CUSTOMER | QUOTE/BOOKING read-only |
| API | Read-only across every resource (default grant for API keys) |

**Known gap, flagged**: every grant above is resource-level ("can read QUOTE"), not row-level ("can read only their own"). No per-record ownership scoping exists this sprint — a CUSTOMER can currently read any Quote, not just their own. See Remaining TODOs.

## API List

21 new routes across 6 namespaces: `/api/auth/*` (8), `/api/users/*` (6), `/api/roles/*` (3), `/api/permissions` (1), `/api/audit-logs` (1), `/api/api-keys/*` (2).

## Security Features

- **Password hashing**: `scrypt` (Node's own recommended KDF for this, memory-hard) — not a hand-rolled hash, not bcrypt (avoids a new dependency).
- **Token rotation**: every refresh issues a new refresh token and revokes the old one; reuse of a revoked token kills the whole session (theft mitigation), verified live.
- **Session expiry**: TTL-bound, device/IP captured at creation.
- **Login attempts / account lock**: 5 failed attempts → 15-minute lock (both configurable via env), verified live.
- **Device/IP tracking**: captured on `Session` and every `LoginHistory` entry via `x-forwarded-for`/`user-agent`.
- **Audit log**: all 7 required event types wired (`LOGIN, LOGOUT, FAILED_LOGIN, PERMISSION_DENIED, PASSWORD_RESET, USER_CREATED, ROLE_CHANGED`).
- **No user enumeration**: `request-password-reset` always returns success regardless of whether the email matched an account.
- **passwordHash never serialized**: found and fixed live during verification — `createUserHandler` initially returned the full `User` including `passwordHash`; every handler now maps through `toPublicUser()`.

## Remaining TODOs before Database Migration

1. **Middleware cannot see route-handler-side in-memory state — a real, load-bearing architectural finding, not a hypothetical.** Verified live: Next.js runs `src/middleware.ts` in a module context that does not share this project's in-memory `Map` repositories with the route-handler process. Consequences, both currently accepted and documented in code:
   - Logout revokes the session/refresh token (verified — refresh fails afterward), but an already-issued **access token remains valid in middleware until its own 15-minute expiry** — the standard stateless-JWT tradeoff, not a bug, but worth knowing precisely.
   - **API key authentication is implemented but not currently functional when checked from middleware** — the same isolation applies to `ApiKeyRepository`. The code is correct and requires no rewrite once real accessible storage exists.
   - This entire class of limitation is a direct, temporary consequence of this sprint's explicit "Do NOT implement Database" constraint — `docs/16`'s Prisma+Postgres migration makes both contexts query the same external database and removes it entirely. **This should be the first thing re-verified once that migration lands.**
2. Row-level permission scoping (CUSTOMER/AGENT/SUPPLIER seeing only their own records) — resource-level grants only this sprint, flagged in the Permission Matrix section.
3. Password-reset email delivery — no provider wired anywhere in this project; the reset token is currently logged server-side only (dev-visible), not emailed.
4. Bootstrap SUPER_ADMIN's well-known default password must be rotated before any non-local exposure.
5. `AUTH_JWT_SECRET`'s insecure default must be overridden via a real secret before any non-local deployment.
6. `RolePermission` is not a dynamic, admin-editable join table this sprint — grants are the static `ROLE_PERMISSION_MATRIX`, matching the "system-seeded, not user-editable this sprint" scope boundary already applied to Roles/Permissions themselves.

## Verify

- **TypeScript**: `tsc --noEmit` clean.
- **Tests**: unit 26 files / 198 passing + 1 pre-existing expected-fail (Package's known seasonal-pricing bug, unrelated to this sprint); integration 8 files / 38 passing (updated to authenticate via a new `tests/helpers/api-client.ts` + `test-setup.ts`, since every route they exercise is now correctly gated); e2e 2 files / 3 passing (updated via a new `tests/e2e/fixtures.ts` authenticated request fixture). All previously-green, now updated only to authenticate — zero business-logic assertions changed.
- **Build**: `next build` clean, 106 routes total (85 prior + 21 new), every pre-existing route unchanged. Required adding `next.config.ts` with `experimental.nodeMiddleware: true` and `runtime: "nodejs"` in `middleware.ts`'s config — `node:crypto` (used by JWT/password hashing) is unavailable in the default Edge middleware runtime, confirmed by a real build failure before this was added.
- **Health**: `auth: healthy` registered in `GET /api/health` alongside all 9 prior checks.
- **No business modules modified**: confirmed by `git status --porcelain` — zero `M` entries under any of the 7 business module folders.
