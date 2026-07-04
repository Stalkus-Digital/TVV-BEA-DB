# 37. Platform Integration Audit

**Status:** Audit only — no code changed to produce this document. Every finding below was verified by running the actual application (backend on `:3020`, the customer website `TVV FE:A-DB` on `:3001`, both against the real dev Postgres database) and inspecting real HTTP responses, real HTML output, and real source code — not recalled from memory or assumed from prior sprint reports.

**Scope covered:** Backend (`TVV BE:A-DB`, this repo — 17 sprints of `src/modules/*` + `src/app/api/*`), the Admin Dashboard (`src/app/*` non-API pages, same repo), the customer-facing Website (`TVV FE:A-DB`, a separate Next.js project), and the intended Customer Journey spanning both.

**Method:** Live curl against both running servers (health checks, CORS preflight, auth login, page loads with real backend-sourced data), full-text inspection of every relevant frontend source file (`lib/api/*`, `features/*`, admin `src/app/*` + `src/components/*`), and cross-referencing every frontend API call against the actual route inventory (137 backend route files, grep-verified). The Preview/browser tool could not be used this session — both project directories contain a literal `:` in their name, which the Preview MCP server's `launch.json` path resolution cannot handle (a long-standing constraint in this project, previously hit by `npm`, `git-filter-repo`, and now this). All verification here is HTTP-level (curl, response headers, rendered HTML) and static-source-level, not click-through browser testing.

---

## SECTION 1 — Working Features

