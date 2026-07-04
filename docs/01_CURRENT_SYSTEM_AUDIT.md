# 01 — Current System Audit

**Method:** full read-only review of every file under `src/`, `package.json`, `tsconfig.json`, and build config. 34 files, ~5,800 lines. No file was modified, moved, or renamed to produce this audit. A prior, more narrative version of parts of this audit exists at the repository root in `ARCHITECTURE_MIGRATION.md` §1–2; this document is the current canonical version and classifies every module explicitly, which that one did not.

## Legend

🟢 **KEEP** — sound as-is; extend it, don't touch its shape.
🟡 **REFACTOR** — the concept/UI is right; the implementation needs real data, de-duplication, or wiring.
🔴 **REPLACE** — a specific, strong technical reason (stated per item) makes keeping the current implementation unwise.

Where a capability doesn't exist in the codebase at all, it is listed separately under **"Absent entirely"** — there is nothing to keep, refactor, or replace.

---

## Folder Structure & Routing

```
src/app/            Next.js App Router pages — 15 routes, 1:1 with sidebar nav
src/components/     Feature components, grouped by domain (ai, bookings, cms, crm, layout, marketing, packages)
src/lib/            One file: template-generator.ts
```

| Route | Backing page | Purpose |
|---|---|---|
| `/` | `app/page.tsx` | Dashboard (stat cards, recent activity) |
| `/crm` | `app/crm/page.tsx` → `CrmBoard` | Kanban lead pipeline |
| `/itinerary/ferry-rates` | `app/itinerary/ferry-rates/page.tsx` | Ferry rate management |
| `/itinerary/flights` | `app/itinerary/flights/page.tsx` | Flight search + saved flights |
| `/itinerary/hotels` | `app/itinerary/hotels/page.tsx` | Hotel property management |
| `/itinerary/activities` | `app/itinerary/activities/page.tsx` | Activity catalog management |
| `/itinerary/destinations` | `app/itinerary/destinations/page.tsx` | Destination catalog management |
| `/itinerary/tripjack` | `app/itinerary/tripjack/page.tsx` | "Synced" TripJack packages |
| `/packages`, `/packages/new` | `PackageTable`, `PackageBuilder` | Package list + 7-step builder wizard |
| `/bookings`, `/bookings/hotels`, `/bookings/holidays`, `/bookings/activities` | `BookingsTable` + 3 standalone pages | Booking management |
| `/cms/enquiries` | `app/cms/enquiries/page.tsx` | Lead/enquiry inbox |
| `/cms/guides` | `app/cms/guides/page.tsx` → `GuidesBuilder` | Blog/guide CMS |
| `/cms/website` | `app/cms/website/page.tsx` | Site settings form |
| `/marketing/builder` | `LandingPageBuilder` | PHP/HTML landing page generator |
| `/ai-studio` | `AiStudio` | AI package generation studio |

Root layout (`app/layout.tsx`) wraps **every** route in `DashboardLayout` (sidebar + header) unconditionally — there is no route-group split for a future public/auth surface. Classified below.

---

## Module Classification

| Module | Class | Reason |
|---|---|---|
| App Router route layout (15 routes) | 🟢 KEEP | Route inventory and URL structure are sound; preserve verbatim through any future migration |
| Root layout / `DashboardLayout` wrapping all routes | 🟡 REFACTOR | Needs a route-group split (`(dashboard)` vs `(public)`) before auth or any public page can be added — the current single global shell makes that structurally impossible today, not just untidy |
| `Sidebar.tsx` / `Header.tsx` | 🟢 KEEP | Well-organized nav data structure, easy to extend with new sections. One dead link (`/settings`, no matching page) — trivial fix, doesn't change the classification |
| Dashboard home (`app/page.tsx`) | 🟡 REFACTOR | UI shell (stat cards, activity feed) is fine; every number on it is a hardcoded literal — needs a real data source, not new markup |
| `BookingsTable.tsx` + `/bookings` | 🟢 KEEP | The one place in the app where a shared table component was actually extracted and reused correctly — this is the pattern the rest of the app should have followed |
| `/bookings/hotels`, `/bookings/holidays`, `/bookings/activities` | 🟡 REFACTOR | Each hand-duplicates its own ~90-line table instead of reusing `BookingsTable`'s pattern — the fix is consolidation onto the existing good pattern, not a rewrite |
| `CrmBoard.tsx` | 🟡 REFACTOR | Column/lead-card structure is a reasonable Kanban model; currently has zero interactivity (no drag-drop, no click handlers at all) and static data — needs real state and persistence, not a new design |
| `itinerary/hotels`, `itinerary/activities`, `itinerary/destinations` | 🟡 REFACTOR | Consistent, well-styled search+table+modal pattern, hand-duplicated 3 times — extract once, reuse, then connect to real inventory data |
| `itinerary/ferry-rates` | 🟡 REFACTOR | See **Ferry Implementation** below — UI shell is reusable, "already existing" API claim does not match what's in this repo |
| `itinerary/flights` | 🟡 REFACTOR | Search UI, saved-flights list, and params form are a reasonable starting shell; the codebase is honest about its state — the mock data is explicitly labeled `// Simulated TripJack API Response` and the search handler is a labeled `setTimeout` standing in for a real call |
| `itinerary/tripjack` | 🟡 REFACTOR | Presents itself as "synced TripJack packages" but is 100% static `MOCK_TRIPJACK_PACKAGES` — no sync exists (see Absent Entirely). UI shell reusable once a real Supplier integration exists |
| `PackageTable.tsx` / `/packages` | 🟢 KEEP | Already models a `dynamic: boolean` flag per package (static vs. dynamic) — a genuinely useful precedent that anticipates the Static/Dynamic/Semi-Dynamic distinction this project needs |
| `PackageBuilder.tsx` / `/packages/new` | 🟡 REFACTOR | The 7-step wizard shell (steps, live price sidebar, toggles) is a sound UX skeleton; pricing is hardcoded literals (`+₹12,500` etc.), two steps are explicit placeholders (Inclusions, Media), and one component pair is typed `any` — replace the internals, keep the wizard shape |
| `AiStudio.tsx` | 🟡 REFACTOR (core generation call is 🔴 REPLACE) | The prompt form, parameter panel, and results layout are reusable; the "Generate" action itself is a bare `setTimeout(..., 2000)` with no model call of any kind — that specific piece must be replaced with a real integration, not refactored |
| `GuidesBuilder.tsx` / `guides-sections.tsx` / `guides-types.ts` | 🟢 KEEP | The most complete module in the codebase — real typed `Article`/`ArticleSection` domain model, a working SEO scoring function, structured section types (hero/intro/richtext/faq/quote). Needs persistence, nothing else. Should be the template other CMS-style features follow, not the other way around |
| `cms/enquiries/page.tsx` | 🟡 REFACTOR | Same search+table pattern as the itinerary pages; becomes the real inbox once lead capture is wired to actual form submissions |
| `cms/website/page.tsx` | 🟡 REFACTOR | The field structure (domain, SEO/branding, footer links) is a reasonable settings schema to keep; every input is a static `defaultValue` with no `onChange`, and "Save Changes" has no handler at all — this is the least functional page in the app, but the schema itself doesn't need redesigning |
| `LandingPageBuilder.tsx` + `template-generator.ts` | 🔴 REPLACE | Strong, specific technical reasons, not a style preference: (1) it generates standalone PHP output from inside a Next.js/React app via client-side `Blob` download — a second, unrelated runtime target glued on; (2) it embeds a live-looking webhook bearer token as a plaintext fallback literal in source (`template-generator.ts` line ~75) — a real credential exposure; (3) it's special-cased out of Tailwind's content scanner via `@source not`. These are structural and security problems, not taste |

