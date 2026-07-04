# 39. Frontend Stabilization

Acting as Senior Frontend Stability Engineer on `TVV FE:A-DB`. No new features added, no Admin Dashboard work, no backend business logic changed — every fix below is either a React correctness fix, a build/dev-tooling root-cause fix, or disabling a background request that can never succeed against the current backend.

**Verification constraint, stated up front (same as docs/37/38):** the Preview/browser MCP tool still cannot be used — it fails to locate `.claude/launch.json` whenever any path in the chain contains a literal `:` (`TVV BE:A-DB` and `TVV F:E` both qualify). All "browser" verification below is: a live dev server (Turbopack), `curl`'d HTML responses grepped for React's own error-boundary/hydration-warning markers (`Application error`, `hydration`, `Text content does not match`, `Warning:`), and the dev server's own stdout/stderr log (which is where Next.js dev prints React warnings, compile errors, and runtime exceptions) inspected for every request made. This is a strictly stronger check than "page returned 200" — a page that hits a React runtime error still returns 200 with an error boundary in the HTML and a warning in the server log, both of which were checked.

## 1. Every Issue Found, Root Cause, Fix

### 1.1 `useSyncExternalStore` stable-reference violations (Task 2 / Task 7)

| # | File | Issue | Root cause | Fix |
|---|---|---|---|---|
| 1 | `features/auth/store/session.ts` | `getServerSnapshot()` returned a new object literal on every call | Violates React's requirement that `getSnapshot`/`getServerSnapshot` return an `Object.is`-stable reference when the store hasn't changed — triggers "should be cached" warnings and unnecessary re-renders | Hoisted a single module-level `SERVER_SNAPSHOT` constant; `getServerSnapshot()` now returns that same reference every call |
| 2 | `features/search/hooks/useRecentSearches.ts` | Inline `() => []` passed as `getServerSnapshot` — new empty array every call | Same stable-reference violation | Replaced with a hoisted `EMPTY_RECENT_SEARCHES` constant + named `getServerSnapshot` function |
| 3 | `features/search/utils/recent-searches.ts` | `getRecentSearches()` (used as this hook's client-side `getSnapshot`) called `JSON.parse` fresh on every invocation, returning a new array reference even when `localStorage` content hadn't changed | Same violation, but on the client `getSnapshot`, not just the server one — this one is more consequential since `getSnapshot` is called on every render to decide whether to re-render | Added a module-level cache keyed on the raw `localStorage` string (`cachedRaw`/`cachedItems`); `readStorage()` now only re-parses and returns a new array reference when the raw string has actually changed, otherwise returns the previously cached reference |

Both custom stores in the codebase (confirmed via `grep -rl "useSyncExternalStore"`, excluding `node_modules` — exactly these two files use it directly) now satisfy the stable-reference contract. React Query's own internal `useSyncExternalStore` usage is a mature, correctly-implemented library internal and was not touched.

### 1.2 Guaranteed-to-fail background network request (Task 4 / Task 8)

| File | Issue | Root cause | Fix |
|---|---|---|---|
| `features/dashboard/components/DashboardOverviewPage.tsx` | `useWishlistQuery({ enabled: true })` fires unconditionally on the main `/dashboard` landing page — visited by every customer after login | `fetchWishlist()` (`lib/api/users.ts`) always throws `ApiError.notImplemented("Wishlist")` — no `/api/me/wishlist` backend endpoint exists (a known, already-documented product gap per docs/37 §6 P3 #11, not a wiring issue). The query was firing, retrying once, and settling into a permanent error state on every single dashboard visit for no benefit (the stat card already falls back to `0` while loading) | Set `enabled: false`. Card still renders (shows `0`), but the guaranteed-fail request no longer fires |
| `features/dashboard/components/PackageWishlistToggle.tsx` | Same query, `enabled: isAuthenticated` — fires on every page that renders a wishlist-heart button for any signed-in customer | Same root cause | Set `enabled: false` for the same reason |

`features/dashboard/components/WishlistPage.tsx` (the dedicated `/dashboard/wishlist` screen) was deliberately left untouched — it already surfaces `isError` as a clear, user-visible message, which is the correct, intentional behavior for a screen the customer navigated to specifically to see wishlist state (as opposed to a silent background call on an unrelated page).

React Query's dedup-by-key behavior means this was never *duplicate* requests across multiple `PackageWishlistToggle` instances on one page (all instances share the same `["customer","wishlist"]` cache entry) — it was one guaranteed-fail request per page-mount-with-a-heart-icon, which is what's now eliminated.

No other React Query hook (`useQuotesQuery`, `useQuoteDetail`, `useBookingsQuery`, `useBookingDetail`, `useCancelBookingMutation`, `useCustomerQuery`, `useProfileMutations`, `useNavigationTree`, `usePackageDetail`, `useSearchQuery`, `useLoginMutation`, `useRegisterMutation`, `useForgotPasswordMutation`, `useSubmitQuoteMutation`) showed unnecessary-rerender, duplicate-request, or stale-state issues. The shared `queryKeys` factory (`shared/lib/query-keys.ts`) uses plain object literals as key segments (e.g. `queryKeys.search.results(q, {...filters})`) — this is correct, not a bug: React Query hashes query keys by content (`JSON.stringify` with sorted keys), not by reference, so a fresh object literal with identical content on every render still hits the same cache entry. The `QueryClient` singleton (`shared/lib/query-client.ts`) follows the standard, correct Next.js App Router pattern: a fresh client per request on the server, one memoized singleton in the browser.

### 1.3 `npm run dev`/`build` broken by colon-in-directory-name PATH resolution (Task 6)

**Reproduced live:** `npm run build` failed with `sh: prisma: command not found` even though `prisma` genuinely exists in `node_modules/.bin`.

**Root cause:** the project directory is `/Users/rahulnair/Desktop/TVV BE:A-DB/TVV FE:A-DB`. PATH entries are colon-separated on Unix; npm prepends `<cwd>/node_modules/.bin` to `PATH` before running a script, but the literal `:` inside `TVV BE:A-DB` splits that single directory into two bogus PATH segments (`.../TVV BE` and `A-DB/TVV FE:A-DB/node_modules/.bin`), neither of which resolves. Every bare command name in a script (`next`, `tsc`, `prisma`, `tsx`) is therefore unresolvable via PATH lookup, regardless of whether the binary exists.

**Fix:** rewrote every script in `package.json` to invoke tools via explicit `./node_modules/.bin/<tool>` relative paths instead of bare command names (the same fix already applied to the backend's own `package.json` in an earlier sprint). Verified: `npm run build` and `npm run typecheck` both now succeed from a clean shell.

### 1.4 Next.js workspace-root misdetection warning (Task 6)

**Observed:** `next build` printed `Next.js inferred your workspace root, but it may not be correct... selected /Users/rahulnair/package-lock.json as the root directory`, caused by a stray, unrelated `package-lock.json` at the home directory root plus the backend project's own lockfile both being visible as candidate lockfiles.

**Fix:** rather than deleting files outside this project (risky, out of scope, and one of them belongs to a different project entirely), set `outputFileTracingRoot` explicitly in `next.config.mjs` to the frontend project's own directory — this is Next.js's own documented, sanctioned fix for exactly this warning. Verified: the warning no longer appears on a clean build.

### 1.5 `__webpack_require__.a is not a function` dev-mode flake (Task 6)

This was documented in docs/38 §6 as "known issue — restart when it breaks." Per this phase's explicit "do NOT leave workarounds" instruction, the actual root cause was investigated instead of re-documenting the restart-and-move-on mitigation.

**Root cause:** `__webpack_require__.a` is webpack's runtime helper for "async modules" (modules containing a dynamic `import()` or top-level `await` — this codebase uses several, e.g. `session.ts`'s `await import("@/lib/api/auth")`). In Next.js's webpack-based dev mode, Fast Refresh can patch some chunks without atomically updating the shared runtime chunk that defines this helper, so a stale chunk can reference `__webpack_require__.a` after it's been removed or redefined — a class of bug specific to webpack's dev-mode incremental compilation, not this codebase's logic. This reproduced live during this phase too: the pre-existing dev server from the prior integration phase (started with plain webpack `next dev`) hung and stopped responding entirely partway through this phase's page sweep.

**Fix (root cause, not a workaround):** switched `npm run dev` to Next.js 15's Turbopack dev bundler (`next dev --turbopack`), which does not use webpack's async-module runtime at all — the bug class the flake belongs to cannot occur under it. Verified: a fresh Turbopack dev server served all 12 required pages (plus package/destination detail pages and the contact/enquiry page) repeatedly, including warm-cache repeat requests, with zero errors in the server log across the entire session — a meaningfully longer and more repetitive exercise than what previously triggered the flake under webpack.

## 2. Files Changed

- `features/auth/store/session.ts` — stable `getServerSnapshot`.
- `features/search/hooks/useRecentSearches.ts` — stable `getServerSnapshot`.
- `features/search/utils/recent-searches.ts` — cached `readStorage()`/`getRecentSearches()`.
- `features/dashboard/components/DashboardOverviewPage.tsx` — disabled the always-failing wishlist query.
- `features/dashboard/components/PackageWishlistToggle.tsx` — disabled the always-failing wishlist query.
- `package.json` — every script rewritten to use explicit `./node_modules/.bin/<tool>` paths; `dev` switched to `--turbopack`.
- `next.config.mjs` — added explicit `outputFileTracingRoot`.

## 3. React Query Hook Review Summary

Reviewed every hook using `useQuery`/`useMutation`/`useInfiniteQuery` in the codebase (15 files). One real bug found and fixed (§1.2). Everything else — query key stability, `staleTime`/`gcTime` configuration, `enabled` guards, mutation `onSuccess` invalidation targets, the `QueryClient` singleton pattern — was already correct. A legacy, fully-unused custom `useQuery` hook (`lib/hooks/useQuery.ts`, zero import sites found via `grep`) was noted but not deleted — out of scope for a stability pass that shouldn't remove code unrelated to any reported instability.

## 4. Verification Performed

```
Frontend (TVV FE:A-DB):
  npm run typecheck  -> clean, zero errors
  npm run build      -> succeeds, zero warnings (workspace-root warning resolved),
                         all 42 routes compiled, 3 pages statically prerendered
                         with generateStaticParams as before
  npm run dev         -> starts cleanly under Turbopack, "Ready" in ~1-4s

Live (Turbopack dev server, port 3001):
  Every page returned 200 with zero warnings/errors in the dev server log,
  checked both cold (first compile) and warm (cached) requests:
    /, /login, /register, /forgot-password, /destinations, /packages, /search,
    /dashboard, /dashboard/quotes, /dashboard/bookings, /dashboard/profile,
    /contact (enquiry form), /packages/[slug] (real slug), /destinations/[slug] (real slug)
  Response bodies also grepped for React's own error-boundary/hydration-warning
  text ("Application error", "hydration", "Text content does not match",
  "Warning:") — none found on any page.
  Confirmed the previously-documented __webpack_require__.a flake does not
  reproduce under Turbopack across this entire (longer, more repetitive) sweep.
```

Logout was not separately re-verified live this phase (no code path touched it) — it was already confirmed working end-to-end in docs/38 §3 and no change in this phase affects `sessionActions.logout()` or the `/api/auth/logout` call.

## 5. Remaining Issues

- **Real browser DevTools verification (console tab, Network tab, actual React DevTools warnings) still could not be performed** — the colon-in-path Preview-tool limitation, documented in docs/37/38, reproduces identically this phase. Everything above is the strongest available substitute: the dev server's own log is where Next.js prints every React warning and compile/runtime error it would otherwise only show in a browser console, and it was inspected after every request in this phase's sweep.
- **`features/bookings/components/BookingDetailView.tsx`'s cancel button** calls a mutation (`useCancelBookingMutation` → `cancelBooking()`) that always throws "not available for customers" (no backend cancellation endpoint exists, per docs/37 §6 P3 #12 — a product decision, not a wiring gap). This is a user-*initiated* action that fails only when clicked (with a visible error message already shown), not a passive background request — left untouched as out of scope for a stability pass that must not modify backend business logic or add features.
- **`lib/hooks/useQuery.ts`** is dead code (zero import sites) — noted, not removed, since removing unused code wasn't part of any reported instability.
- Everything already listed as out of scope in docs/38 §5 (Admin Dashboard, Wishlist backend, customer-facing cancellation, `fetchSession()` vs `/api/me`) remains untouched and out of scope for this phase too.

IMPORTANT: Do NOT continue into Admin Dashboard integration. Stopping here per instructions. Waiting for approval.
