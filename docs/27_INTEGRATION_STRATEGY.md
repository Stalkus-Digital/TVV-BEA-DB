# 27. Integration Strategy

**Analysis only — no code was modified to produce this document.**

## Purpose

Define *how* the frontend and Travel OS backend should be connected, given what docs/25 and docs/26 established: real overlap exists only for Package/Destination/Search/Navigation, a live independent system (`lib/hierarchy`) already owns geographic routing, and a large surface (Ferry, Flights, Guides, Experiences, Reviews, FAQs, Calculator, Enquiries, Customer Bookings) has no backend counterpart at all.

## Data Flow

### Current state (today)

```
Pages ─▶ lib/services/*.service.ts ─▶ apiConfig.useMock ? lib/mock/*
                                                          : lib/api/client.ts ─▶ api.thevacationvoice.com (legacy, /v1/*)

/[...slugs], /destinations-v2/[...slugs], Navbar/MegaMenu
   └─▶ lib/hierarchy/* ─▶ Prisma ─▶ tvv_hierarchy (Postgres, live, independent)
```

Two data planes exist, neither of which is Travel OS.

### Target state (after integration)

```
Pages (Package/Search/Navigation-related) ─▶ lib/services/*.service.ts ─▶ lib/api/client.ts ─▶ Travel OS /api/website/*

Pages (Destination geographic routing)     ─▶ lib/hierarchy/* ─▶ tvv_hierarchy  (UNCHANGED — see Migration Strategy)

Pages (Ferry/Flights/Guides/Experiences/
       Reviews/FAQ/Calculator/Enquiries/
       Customer Bookings)                  ─▶ lib/services/*.service.ts ─▶ mock (UNCHANGED until backend gap is closed)
```

The correct target is **partial, deliberate integration** — not "point everything at Travel OS," because most of what the frontend needs doesn't exist there yet, and one working live system (`lib/hierarchy`) should not be torn out to be replaced by something that wasn't built to replace it.

### Envelope compatibility

`lib/api/client.ts`'s `unwrapApiData()` already expects `{ success: true, data: T }` / `{ success: false, error: {...} }` — this is **already an exact match** for Travel OS's `jsonSuccess()`/`jsonError()` envelope (confirmed by reading both sides). No envelope-adapter code is needed; only the base URL and individual endpoint paths need to change.

## Authentication Flow

### Current state

```
lib/store/auth.ts ─▶ POST /v1/auth/login  ─▶ { access_token, user } ─▶ localStorage("tvv_customer_token")
                  ─▶ POST /v1/auth/register
                  ─▶ GET  /v1/auth/me       (hydration on mount)
                  ─▶ PATCH /v1/auth/me      (profile update — no Travel OS equivalent, see below)
```

### Target state

```
lib/store/auth.ts ─▶ POST /api/auth/login    ─▶ { accessToken, refreshToken, user, roles } ─▶ localStorage
                  ─▶ POST /api/auth/register  (auto-assigns CUSTOMER role server-side already)
                  ─▶ GET  /api/auth/me
                  ─▶ POST /api/auth/refresh   (Travel OS has refresh-token rotation; frontend currently has none — an upgrade, not a downgrade)
```

**Field-name deltas** (exact, from reading both sides — full table in docs/29): `access_token` → `accessToken`; Travel OS also returns `refreshToken` and `expiresIn`, which the frontend's `token.ts` doesn't currently store or use — session length will be shorter than expected unless refresh-token handling is added to `lib/api/token.ts`.

**Gap**: `PATCH /v1/auth/me` (profile update) has no direct Travel OS equivalent — `/api/users/[id]` exists but is admin-gated (requires `USER:UPDATE`), not a "update my own profile" self-service route. A customer calling it today would be rejected. This needs either a new self-service endpoint or `/api/auth/change-password`-style scoping extended to general profile fields — a backend decision, not a frontend one.

