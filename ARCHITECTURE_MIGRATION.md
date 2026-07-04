# The Vacation Voice — Travel OS
## Architecture Assessment & Migration Strategy

**Prepared by:** Lead Architect review
**Scope:** `src/` — Next.js 15 / React 19 admin dashboard ("Travel OS") for The Vacation Voice
**Method:** Full static review of all 33 source files, config, and build setup. No code was changed as part of this review.

---

## 1. What this codebase actually is today

This is a **visual prototype, not an application**. It is a Next.js App Router project with 15 routed pages and 13 supporting components, styled with Tailwind v4, that convincingly *looks* like a working travel-operations SaaS (CRM, bookings, itinerary/inventory management, CMS, AI package builder, landing-page generator). Under the surface:

- There is **no backend**. No `src/app/api/*` route handlers exist anywhere in the project.
- There is **no database, ORM, or persistence layer** of any kind (`grep` for prisma/drizzle/mongoose/supabase/postgres/mysql returns nothing).
- There is **no data fetching**. `grep -rn "fetch("` across `src/` returns zero results.
- There is **no environment configuration**. No `.env`, no `next.config.js/ts`, no `process.env` reference anywhere.
- There is **no authentication, session, or authorization** of any kind — `grep` for auth/login/session/jwt/cookie returns nothing (aside from unrelated matches like `quoteAuthor`).
- There are **no tests**, no CI config, no `error.tsx`/`loading.tsx`/`not-found.tsx`, no lint config beyond Next's defaults.
- The project is **not its own git repository** — it lives inside a git repo rooted at the user's home directory, so it has no isolated history, branches, or `.gitignore`.

Every page is a self-contained React client component holding a `const MOCK_X = [...]` array as `useState` initial state. "Create," "Edit," and "Delete" actions mutate that in-memory array and vanish on refresh. This is the correct and expected shape for a **click-through design prototype** — the problem is that it is currently the *only* layer that exists, and several pages (`AiStudio`, `WebsiteManagementPage`) don't even wire up the interactions they display (buttons with no `onClick`, a "Generate" flow that is a hardcoded `setTimeout`).

None of this is a criticism of the UI work itself — the visual design and page inventory are a solid, coherent starting point. The issue is architectural: **the product has no application tier**, and the migration strategy below is about building one underneath the existing UI without discarding it.

---

## 2. Architectural problems, ranked by severity

### P0 — Must fix before this touches real users or real money

1. **Hardcoded production credential committed to source.**
   [src/lib/template-generator.ts:75](src/lib/template-generator.ts:75) embeds a live-looking bearer token as a literal fallback:
   `getenv('TVV_WEBHOOK_BEARER') ?: '480|J6zatmCdITchU40z0UwC61qd8fuToxg2WldtNjg3c5ee0d44'`
   This string is emitted into every generated PHP/HTML landing page and is sitting in the repo in plaintext. **This should be treated as already compromised** — rotate it at the webhook provider regardless of what migration path is chosen. This is independent of the "no code" constraint on this review; it's an operational action, not a refactor.

2. **Zero authentication on an internal ops tool.** The sidebar exposes CRM leads, booking revenue, customer PII (names, emails), and pricing/margin data. Deployed as-is, anyone with the URL has full read/write UI access. There is no login page, no route protection, no concept of a user or role.

3. **No data persistence.** Every "Add," "Edit," "Delete," and "Save Changes" action across Hotels, Activities, Ferry Rates, Bookings, CRM, and Website Management is cosmetic — it mutates local React state that is discarded on reload. Operationally, this means the tool cannot be used for real work yet, even internally.

### P1 — Structural problems that will compound as the app grows

4. **The root layout hardcodes dashboard chrome for every route.** [src/app/layout.tsx](src/app/layout.tsx) wraps `{children}` directly in `<DashboardLayout>` (sidebar + header) at the root. There is no route-group split between "authenticated app shell" and "public/unauthenticated" surfaces (login, a public marketing site, embed views). Any future public page will render with the internal admin sidebar unless this is restructured first.

5. **Domain types are redefined per file instead of shared.** `Booking`, `HotelProperty`, `Flight`, `Destination`, `FerryRate`, `Activity`, `Lead`, `Article`, `PackageCard` etc. are each declared locally inside the page/component that uses them (`interface HotelProperty` in [src/app/itinerary/hotels/page.tsx:6](src/app/itinerary/hotels/page.tsx:6), a parallel-but-different shape wherever "hotel" shows up elsewhere). There is no `src/types/` or shared domain model. This guarantees drift: the "hotel" concept in the Itinerary module and the "hotel" concept in the Bookings module are already different shapes with no shared source of truth.

6. **Massive, unextracted UI duplication.** The same ~90–130 line pattern (search toolbar → table → "Add" modal with the same input styling) is hand-copied across at least 8 files (`itinerary/hotels`, `itinerary/activities`, `itinerary/ferry-rates`, `itinerary/destinations`, `itinerary/flights`, `bookings/hotels`, `bookings/holidays`, `bookings/activities`, `cms/enquiries`). None of it goes through a shared `DataTable`, `Modal`, or `FormField` component. A single styling tweak (e.g., changing the input focus ring) requires editing 8+ files by hand.

