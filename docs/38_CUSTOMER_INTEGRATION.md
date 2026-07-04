# 38. Customer Integration (Phase 1)

Executes Tasks 1–9 of docs/37's audit execution plan. Objective: a customer can open the website, register, log in, stay logged in, view their profile, browse destinations/packages, search, submit an enquiry, view their own quotes and bookings, log out, and log back in. Nothing else — no Admin Dashboard work, no TripJack, no CRM, no new backend modules.

**Verification constraint, stated up front:** the Preview/browser tool could not be used this phase either (same colon-in-path limitation as docs/37's audit — confirmed reproducible again this session). Every claim below is backed by real HTTP-level verification (curl against two live dev servers, real database queries, real response headers) and full source-code inspection, not browser click-through. Where "verify in a browser, open DevTools" was explicitly asked for, the closest available equivalent — inspecting the exact response headers a browser's CORS check reads, and confirming zero compile/type errors across both projects — is what was actually done, and is called out explicitly per task below.

## 1. Files Changed

**Backend (`TVV BE:A-DB`):**
- `src/shared/cors/cors-config.service.ts` (new) — env-driven allowed-origins singleton.
- `src/shared/cors/cors.ts` (new) — origin resolution + header-building, no wildcard.
- `src/shared/cors/index.ts` (new) — barrel.
- `src/middleware.ts` (modified) — CORS preflight short-circuit (before any auth/public-path logic) + CORS headers applied to every response path. Zero changes to existing auth/permission/observability logic.
- `.env.example` (modified) — documents `CORS_ALLOWED_ORIGINS`.

**Website Frontend (`TVV FE:A-DB`):**
- `lib/api/config.ts` — `travelOs.bookings`/`travelOs.quotes` repointed from the admin-only `/api/bookings`/`/api/quotes` to the row-scoped `/api/me/bookings`/`/api/me/quotes`; added `travelOs.enquiries`, `travelOs.profile`; `endpoints.myBookings.cancel` removed (no such endpoint exists); `endpoints.enquiries`, `endpoints.profile` added.
- `lib/api/quotes.ts` — rewritten: `submitQuoteRequest()` now calls the real `POST /api/enquiries`; `fetchMyQuotes()`/`fetchQuoteById()` now call the real `GET /api/me/quotes[/:id]`.
- `lib/api/bookings.ts` — rewritten: `fetchMyBookings()`/`fetchBookingDetail()` now call the real `GET /api/me/bookings[/:id]`; `cancelBooking()` now throws a clear, explicit "not available for customers" error (no backend endpoint exists — a product decision, not a wiring gap).
- `lib/api/users.ts` — rewritten: `updateProfile()` now calls the real `PATCH /api/me/profile`. `fetchWishlist`/`addToWishlist`/`removeFromWishlist` deliberately left as `notImplemented` (no backend model exists — out of scope, see docs/37).
- `features/quotes/components/QuoteCard.tsx` — displays `quote.title` (a real field) instead of the now-removed fictional `quote.destination`/`quote.tripType`.
- `features/dashboard/hooks/useProfileMutations.ts` — merges the profile-update response with the existing session's `role` (Travel OS's profile PATCH has no RBAC field) before updating session state.
- `features/auth/store/session.ts` — the deprecated `authActions.updateProfile()` path fixed the same way, for type-correctness (not deleted — still referenced, not this phase's scope to remove).

## 2. Bugs Fixed

1. **Zero CORS configuration anywhere in the backend** (docs/37 §2 #1, P0) — the single largest fix this phase. Verified: a real `OPTIONS` preflight from `http://localhost:3001` to `/api/auth/login` previously returned no `Access-Control-*` headers at all; now returns the correct, specific-origin (never wildcard) headers, `Access-Control-Allow-Credentials: true`, and the full preflight header set. A disallowed origin (`http://evil.example.com`) gets a 204 but no `Access-Control-Allow-Origin`, which is what makes a real browser reject it. A CORS preflight against a *protected* path (`/api/me/quotes`) now correctly succeeds without requiring authentication — browsers never send credentials on a preflight request, and the fix short-circuits before the auth/permission gate specifically to honor that.
2. **The website's core lead-capture form threw `not_implemented` on every submission** (docs/37 §2 #2, P0) — `submitQuoteRequest()` now calls the real, public `/api/enquiries` endpoint. Verified live: a submission with `EnquiryForm.tsx`'s exact real-world shape returned a real id and, confirmed via a direct `psql` query against the `enquiries` table, genuinely persisted to the database.
3. **The Customer Dashboard's Quotes/Bookings/Profile were all wired to the wrong (admin) endpoints or threw `not_implemented`** (docs/37 §2 #3, P1) — all three now call their correct, row-scoped, customer-facing counterparts.
4. **`QuoteRequestInput`'s extra fields (destination, trip type, dates, budget, party size) had no matching field on the real Enquiry model** — rather than silently dropping them, they're folded into `message`, the same pattern the form already used for from-city/duration/party-size before this fix.
5. **`updateProfile()`'s return value had no way to satisfy `CustomerUser`'s required `role` field** (Travel OS's profile endpoint is Customer-module-owned and has no RBAC concept) — fixed by having both call sites (`useUpdateProfileMutation` and the deprecated `authActions.updateProfile`) merge the response with the existing session's `role` before updating state, rather than the naive direct pass-through that would have TypeErrored at the type level.

## 3. API Endpoints Connected

| Endpoint | Frontend function | Verified |
|---|---|---|
| `POST /api/auth/register` | `auth.register()` | ✓ live, real account created |
| `POST /api/auth/login` | `auth.login()` | ✓ live, real JWT + refresh token issued |
| `GET /api/auth/me` | `auth.fetchSession()` | ✓ live |
| `POST /api/auth/refresh` | `client.ts`'s auto-refresh | ✓ live, confirmed token rotation (old refresh token rejected after use) |
| `POST /api/auth/logout` | `auth.logout()` | ✓ live, confirmed session revoked (post-logout refresh correctly 401s) |
| `POST /api/enquiries` | `quotes.submitQuoteRequest()` | ✓ live, confirmed persisted via direct DB query |
| `GET /api/me/quotes` | `quotes.fetchMyQuotes()` | ✓ live |
| `GET /api/me/quotes/:id` | `quotes.fetchQuoteById()` | ✓ wired (no quote existed yet to fetch by id in this test account — endpoint contract verified by reading the handler directly) |
| `GET /api/me/bookings` | `bookings.fetchMyBookings()` | ✓ live |
| `GET /api/me/bookings/:id` | `bookings.fetchBookingDetail()` | ✓ wired (same as quotes detail — no booking existed for this fresh test account) |
| `GET /api/me/profile` | (via dashboard hooks) | ✓ live |
| `PATCH /api/me/profile` | `users.updateProfile()` | ✓ live, confirmed persisted (re-fetched after update, matched) |
| `GET /api/me/dashboard` | dashboard hooks | ✓ live, confirmed reflects the just-updated profile name |
| `GET /api/me/documents` | dashboard hooks | ✓ live (correctly empty — no bookings yet) |
| `GET /api/website/*` (home, packages, destinations, search) | already wired, unchanged this phase | ✓ re-confirmed via page-load curl |

## 4. Screens Completed

- **Homepage, Destinations (list/detail), Packages (list/detail), Search** — already working (server-rendered, no CORS impact), re-verified unaffected by this phase's changes.
- **Login, Register** — now genuinely completable in a real browser; previously blocked entirely by the missing CORS headers even though the underlying request code was already correct.
- **Enquiry / "Plan my trip" contact form** — now genuinely submits and persists.
- **Customer Dashboard → Quotes tab** — now shows real (row-scoped) quote data instead of an error.
- **Customer Dashboard → Bookings tab** — now shows real (row-scoped) booking data instead of an error.
- **Customer Dashboard → Profile tab** — name/phone updates now genuinely persist; password change was already working (it was the one field in this file that already called a real endpoint).
- **Customer Dashboard → Documents** — was already correctly wired (Sprint 13); re-verified live, unaffected by this phase.
- **Notifications** — placeholder only, as explicitly accepted by this phase's scope (`unreadNotifications` is a real, always-accurate — if currently always-zero — count from the dashboard endpoint; there's no dedicated notifications screen, and none was built, matching "Notifications (placeholder acceptable)").

## 5. Remaining Work

Everything in docs/37's execution plan from Task 10 onward (all Admin Dashboard wiring) is explicitly out of scope for this phase and untouched:
- Admin login gate, Packages/Destinations/Enquiries/CRM/Bookings/Health/Settings/Customers/Inventory admin pages — all still 100% static mockups, as documented in docs/37.
- Wishlist — still fully unimplemented (no backend model exists; a product decision, not a wiring task, per docs/37 §6 P3 #11).
- Customer-facing booking cancellation — still fully unimplemented (no backend endpoint exists for it; same category of decision, docs/37 §6 P3 #12).
- `fetchSession()` still calls the thinner `/api/auth/me` rather than `/api/me` (docs/37 §2 #9, P2) — not in Tasks 1–9's scope, left untouched.
- Seeding real destination/package content (currently e2e-test-fixture data) — unrelated to this phase, still open.

## 6. Known Issues

- **A pre-existing dev-server flake was observed repeatedly during verification**: after certain sequences of hot-reloads, both dev servers occasionally threw `TypeError: __webpack_require__.a is not a function` on requests to routes that had compiled successfully moments before (`/api/me/bookings`, and once even `/api/auth/login` itself, which had worked correctly minutes earlier in the same process). A full `rm -rf .next` + clean restart reliably resolved it every time, and the same endpoints then worked correctly and consistently. This reproduced on routes this phase never touched (e.g., the admin `/api/bookings`), confirming it's a Next.js dev-mode compilation/HMR issue, not a defect introduced by this phase's code changes. Worth knowing if a future session sees the same error: restart, don't debug the route.
- **Browser-level verification (DevTools console, actual CORS rejection/acceptance as a browser enforces it, hydration warnings) could not be performed directly** — the Preview/browser tool fails to locate `.claude/launch.json` whenever any path in the chain contains a literal `:` (both `TVV BE:A-DB` and `TVV F:E`, the session's primary working directory, qualify), a limitation already documented in docs/37. All verification here is via curl'd response headers/bodies and direct database queries, which prove the server-side half of every CORS/auth contract exactly — but a real browser's actual behavior (whether it *accepts* headers shaped this way) was not observed directly, only inferred from the CORS specification.
- **The `Vary` response header appears twice in some responses** (`Vary: Origin` from this phase's CORS logic, plus Next.js's own automatically-added `Vary: rsc, next-router-state-tree, ...`) rather than merged into one comma-joined line. Harmless (multiple `Vary` header lines are legal HTTP, and no cache/proxy behavior in this system depends on them being merged), left as-is rather than fighting Next.js's own header-injection timing for a cosmetic fix outside this phase's scope.
- **`lib/api/quotes.ts`'s exported `submitQuoteRequest` name no longer matches what it does** (it submits a general Enquiry, not a Quote) — kept unchanged to avoid touching `features/quotes/*`'s many existing call sites for a rename with zero functional benefit; clearly documented inline and here instead.

## 7. Verification Summary

```
Backend:
  tsc --noEmit           -> clean
  npm test                -> 51 files, 369 passed, 1 expected fail (pre-existing, unrelated)
  npm run test:integration -> 8 files, 38 passed
  npm run test:e2e         -> 3 passed
  npm run build             -> succeeds

Frontend (TVV FE:A-DB):
  tsc --noEmit -> clean
  next build    -> succeeds, all dashboard routes (/dashboard, /dashboard/quotes,
                   /dashboard/bookings, /dashboard/bookings/[kind]/[id],
                   /dashboard/profile, /dashboard/wishlist) build cleanly

Live (two real dev servers, real Postgres database):
  - Full auth lifecycle: register -> login -> /api/auth/me -> /api/me/dashboard
    -> refresh (rotation confirmed) -> logout -> old refresh token confirmed rejected
  - CORS: correct headers for the allowed origin, none for a disallowed origin,
    preflight succeeds on a protected path without auth
  - Enquiry submission confirmed to reach the real `enquiries` table via direct psql query
  - Profile update confirmed to persist via re-fetch after PATCH
  - Dashboard, quotes, bookings, documents all return real (correctly empty,
    for a fresh test account) data with no errors
```