**Gap**: row-level ownership scoping. `CUSTOMER` role's `QUOTE:READ`/`BOOKING:READ` grants are resource-level only (documented as a known gap in the backend's own permission-seed code, referencing docs/22's Remaining TODOs). Before `/(account)/account/bookings` can be wired to anything real, Travel OS needs a genuinely new, row-scoped "my bookings"/"my quotes" query path — not a permission change, an actual filter-by-owner capability that doesn't exist in the repositories today.

## SEO Flow

### Current state

Two independent SEO systems already exist and both are good:
- `lib/seo.ts` — `buildMetadata()`, `organizationJsonLd()`, `tourJsonLd()`, `faqJsonLd()` — used by mock/legacy-backed pages (`/tours/[slug]`, `/guides/[slug]`, `/faq`, `/andaman`, etc.)
- `lib/hierarchy/seo.ts` — `buildSeoMetadata()`, `buildBreadcrumbJsonLd()`, `buildDestinationJsonLd()` — used by the hierarchy-backed catch-all

### Target state

Travel OS's `WebsiteSeoDTO` (`title`, `description`, `canonicalUrl`, `ogTitle`, `ogDescription`, `ogImage`) and `WebsiteBreadcrumbDTO` (`label`, `url`) map cleanly onto `lib/seo.ts`'s existing `buildMetadata()` input shape — this is one of the lowest-friction parts of the whole integration. `WebsiteJsonLdDTO` (`schemaType`, `data`) exists on the backend but is explicitly flagged there as "provisional... has not been validated against real structured-data requirements" — treat it as a starting point, not a drop-in replacement for the frontend's own, more mature `tourJsonLd()`/`faqJsonLd()` builders.

**No change needed** for `lib/hierarchy`'s SEO path — it's serving a system Travel OS doesn't model.

## Image Flow

### Current state