**Backend (all 17 sprints, verified this session and in each sprint's own report):**
- Full REST surface for Inventory, Supplier, Destination, Package, Website (public BFF), Quote, Booking, Auth/RBAC, Customer, Storage, Observability, Supplier Runtime, TripJack (search/details only) — 137 route files, all returning the shared `{success, data|error}` envelope.
- `GET /api/health` — real, aggregates every module's health check automatically.
- Auth: login/register/refresh/logout/me/change-password/password-reset all real, working, JWT + refresh-token rotation, RBAC enforced fail-closed via `middleware.ts`.
- Website BFF (`/api/website/*`): home, packages, package detail, destinations, destination detail, search, navigation — all real, all DTO-shaped (never leak internal entities), verified live returning real (test-fixture) data.
- Customer module (`/api/me/*`, `/api/enquiries`): profile, dashboard, quotes (list/detail/submit), bookings (read-only), documents — all real, row-level-ownership-checked, verified in Sprint 13's own live testing and re-confirmed this session (routes exist, respond, are RBAC-gated correctly).
- Package/Destination CRUD, publishing, versioning, pricing, rules — all real via the admin API surface (`/api/packages/*`, `/api/destinations/*`), confirmed working **as an API**.
- Storage (`/api/storage/*`) — real upload/delete/replace/metadata/signed-url/download, Vercel Blob-backed, by design not wired to any frontend yet (Sprint 14's explicit scope).
- Observability (`/api/system/*`) and Supplier Runtime (`/api/supplier-runtime/*`) diagnostics — real, internal-only, correctly authenticated-gated.
- TripJack — real hotel/flight search & details wiring through the Supplier Runtime (retry/timeout/circuit-breaker/metrics), verified this session's own tests; booking/cancellation deliberately not implemented anywhere.

**Website Frontend (`TVV FE:A-DB`), read-only content (server-rendered, verified live via curl):**
- Homepage (`/`) — 200, renders real destination/package data from `/api/website/home`.
- Destinations list (`/destinations`) and detail (`/destinations/[slug]`) — 200, real data.
- Packages list (`/packages`) and detail (`/packages/[slug]`) — 200, real data.
- Search (`/search?q=...`) — 200, real results from `/api/website/search`.
- FAQ, About, Contact, Terms, Privacy, Corporate, Andaman/Honeymoon/Luxury/Tours landing pages — all 200 (static/marketing content, not backend-dependent).
- The local "hierarchy" navigation BFF (`/api/navigation/tree`, backed by the frontend's own separate `tvv_hierarchy` Postgres DB) — 200, unrelated to Travel OS, working.
- Auth pages load (`/login`, `/register`, `/forgot-password`, `/account`) — 200. The underlying `lib/api/auth.ts` code is correctly wired to the real `/api/auth/*` endpoints (verified by reading it against the real route contracts) — **but see Section 2: this cannot actually complete in a browser.**

**Admin Dashboard, as a design/UI shell only:**
- Every page renders without crashing (verified: no build/runtime errors in any of the 19 admin pages).
- Sidebar navigation, layout, and visual design are complete and coherent.

---

## SECTION 2 — Broken Features

Ordered roughly by severity, not by audit-section order (see Section 6 for the actual priority matrix).

1. **No CORS configuration anywhere in the backend.** Verified via a real `OPTIONS` preflight against `POST /api/auth/login` with `Origin: http://localhost:3001` — the response (`204 No Content`) carries **zero** `Access-Control-Allow-Origin`/`-Methods`/`-Headers`/`-Credentials` headers. `grep -rln "Access-Control|cors|CORS" src/` returns nothing — this has never been implemented. Since the website frontend calls the backend directly from browser JS (`lib/api/client.ts`'s `fetch()`, a different origin/port), **every authenticated or mutating call — login, register, refresh, logout, quote submission, profile update, booking cancellation, dashboard reads — will be blocked by the browser itself**, even though curl (which ignores CORS) shows the same requests succeeding with correct data. Read-only content pages (home/destinations/packages/search) are unaffected because those happen server-side during SSR, not in the browser. **This single gap silently breaks the entire authenticated half of the product in any real browser**, and would not be visible from `curl`-only testing or from reading the frontend's request-shape code in isolation — only from checking actual response headers.

2. **The website's primary lead-capture form is wired to a stub.** `components/sections/EnquiryForm.tsx` (used across the marketing site) calls `useSubmitQuoteMutation()` → `lib/api/quotes.ts`'s `submitQuoteRequest()`, which unconditionally `throw`s `ApiError.notImplemented("Quote requests")`. The backend has had a real, public, working endpoint for exactly this since Sprint 13 (`POST /api/enquiries`) — the frontend has **zero references to `/api/enquiries` anywhere** (`grep -rln "enquir|/api/enquiries"` across `lib/api` and `features` returns nothing). Every visitor who submits this form today gets an error; zero leads reach the database.

3. **Customer Dashboard's data layer is fully stubbed**, even though the UI (components, hooks, list/detail views) is fully built:
   - `lib/api/quotes.ts` — `fetchMyQuotes`/`fetchQuoteById` both throw `notImplemented`. The real endpoint (`/api/me/quotes`) has existed since Sprint 13.
   - `lib/api/bookings.ts` — `fetchMyBookings`/`fetchBookingDetail`/`cancelBooking` all throw `notImplemented`, and the file's own comment says `/api/bookings` is "admin-gated with no row-ownership filter — not safe for customers" — correct, but it doesn't know `/api/me/bookings` (the actual safe, row-scoped, already-built endpoint) exists.
   - `lib/api/users.ts`'s `updateProfile` throws `notImplemented` with the comment "Travel OS has no self-service profile PATCH... yet" — also stale; `PATCH /api/me`/`PATCH /api/me/profile` have existed since Sprint 13.
   - `lib/api/config.ts`'s own `travelOs.quotes`/`travelOs.bookings` path builders point at `/api/quotes`/`/api/bookings` (the admin-only paths), not `/api/me/quotes`/`/api/me/bookings` — the config itself needs correcting, not just the stub functions.
   - Net effect: logging into the customer dashboard and viewing Quotes, Bookings, or editing your Profile all fail today — both because of the stubs above **and independently** because of the CORS issue in #1 (fixing one without the other still leaves this broken).

4. **Wishlist has no backend at all.** `lib/api/users.ts`'s `fetchWishlist`/`addToWishlist`/`removeFromWishlist` all throw `notImplemented` — correctly, since `grep -rn "wishlist" src/modules` returns zero matches anywhere in the backend. This is a genuine missing feature, not a wiring bug — no `Wishlist` model, repository, or route exists.

5. **The Admin Dashboard is a 100% static UI mockup with zero backend connectivity.** Verified exhaustively: all 19 admin page files and all 11 admin component files were read; every list/board/table (`PackageTable`, `BookingsTable`, `CrmBoard`, the Enquiries inbox, all 5 `itinerary/*` pages, all 3 `bookings/*` pages, `PackageBuilder`, `LandingPageBuilder`, `GuidesBuilder`, `AiStudio`) renders from a hardcoded literal array or local `useState`, with **zero** `fetch()`/`axios`/`/api/` references anywhere in `src/components` or any admin `page.tsx` (grep-verified, zero hits). Refreshing any admin page discards any in-memory "edit." This means:
   - An admin cannot actually create/publish a Package or Destination through any UI — only via direct API calls (curl/Postman), even though the backend fully supports it.
   - The Enquiries inbox shows 4 fake leads forever; real leads submitted via `/api/enquiries` (once #2 is fixed) will never appear there.
   - Bookings/CRM/Inventory views show fabricated data that has no relationship to the real database.

6. **The Admin Dashboard has no authentication gate at all.** `src/app/layout.tsx` wraps every page in `DashboardLayout` with no login check, no middleware, no session verification — confirmed by reading the root layout directly. Anyone who can reach the dashboard's URL sees it fully rendered (its own data is fake, so the exposure is limited to UI/business-logic visibility, not real customer data — but this is still a real gap given the backend has a complete, working Auth/RBAC system sitting right next to it, unused).

7. **Several sidebar links point at pages that don't exist.** `/settings` (linked from the sidebar's footer) has no `page.tsx` anywhere — 404. The sprint's own Admin Journey checklist names "Inventory," "Customers," "Health," and "Settings" as expected sections; none of the four exist as dashboard pages today (Inventory and Customers have no page at all; Health and Settings are linked/implied but missing).

8. **No Media/upload UI exists anywhere**, consistent with Storage's own Sprint 14 scope decision ("do NOT integrate frontend uploads yet") but still a real gap for "the entire product usable": the only `<input type="file">` elements in the whole codebase are inside the Admin Dashboard's static mock components (`LandingPageBuilder`, `GuidesBuilder`) and only do local `URL.createObjectURL` preview — never call `/api/storage/upload`. No package/destination/profile image can be uploaded through any UI today.

9. **`fetchSession()`'s data is thinner than what's available.** `lib/api/auth.ts` calls `/api/auth/me` (identity/roles only) rather than `/api/me` (Customer's own richer profile, which has `fullName` etc.) — the code comment even flags this as a known gap ("name is unavailable until self-service profile exists"), but that data now exists via Customer's Sprint 13 endpoints and isn't used.

10. **Booking creation is (correctly, by design) not exposed anywhere** — Customer's Sprint 13 explicitly built bookings as read-only ("No automatic booking"; a Booking is only created from an approved Quote through the admin flow). This is not a bug, but it does mean the literal "Booking Flow" step in the Customer Journey (Section 4) cannot be a self-service action — worth stating explicitly so it isn't mistaken for a missing wiring task.

---

## SECTION 3 — API Mismatch

| Frontend call (`lib/api/*`) | Maps to | Status |
|---|---|---|
| `auth.login()` → `POST /api/auth/login` | `src/app/api/auth/login/route.ts` | ✓ Working (contract correct) — ⚠ blocked in a real browser by CORS (#1) |
| `auth.register()` → `POST /api/auth/register` | `.../auth/register/route.ts` | ✓ Working — ⚠ blocked by CORS |
| `auth.logout()` → `POST /api/auth/logout` | `.../auth/logout/route.ts` | ✓ Working — ⚠ blocked by CORS |
| `client.ts` refresh → `POST /api/auth/refresh` | `.../auth/refresh/route.ts` | ✓ Working — ⚠ blocked by CORS |
| `auth.fetchSession()` → `GET /api/auth/me` | `.../auth/me/route.ts` | ✓ Working (thin payload) — ⚠ blocked by CORS |
| `auth.requestPasswordReset()` → `POST /api/auth/request-password-reset` | exists | ✓ Working — ⚠ blocked by CORS |
| `auth.resetPassword()` → `POST /api/auth/reset-password` | exists | ✓ Working — ⚠ blocked by CORS |
| `users.changePassword()` → `POST /api/auth/change-password` | exists | ✓ Working — ⚠ blocked by CORS |
| `destinations.fetchDestinations()` → `GET /api/website/destinations` | `.../website/destinations/route.ts` | ✓ Working (SSR, no CORS impact) |
| `destinations.fetchDestinationBySlug()` → `GET /api/website/destination/:slug` | exists | ✓ Working |
| `packages.fetchPackages()` → `GET /api/website/packages` | exists | ✓ Working |
| `packages.fetchPackageBySlug()` → `GET /api/website/package/:slug` | exists | ✓ Working |
| `packages.fetchFeaturedPackages()`/`website.ts` → `GET /api/website/home` | exists | ✓ Working |
| `search.ts` → `GET /api/website/search` | exists | ✓ Working |
| `destinations.ts` → `GET /api/navigation/tree` | frontend's own local hierarchy BFF, not Travel OS | ✓ Working (unrelated system) |
| `quotes.submitQuoteRequest()` → *(nothing — throws `notImplemented`)* | should be `POST /api/enquiries` | ✗ Missing — never calls the real endpoint |
| `quotes.fetchMyQuotes()` → *(nothing)* | should be `GET /api/me/quotes` | ✗ Missing |
| `quotes.fetchQuoteById()` → *(nothing)* | should be `GET /api/me/quotes/:id` | ✗ Missing |
| `bookings.fetchMyBookings()` → *(nothing)* | should be `GET /api/me/bookings` | ✗ Missing |
| `bookings.fetchBookingDetail()` → *(nothing)* | should be `GET /api/me/bookings/:id` | ✗ Missing |
| `bookings.cancelBooking()` → *(nothing)* | no backend support (bookings are read-only for customers) | ✗ Missing (also not supported server-side by design) |
| `users.updateProfile()` → *(nothing)* | should be `PATCH /api/me` or `PATCH /api/me/profile` | ✗ Missing |
| `users.fetchWishlist()`/`addToWishlist()`/`removeFromWishlist()` → *(nothing)* | no backend model exists at all | ✗ Missing (needs backend work, not just wiring) |
| *(no frontend caller exists)* | `GET /api/me/dashboard` | ✗ Missing — built, unused |
| *(no frontend caller exists)* | `GET /api/me/documents` | ✗ Missing — built, unused |
| *(no frontend caller exists)* | `POST/GET /api/storage/*` | ✗ Missing — by design this sprint, not a bug |
| Admin Dashboard (any page) → *(nothing, ever)* | all 137 backend routes | ✗ Missing — zero API calls anywhere in the Admin Dashboard |

---

## SECTION 4 — Customer Journey

```
Homepage           ✓  loads, real data (SSR, unaffected by CORS)
  ↓
Search             ✓  loads, real results (SSR)
  ↓
Destination        ✓  loads, real data (SSR)
  ↓
Package            ✓  loads, real data (SSR)
  ↓
Login              ⚠  UI renders, code is correctly wired to the real endpoint —
                       ✗ BREAKS HERE in a real browser: no CORS headers on the
                       backend means the browser blocks the cross-origin POST
                       before it ever reaches the server. curl bypasses this
                       and shows the endpoint itself works.
  ↓
Register           ⚠  same as Login — code correct, ✗ blocked by the same CORS gap
  ↓
Quote              ✗  even past a hypothetical CORS fix, the enquiry/quote form
                       calls a function that unconditionally throws
                       `notImplemented` — never reaches `/api/enquiries`
  ↓
Booking            ✗  no self-service creation exists by design (bookings are
                       admin/quote-approval-driven) — `fetchMyBookings`/
                       `cancelBooking` also stubbed regardless
  ↓
Dashboard           ✗  same CORS block on every read, plus quotes/bookings/
                       profile/wishlist all separately stubbed to `notImplemented`
```

**Exact break point for an unauthenticated visitor:** the moment they submit the Login form (or the enquiry/quote form on any page, which requires no login) — both are blocked before Quote is even reached, so in practice the very first interactive action anywhere on the site fails.

**Exact break point for the underlying code, ignoring CORS** (i.e., if CORS were fixed today): Login/Register/Dashboard-reads would start working immediately (their backend contracts are already correct); Quote and Booking would still fail because their stub functions never call the real endpoints at all — a second, independent fix.

---

## SECTION 5 — Admin Journey

```
Dashboard      ✗  static stat cards (hardcoded ₹45,231.89 etc.), fake "Recent
                  Activity" list, a chart placeholder that says "Chart
                  visualization area" — zero real data
Packages       ✗  MOCK_PACKAGES array; "Create Package" button leads to a
                  builder UI with no submit-to-backend anywhere
Destinations   ✗  local useState seeded from a hardcoded array (no admin route
                  for this exists in the sidebar as a top-level item — it's
                  nested under "Itinerary Management")
Inventory      ✗  no dedicated page exists at all (Hotels/Flights/Activities/
                  Ferry-Rates each have their own separate mock page instead,
                  none connected to `/api/inventory`)
Customers      ✗  no page exists at all — not in the sidebar, no route
Leads          ✗  "Enquiries" page — hardcoded 4-row array, unrelated to the
                  real (currently unreachable, see Section 2 #2) `/api/enquiries` data
Quotes         ✗  no dedicated admin page exists at all — not in the sidebar,
                  no route, despite `/api/quotes/*` being a full, real,
                  working admin API (list/send/approve/reject/convert/pdf)
Bookings       ✗  three separate mock tables (Hotel/Holiday/Activity bookings),
                  none connected to `/api/bookings`
Media          ✗  no dedicated page or component exists anywhere
Health         ✗  no dedicated page exists, despite `/api/health` and
                  `/api/system/*` being fully real and ready to display
Settings       ✗  linked from the sidebar footer, 404s — no page exists
```

Every single admin workflow is broken in the same way: **the UI exists (in most cases) but performs no read, no write, and no validation against the real backend.** There is no partial wiring anywhere in the Admin Dashboard to point to — it is uniformly 100% disconnected.

---

## SECTION 6 — Priority Matrix

### P0 — Platform unusable
1. **No CORS configuration on the backend** — blocks every authenticated/interactive browser call site-wide (Section 2 #1).
2. **Admin Dashboard has zero backend wiring and no auth gate** — nothing an admin does in the dashboard has any effect on real data (Section 2 #5, #6).
3. **Lead-capture form throws `notImplemented`** — the website's core business function (capturing enquiries) produces zero leads today (Section 2 #2).

### P1 — Core business flow broken
4. Customer Dashboard's Quotes/Bookings/Profile data layer stubbed to `notImplemented`, and `config.ts` points at the wrong (admin-only) endpoints for both (Section 2 #3).
5. No admin UI exists for Packages/Destinations publishing, Quotes, Bookings, or Customers — even once CORS/auth were fixed, an admin still could not manage the business through this dashboard (Section 2 #5, #7).
6. No admin UI exists to view real Enquiries/Leads once they start arriving (Section 2 #2, #5).

### P2 — Important UX issue
7. `fetchSession()` uses the thinner `/api/auth/me` instead of the richer `/api/me` (Section 2 #9).
8. Sidebar links to a nonexistent `/settings` page (Section 2 #7).
9. No Health/Observability view in the admin dashboard despite the backend fully supporting one (Section 5).
10. No Media/upload UI anywhere, including for content the admin already has UI stubs for (package/hotel images) (Section 2 #8).

### P3 — Minor improvements
11. Wishlist feature has no backend at all — needs a product decision (build it, or remove the frontend UI for it) rather than a wiring fix (Section 2 #4).
12. Booking cancellation has no backend support for customers — needs a product decision (Section 2 #10 territory).
13. Real destination/package content in the dev database is entirely e2e-test fixture data ("Booking Test Destination...") — not a bug, but worth seeding real content before any demo.

---

## SECTION 7 — Execution Plan

Each task is independently testable and scoped to 30 minutes–3 hours. Ordered so each unblocks the next logical piece — CORS first (nothing else can be verified in a real browser without it), then the highest-leverage single fixes, then admin wiring module-by-module.

1. **Add CORS headers to the backend.** Add an `Access-Control-Allow-Origin`/`-Methods`/`-Headers`/`-Credentials` response on every `/api/*` route (most surgically: in `src/middleware.ts`, since it already runs on every request) for the configured frontend origin(s). Test: the exact `curl -X OPTIONS ... -H "Origin: http://localhost:3001"` command from this audit returns the new headers.
2. **Wire the login page to a real, CORS-fixed backend call and confirm a session is established in the browser** (not curl) — smallest possible test of the fix from task 1 actually working end-to-end for the highest-value flow.
3. **Wire the register page** the same way — independently testable (create a new account, confirm auto-login).
4. **Point `lib/api/config.ts`'s `quotes`/`bookings` path builders at `/api/me/quotes` and `/api/me/bookings`** instead of the admin-only paths — a config-only change, testable by inspecting the outgoing request URL.
5. **Rewrite `lib/api/quotes.ts` to call the real endpoints** (`submitQuoteRequest` → `POST /api/enquiries`; `fetchMyQuotes`/`fetchQuoteById` → `GET /api/me/quotes[/:id]`) — removes the `notImplemented` throws.
6. **Fix the website's `EnquiryForm.tsx` submission flow end-to-end** — submit a real enquiry, confirm it lands in the database (`GET /api/enquiries` isn't exposed for reading, so verify via direct DB query or a temporary admin curl).
7. **Rewrite `lib/api/bookings.ts` to call `/api/me/bookings[/:id]`** — removes the `notImplemented` throws for the two supported operations (list, detail); leave `cancelBooking` explicitly unsupported with a clear UI message, since the backend has no such endpoint for customers.
8. **Rewrite `lib/api/users.ts`'s `updateProfile` to call `PATCH /api/me` (or `/api/me/profile`)** — removes that `notImplemented` throw.
9. **Verify the full Customer Dashboard (Quotes tab, Bookings tab, Profile tab) against a real logged-in session** — end-to-end test of tasks 4, 5, 7, 8 together.
10. **Add an admin-only login gate to the Admin Dashboard** (a real check against the existing Auth system — the backend RBAC is already built; this task is purely wiring the dashboard's `layout.tsx` to it).
11. **Wire the admin Packages list (`PackageTable`) to `GET /api/packages`.**
12. **Wire the admin Package Builder's create/save action to `POST /api/packages` + `POST /api/packages/:id/publish`.**
13. **Wire the admin Destinations page to `GET/POST /api/destinations`.**
14. **Wire the admin Enquiries inbox to a real read of `/api/enquiries`'s underlying data** (note: no `GET` list route exists yet for enquiries — this task includes adding one, since it's a small, additive, backend-only change, not a business-module rewrite).
15. **Wire the admin CRM board to the same Enquiry data** (status transitions, if the model supports them) or explicitly scope it down to match what the backend actually models.
16. **Wire the three admin Bookings tables (`bookings/hotels`, `bookings/holidays`, `bookings/activities`) to `GET /api/bookings`**, filtering client-side by kind if the backend doesn't distinguish them, or documenting that distinction as a further gap.
17. **Wire the admin Bookings table's detail/status actions** (confirm/cancel/ticket/complete) to the corresponding real `/api/bookings/:id/*` endpoints.
18. **Add a Health admin page** displaying `/api/health` and `/api/system/*` (Observability is already built — this is a pure read-only display task).
19. **Add (or remove the dead link to) a Settings admin page.**
20. **Add a Customers admin page** backed by `/api/users` (note: this lists internal `User` accounts, not necessarily `CustomerProfile` records — confirm which one the business actually wants before wiring, since they're different models).
21. **Add an Inventory admin page** wired to `GET/POST /api/inventory`, replacing (or clearly separating from) the five separate mock Itinerary pages (Hotels/Flights/Activities/Ferry-Rates/Destinations).
22. **Decide and either implement or remove Wishlist** — currently dead frontend code with no backend; needs a product decision before further engineering.
23. **Decide and either implement or remove customer-facing Booking cancellation** — same category as task 22.
24. **Change `fetchSession()` to call `/api/me` instead of `/api/auth/me`** for the richer profile payload, updating `CustomerUser`'s shape to include `fullName` correctly.
25. **Seed real destination/package content** (replacing the e2e-test-fixture data currently in the dev database) before any stakeholder demo.