---

## Absent Entirely (not modules to classify — nothing exists to keep, refactor, or replace)

- **Authentication** — no login, session, JWT, or role concept anywhere in `src/`. Every page is reachable by anyone with the URL.
- **Database / persistence layer** — no ORM, no DB client, no `schema.prisma`, nothing. Every "Add"/"Save"/"Delete" action mutates in-memory React state and is lost on reload.
- **Real API layer** — zero `src/app/api/*` route handlers exist. Zero `fetch(` calls exist anywhere in `src/`.
- **Real TripJack integration** — every "TripJack" reference in the code (`itinerary/tripjack`, `itinerary/flights`) is mock data or an explicitly-labeled simulation, not a client, SDK, or credential.
- **Real Ferry API integration** — see below; the brief for this task describes Ferry APIs as "already existing," and the audit specifically checked for this. It does not match what's in the repository.
- **Environment configuration** — no `.env`, no `next.config.js/ts`, no `process.env` reference anywhere in `src/`.
- **Payment processing** — no gateway integration, no payment-related code at all.
- **Isolated version control** — this repository is not its own git repo; it lives nested inside a git repo rooted at the user's home directory.

---

## Ferry Implementation — explicit note on a discrepancy

The task brief for this audit states "Ferry APIs (already existing)." The audit specifically checked for this (`grep` across all of `src/` for ferry/Makruzz/API-related code, plus a full read of `itinerary/ferry-rates/page.tsx`). **No Ferry API integration exists in this repository.** What exists is a client component (`itinerary/ferry-rates/page.tsx`) with a hardcoded array of five rate rows (operators "Makruzz," "Nautika," "Green Ocean" appear only as string literals in mock data) and the same search+table+add-modal pattern used elsewhere in the app. If a Ferry API integration exists, it is likely in a separate service/repository not included here, or the integration is planned rather than built — worth confirming directly, since it changes how `10_FERRY_INTEGRATION.md` (currently a stub) should eventually be scoped.

## Business Logic Assessment

There is effectively no business logic layer distinct from UI components today — pricing, filtering, and status transitions are all inline arrow functions inside page components operating on local mock arrays. This is expected and appropriate for a click-through prototype; it is called out here because it means **no existing logic needs to be "ported"** into the services layers described in the architecture documents (`SUPPLIER_ABSTRACTION_LAYER.md`, `INVENTORY_SYSTEM.md`, `PACKAGE_BUILDER.md`) — those layers are net-new, not a refactor of something that already computes correctly.

## Reusable Modules (carry forward as-is)

- `BookingsTable.tsx` — the one correctly-extracted shared component in the app.
- `guides-types.ts` / `guides-sections.tsx` — the most mature domain model in the codebase; a good template for how Package/Inventory types should eventually be structured.
- `Sidebar.tsx`'s nav-group data structure — trivially extensible for new modules.
- `PackageTable.tsx`'s `dynamic: boolean` field — an early, correct instinct toward the Static/Dynamic package distinction.

## Technical Debt (see `ARCHITECTURE_MIGRATION.md` for full detail and severity ranking)

Hardcoded webhook credential in source (highest severity — see `LandingPageBuilder`/`template-generator.ts` above), zero auth, zero persistence, ~8 files hand-duplicating the same table/modal markup, domain types (Hotel, Flight, Activity, Booking, Lead) redefined locally per file with no shared model, one `any`-typed prop pair, a dead `/settings` nav link, and a root layout that blocks adding any public/auth route without restructuring first.