Images are a mix of local `/public/*` assets and hardcoded Unsplash fallback URLs (`lib/adapters/publicApi.ts`'s `imageOrFallback()`). No `next.config.mjs` remote-pattern allowlist exists for any Travel OS-hosted domain (because none was ever configured — the frontend has never needed one).

### Target state / gap

Travel OS's DTOs return images as bare strings (`heroImage: string | null`, `gallery: string[]`) with **no defined hosting/CDN convention on the backend side either** — inventory/package/destination records were seeded with local placeholder paths during earlier sprints, not real uploaded-asset URLs. This is a two-sided gap:
1. Backend needs a real image storage/serving strategy (flagged in docs/18_STORAGE_ARCHITECTURE.md, per earlier sprints — still not implemented as of Sprint 12).
2. Frontend's `next.config.mjs` needs `images.remotePatterns` updated once that domain is known.

Until then, any page wired to Website API will render `heroImage: null`/empty `gallery` for most records — expect placeholder/fallback images everywhere on first integration pass, not broken image tags (DTOs are typed nullable and the frontend's card components already have fallback rendering paths per the adapter layer).

## Performance Opportunities

- **ISR is already the right pattern and is already in place** — most frontend pages use `revalidate: 60–1800`. No architecture change needed; only the fetch target changes.
- **`lib/hierarchy`'s `getDestinationTree()` pattern (Next.js `unstable_cache` + tag-based invalidation) is worth reusing** for Website API's `navigation` and `packages`/`destinations` list calls once wired — avoids re-fetching on every request within the revalidation window.
- **Package search's client-side region/theme filtering** (since Travel OS's `/api/website/packages` and `/api/website/search` don't support region/theme query params) will require fetching a full destination-filtered result set and filtering in the route handler or page, not on the client bundle — keeps payload size sane but adds backend round-trip cost per region/theme combination until (if) the backend adds those filters natively.
- **Pagination discipline**: `sitemap.ts` rebuilding from `/api/website/packages`/`destinations` needs to page through results (both endpoints are paginated with a `pageSize`), not assume a single unbounded response.

## Reusable Components

Essentially the entire component tree qualifies as-is once real data replaces mock data — this was true regardless of backend, because components consume typed frontend models (`Package`, `Destination`, etc.), not raw API shapes. Specifically:
- `cards/PackageCard.tsx`, `cards/DestinationCard.tsx` — reusable immediately once `lib/adapters/*` grows a Travel-OS-specific adapter (parallel to existing `manual.adapter.ts`/`tripjack.adapter.ts`) that maps `WebsitePackageSummaryDTO`/`WebsiteDestinationSummaryDTO` → the existing `Package`/`Destination` frontend models.
- `detail/ItineraryAccordion.tsx`, `detail/TourGallery.tsx`, `detail/StickyPriceCard.tsx` — reusable as-is against `WebsitePackageDetailDTO`'s `itinerary`/`gallery`/`pricing` fields, modulo the missing-field gaps noted in docs/26 (ratings, badges, inclusions/exclusions).
- `ui/Breadcrumb.tsx`, `ui/JsonLd.tsx` — reusable as-is against `WebsiteBreadcrumbDTO`/`WebsiteSeoDTO`.
- `skeletons/*` — already exist for loading states; no new skeleton components needed for Website-API-backed pages.

**Nothing in `components/` needs to be rebuilt.** The work is entirely in the services/adapters layer, not the presentation layer.

## Migration Strategy

1. **Do not touch `lib/hierarchy`.** It is a live, working system serving the site's most-trafficked routes (all destination/category geographic URLs). Travel OS's Destination Engine was never built to be a drop-in replacement for it (no materialized slug-path tree, no redirect/slug-history engine, no i18n translation table). Reconciling these two systems is a genuine future architectural question — flagged, not solved, by this analysis.
2. **Add a new adapter, not a new service pattern.** Introduce `lib/adapters/travelOs.adapter.ts` (or similar) alongside the existing `manual.adapter.ts`/`tripjack.adapter.ts`, mapping Website API DTOs to the frontend's existing `Package`/`Destination` models. This preserves every existing component and the existing `ServiceResult<T>` contract.
3. **Repoint `packagesService`/`destinationsService`'s live-mode branch first** (behind the existing `NEXT_PUBLIC_USE_MOCK` flag) — lowest-risk, highest-overlap area per docs/26.
4. **Leave Ferry/Flights/Guides/Experiences/Reviews/FAQ/Calculator/Enquiries/Customer-Bookings on mock** until each has a real backend counterpart — do not fabricate business decisions (e.g., whether Guides becomes a real CMS feature) inside a frontend integration sprint.
5. **Auth repointing is independent and can happen in parallel** — swap `/v1/auth/*` → `/api/auth/*` paths and field names in `lib/api/endpoints`/`lib/store/auth.ts`; this doesn't depend on any other step.
6. **Customer Bookings/Quotes wiring is blocked**, not just deferred — do not connect `/(account)/account/bookings` to `/api/bookings` until row-level ownership scoping exists server-side (see Authentication Flow above). Wiring it today would be a security regression, not a feature.

## Risk Assessment

| Risk | Severity | Notes |
|---|---|---|
| Wiring customer "my bookings" to today's `/api/bookings` | **High** | Resource-level-only permission grants mean a customer role could see other customers' bookings if ever given broader access; even correctly scoped to reject non-admins today, the frontend page would simply fail with 403, not silently leak — but building toward this without the backend fix first is the highest-risk item in the whole sprint. |
| Treating `lib/hierarchy` as replaceable by Travel OS's Destination Engine | **High** | It is not equivalent (no slug-path materialization, no redirect engine, no i18n) — attempting this would break the site's primary navigation/SEO surface. |
| Assuming Website API's missing region/theme/ferry/flights/etc. fields are "almost there" | **Medium** | They are genuinely absent, not just unexposed — closing these gaps is new backend feature work, not a mapping exercise. |
| Image domain / hosting mismatch | **Medium** | Both sides currently lack a real image CDN convention; expect placeholder images on first integration pass, not a quick config fix. |
| Auth field-name/path mismatches | **Low** | Small, mechanical, well-understood differences (see docs/29) — the envelope and role model are already compatible. |
| Envelope/response-shape incompatibility | **None found** | `lib/api/client.ts`'s envelope unwrapper already matches Travel OS's response shape exactly. |