7. **Inconsistent reuse — a shared component already exists and is bypassed.** [src/components/bookings/BookingsTable.tsx](src/components/bookings/BookingsTable.tsx) is a real, extracted shared component used by `/bookings`. But `/bookings/hotels`, `/bookings/holidays`, and `/bookings/activities` don't use it or anything like it — they each re-implement their own copy of the same table markup with their own `MOCK_*` array. This suggests the team knows extraction is the right pattern but it isn't being applied consistently.

8. **No design system — just repeated Tailwind utility strings.** Colors, spacing, and card/table/badge styling are inlined as long class strings on every element, copy-pasted between files (e.g. the exact badge class string `"px-2.5 py-1 text-xs font-medium rounded-full ..."` appears near-identically in multiple table files). There's a CSS variable theme in `globals.css`, but no component-level abstraction (no `cva`/`class-variance-authority`, no `Button`/`Badge`/`Card` primitives) sitting on top of it.

9. **Two unrelated tech stacks glued together at runtime.** [src/lib/template-generator.ts](src/lib/template-generator.ts) is a 230-line string-builder that emits standalone **PHP + vanilla JS + Tailwind CDN** HTML documents, triggered from [LandingPageBuilder.tsx](src/components/marketing/LandingPageBuilder.tsx) via client-side `Blob` + `URL.createObjectURL` download. It's excluded from Tailwind's content scanner via a special-cased `@source not` directive in `globals.css`. This is effectively a second, hand-rolled static-site generator living inside the Next.js app, with no relationship to the Next.js rendering pipeline, no shared components with the rest of the UI, and (per finding #1) a leaked secret baked into its output.

10. **Fake/simulated behavior indistinguishable from real behavior.** `AiStudio.tsx`'s "Generate Package" flow is `setTimeout(..., 2000)` with no model call. This is fine for a demo, but there's currently no signal anywhere in the code (naming, comments, feature flag) that separates "this is wired to a real backend" from "this is a timed animation" — that ambiguity is a trap for whoever picks this up next.

### P2 — Smaller but worth fixing during migration

11. Dead navigation: the sidebar links to `/settings` ([Sidebar.tsx:99](src/components/layout/Sidebar.tsx:99)), which has no corresponding page — a guaranteed 404 today.
12. `PricingStep` and `ToggleRow` in `PackageBuilder.tsx` are typed `({ toggles, setToggles }: any)` — the one place `any` is used to route around prop typing that should be a shared interface.
13. No pagination anywhere despite tables being built as if they'd hold real volume (dozens/hundreds of bookings).
14. No loading/error/empty-state conventions — the "no results" row is reimplemented ad hoc per table rather than as a shared state.
15. `WebsiteManagementPage`'s "Save Changes" button and all its inputs are fully static `defaultValue`s with no `onChange`/`onClick` at all — further than "not persisted," it isn't even wired to component state.

---

## 3. Migration strategy

**Guiding constraint (per your instruction): preserve existing pages wherever possible.** The plan below treats the current 15 routes and their URLs as fixed. Nothing here proposes a rewrite or a new design — it sequences the introduction of the missing layers (types, shared UI, data, auth) underneath the pages that already exist, and reserves actual visual/structural change for only the places where today's implementation is a genuine dead end (root layout chrome, the PHP generator).

The phases are ordered so each one is independently shippable and de-risks the next.

### Phase 0 — Foundations (no visible change)
- Give the project its own git repository (currently nested inside a home-directory repo with no isolated history) and a proper `.gitignore`.
- Add environment configuration (`vercel.ts` / `next.config.ts`, `.env.local` convention) even before anything reads from it, so Phase 3 has somewhere to put secrets instead of literals.
- Add `error.tsx`, `loading.tsx`, `not-found.tsx` conventions at the root and key segments.
- Rotate the leaked webhook bearer token (finding #1) immediately — this doesn't depend on any other phase.

### Phase 1 — Shared domain types (no visible change)
- Extract the ~9 locally-duplicated interfaces (`HotelProperty`, `Flight`, `Destination`, `FerryRate`, `Activity`, `Lead`, `Article`, `PackageCard`, booking shapes) into `src/types/`.
- Reconcile the divergent "Hotel," "Booking," etc. shapes between modules (Itinerary vs. Bookings) into single canonical types before any data layer is built on top of them — this is much cheaper to do now, against mock data, than after a database schema exists.
- Every existing page keeps its current markup; only the `interface`/`type` declarations move and get imported.

### Phase 2 — Shared UI primitives (visual output unchanged, markup consolidated)
- Extract `DataTable`, `Modal`, `FormField`, `StatCard`, `Badge` components from the patterns already repeated 8+ times.
- Migrate pages to the new primitives **one at a time**, in place, verifying pixel-for-pixel output against the current version before moving to the next page. Since routes and URLs don't change, this is a safe, incremental, revertible-per-file process.
- Retire the duplicated `bookings/hotels`, `bookings/holidays`, `bookings/activities` table markup in favor of the existing `BookingsTable` pattern, generalized to accept a dataset + column config.

### Phase 3 — Real data layer (pages preserved, data source swapped underneath)
- Introduce Next.js Route Handlers (`src/app/api/*`) and a real datastore (e.g., a Marketplace Postgres provider).
- Convert each page from "client component seeded with a `MOCK_*` array" to "server component fetches initial data, hands off to a client island for interactivity" — the standard Next.js App Router split. The rendered page and its URL do not change; only where the array literal comes from changes.
- Sequence by risk/value: Bookings and CRM (revenue-bearing, highest value to make real) before CMS/Website Management (lowest risk, currently non-functional anyway).

### Phase 4 — Auth & route protection (one structural change to layout, pages preserved)
- Split `src/app/layout.tsx` into route groups: `(dashboard)` for the existing authenticated admin shell, `(public)` or `(auth)` for login and any future public-facing pages. This is the one place the plan asks for a real structural change, because the current single global layout makes it *impossible* to add a login page without it inheriting the sidebar.
- All 15 existing routes move into `(dashboard)` with their URLs unchanged; only their position in the file tree changes to sit under the route group.
- Add an auth provider and gate the `(dashboard)` group behind it.

### Phase 5 — Real integrations
- `AiStudio`: replace the `setTimeout` simulation with an actual model call once there's a real package data model to generate into (depends on Phase 3).
- Itinerary pages (`tripjack`, `flights`, `hotels`): replace `MOCK_*` search results with real TripJack API calls, now that Phase 3 provides the plumbing pattern (route handler → server component) to do this consistently.
- Landing-page generator: at minimum, move the webhook URL/token out of the generated PHP string and into env-driven config server-side (don't ship secrets to a client-downloaded file, ever). Longer-term, evaluate whether these landing pages should become real Next.js routes (ISR) rather than a separately-hosted PHP artifact — flagged as a decision for you, not assumed here, since it changes the hosting story.

### Phase 6 — Hardening
- Pagination on all tables, consistent loading/empty/error states via the Phase 2 primitives, remove the `any` usages, fix or build the `/settings` route, add basic test coverage for the new API layer.

---

## 4. What is explicitly *not* touched

- No visual/design changes to any existing page.
- No route/URL renames — every current path (`/bookings/hotels`, `/itinerary/ferry-rates`, `/cms/guides`, etc.) survives the migration unchanged.
- No framework change — this stays Next.js App Router / React / Tailwind throughout.
- The PHP landing-page generator's *output format* is preserved through Phase 4; Phase 5 only proposes revisiting it once the rest of the app has a real data layer to decide against.

## 5. Immediate action item outside the phased plan

Rotate the webhook bearer token in `template-generator.ts` now — this is a live credential exposure and shouldn't wait on any phase above.

## 6. Governing principles — binding on every phase above and on every later design document

Set explicitly and standing until told otherwise:

- **Never delete existing features.**
- **Reuse existing pages** — every current route/URL is a hard constraint, not a nice-to-have.
- **Refactor gradually** — no big-bang rewrites, in this document or any that follow it.
- **Minimize breaking changes; always preserve backward compatibility.**
- **If something needs replacing, explain why first** — and the replacement ships as a migration path, not an atomic swap.
- **Never rewrite everything at once.**

**Retroactive reconciliation:** [INVENTORY_SYSTEM.md](INVENTORY_SYSTEM.md) describes `inventory_items` / `inventory_supplier_offers` / `inventory_item_mappings` as "superseding" the earlier `hotels`/`activities`/`hotel_contracted_rates`/`activity_supplier_offers`/`supplier_product_mappings` tables from Section 3.4 of this document. Read on its own, "supersedes" could imply a redesign is implemented as a single cutover — it isn't. Under the rules above, that supersession must run as an **expand → migrate → cut over → contract** sequence:

1. **Expand:** create `inventory_items` and its satellite tables *alongside* the existing per-domain tables. Nothing old is touched yet.
2. **Migrate:** one-time backfill of existing `hotels`/`activities` rows into `inventory_items` + detail tables; new writes land in the new tables going forward.
3. **Cut over, one reader at a time:** each existing page/service that currently reads `hotels`/`activities`/`supplier_product_mappings` is moved to read `inventory_items` individually, verified in place — the same page-by-page discipline already described in Phase 2 above, not a single flip.
4. **Contract:** only after every reader has cut over and soaked in production does removing the old `hotels`/`activities`/`hotel_contracted_rates`/`activity_supplier_offers`/`supplier_product_mappings` tables become its own explicit, separately-approved step. It is never an automatic consequence of the new design being "finished."

The same expand-contract discipline applies to every other future-facing change already on record: `booking_items.item_type` → `booking_items.inventory_item_id`, `package_components`' old reference columns → `inventory_item_id`, and the `/api/v1/public/*` versioning rules in [WEBSITE_API.md](WEBSITE_API.md) (additive within a version, old versions kept alive through a deprecation window rather than replaced outright).
