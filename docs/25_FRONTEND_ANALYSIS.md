# 25. Frontend Analysis

**Analysis only — no code was modified to produce this document.** Subject: `tvv-new2-main/`, a standalone Next.js 15 / React 19 customer-facing travel website, extracted separately from the Travel OS backend at the root of this repo. This is Sprint 13's first deliverable (System Analysis), preceding any implementation sprint.

## Purpose

Establish, in writing, exactly what the existing frontend is — its pages, its data layer, its auth model, its SEO/image handling — before any wiring to the Travel OS Website API is attempted. Every later document (26–29) treats this one as ground truth.

## Current State

### 1. It is a real, mature, mostly-mock-data website — not a shell

`tvv-new2-main` has ~40 page routes, ~50 components, a full services/adapters/models layer, its own auth store, and a **second, independent Postgres-backed subsystem** (`lib/hierarchy/`) with its own Prisma schema, migrations, and seed scripts. This is materially larger and more complete than either the Travel OS backend's embedded admin pages or the empty `Downloads/TVV F:E` scaffold looked at earlier this sprint.

### 2. Pages (full inventory)

| Route | Purpose | Current data source |
|---|---|---|
| `/` | Homepage — hero, trust bar, destination tabs, featured journeys, guides, reels, testimonials | `packagesService`, `destinationsService`, `experiencesService`, `guidesService`, `reviewsService` — mock by default |
| `/destinations/[slug]` | Legacy destination landing | `destinationsService.getBySlug()` — mock/live via adapter |
| `/destinations-v2/[...slugs]` | Hierarchy-backed destination detail (Postgres) | `lib/hierarchy` `resolveDestination()` — **live Postgres, not mock** |
| `/[...slugs]` (root catch-all) | **Production surface** for `/{country}/{destination}/{category}` | `lib/hierarchy` `resolveHierarchyUrl()` — **live Postgres, not mock** |
| `/packages`, `/packages/domestic`, `/packages/domestic/[region]`, `/packages/international` | Package browsing by region | `packagesService.byRegion()`/`byTheme()` — mock by default |
| `/tours/[slug]` | Package/tour detail | `packagesService.getBySlug()` — merges manual + TripJack — mock by default |
| `/search` | Global search | `searchService.query()` — fans out to packages/destinations/guides services |
| `/experiences`, `/experiences/[slug]` | Experience taxonomy (honeymoon, luxury, scuba, etc.) | `experiencesService` — mock by default |
| `/guides`, `/guides/[slug]` | Editorial content | `guidesService` — mock by default |
| `/ferry`, `/ferry/[route]` | Ferry routes/schedules | `ferryService` — mock by default |
| `/flights` | Flight search hub | `flightsService` — mock by default |
| `/faq` | FAQ page | `faqsService` — mock by default |
| `/calculator` | Trip cost estimator | `calculatorService` — pure client-side computation in mock mode |
| `/(account)/login`, `/(account)/register` | Customer auth | `lib/store/auth.ts` — **always live**, no mock path |
| `/(account)/account`, `/(account)/account/bookings` | Customer dashboard | `useAuth()` + `myBookingsService` — **always live**, no mock path |
| `/about`, `/contact`, `/corporate`, `/honeymoon`, `/luxury`, `/andaman`, `/privacy`, `/terms` | Marketing/static | Mostly static content, some pull `packagesService`/`reviewsService`/`faqsService` |
| `/sitemap.ts`, `/robots.ts` | SEO infrastructure | Built from mock data currently |

### 3. Components

Organized into `cards/` (PackageCard, DestinationCard, ExperienceCard, GuideCard, ReelCard, AndamanTile, TourPackageCard), `detail/` (ItineraryAccordion, StickyPriceCard, TourGallery), `layout/` (Navbar, MegaMenu, MobileNav, Footer, Logo, ConciergeWidget), `sections/` (Hero, EnquiryForm, TestimonialStrip, FeaturedJourneys, PackageFiltersListing, CardRail, etc.), `skeletons/` (loading placeholders per card type), `ui/` (Button, Container, Section, Badge, Stars, Breadcrumb, JsonLd, HeroLayout, StickyCTA, FilterChips, SearchBar, FadeUp), and `account/` (AuthLayout, Field, AccountLink, AccountShell). This is a genuinely reusable component library, not page-specific one-offs — see docs/27 §Reusable Components.

### 4. Data layer architecture

```
Page/Component → lib/services/*.service.ts → [apiConfig.useMock ? lib/mock/* : lib/api/client.ts → backend]
                                            → lib/adapters/* (shape normalization, for packages/destinations/guides/experiences)
```

Every service (except `hotels`, `myBookings`, `enquiries`, which are always-live) checks a single global flag, `NEXT_PUBLIC_USE_MOCK`, and switches its entire behavior. `lib/api/client.ts` is a real, working, well-built fetch wrapper: timeout via `AbortController`, exponential-backoff retry, typed error classes, and — critically — **an envelope unwrapper that already expects exactly the Travel OS backend's `{ success: true, data: T }` / `{ success: false, error }` shape.** This was clearly built to eventually talk to a backend shaped like Travel OS, even though today it points at `NEXT_PUBLIC_API_BASE_URL` (`https://api.thevacationvoice.com`, a different, legacy backend entirely).

### 5. The hierarchy subsystem (`lib/hierarchy/`)

This is the single most important discovery of this analysis. It is **not a mock, not a stub — it is a live, functional, independently-deployed system**:

- Its own `prisma-hierarchy/schema.prisma`: `Destination` (self-referencing tree, materialized `slugPath`, DRAFT/PUBLISHED/ARCHIVED status), `DestinationTranslation` (i18n), `DestinationCategory`, `Hotel`, `Package`, `Guide`, `FerryRoute`, `FlightRoute` (all FK'd to `Destination`), plus a `SlugHistory`/`Redirect` engine for URL stability.
- Connects via `HIERARCHY_DATABASE_URL`, expected to point at a database literally named `tvv_hierarchy` — **this is the same `tvv_hierarchy` database the Travel OS backend migration (Sprint 12) explicitly found, recognized as belonging to a different system, and deliberately left untouched.** That decision is now confirmed correct and important: this frontend actively depends on `tvv_hierarchy` for its production URL-routing surface.
- `resolveHierarchyUrl()` / `resolveDestination()` power the two most important routes in the whole site — the catch-all `/[...slugs]` and `/destinations-v2/[...slugs]` — with real ISR caching (60s), tag-based cache invalidation, and a graceful feature-flag (`isHierarchyEnabled()`) that disables itself if the DB is unreachable rather than crashing the build.

**This means the frontend currently runs on two entirely separate data planes**: `lib/hierarchy` (live, Postgres, geographic/URL routing) and `lib/services` (mock-by-default, meant to eventually hit the legacy `api.thevacationvoice.com` backend, product/content data). Neither currently talks to the Travel OS backend built in Sprints 1–12.

### 6. Authentication

Entirely client-side and self-contained: `lib/store/auth.ts` is a hand-rolled store (`useSyncExternalStore`, no Zustand/Redux) that POSTs to `/v1/auth/login` and `/v1/auth/register`, stores a JWT in `localStorage` (`tvv_customer_token`), and hydrates by calling `/v1/auth/me` on mount. No refresh-token rotation — a 401 just clears state back to `"anonymous"`. This is architecturally compatible in shape with what Travel OS's Auth module already provides (JWT, `CUSTOMER` role, `/api/auth/login`, `/api/auth/register`, `/api/auth/me` all already exist — see docs/26), but the URL paths (`/v1/auth/*` vs `/api/auth/*`) and a few field names don't match verbatim.

### 7. SEO

Comprehensive and already production-grade in structure: `lib/seo.ts` + `lib/hierarchy/seo.ts` provide `buildMetadata()`/`buildSeoMetadata()` (Next.js `Metadata` objects), `organizationJsonLd()`, `breadcrumbJsonLd()`, `tourJsonLd()`, `faqJsonLd()`, `buildDestinationJsonLd()`, `buildArticleJsonLd()`. Nearly every page exports `generateMetadata()` and/or renders `<JsonLd />`. `app/sitemap.ts` and `app/robots.ts` exist and are wired, currently sourced from mock data (sitemap) or hierarchy (for the catch-all's own indexing, not yet reflected in `sitemap.ts`).

### 8. Images

No `next.config.mjs` remote-image domain allowlist was found configured for a Travel OS-hosted domain; images today are a mix of local `/public/*` assets and hardcoded Unsplash URLs (`lib/adapters/publicApi.ts`'s `imageOrFallback()`). Package/Destination DTOs from Travel OS return image URLs as plain strings (`heroImage: string | null`, `gallery: string[]`) with no defined hosting/CDN convention yet on the backend side either — see docs/27 §Image Flow.

### 9. Forms

`EnquiryForm.tsx` (main contact form), ferry/flight search forms, `CalculatorWidget.tsx`, and the login/register forms are the five real forms in the site. All enquiry-adjacent CTAs (tour detail, ferry route, calculator result, honeymoon/luxury pages) funnel into `/contact?type=X&...` query-string pre-fill rather than each having its own submission handler — `EnquiryForm` is the single real submission point, posting to `enquiriesService.submit()` → `POST /enquiries` (legacy, always-live, no mock path).

## Problems

1. **Two unrelated backends are assumed, neither is Travel OS.** `lib/api/config.ts`'s `NEXT_PUBLIC_API_BASE_URL` defaults to `api.thevacationvoice.com` (a legacy system with `/v1/*` routes for packages, destinations, ferry, flights, guides, experiences, reviews, faqs, calculator, hotels, myBookings, enquiries, auth) and `lib/hierarchy` talks directly to `tvv_hierarchy` via Prisma. Travel OS's Website API is not referenced anywhere in this codebase today.
2. **The content surface area is far larger than what Travel OS currently models.** Ferry, Flights, Guides, Experiences, Reviews, FAQs (as a standalone list), Calculator, and Enquiries have no equivalent module in Travel OS at all (see docs/26 for the full accounting).
3. **Package/Destination overlap is real but not identical.** Travel OS's `WebsitePackageSummaryDTO`/`WebsitePackageDetailDTO` and `WebsiteDestinationSummaryDTO`/`WebsiteDestinationDetailDTO` cover a meaningful subset of what `lib/models/package.ts`'s `Package` and `lib/models/destination.ts`'s `Destination` expect, but field names, nesting, and available filters differ (see docs/26's field-by-field table).
4. **Customer self-service (bookings, quotes) has a known backend gap.** Travel OS's `CUSTOMER` role has only resource-level `QUOTE:READ`/`BOOKING:READ` grants — explicitly documented in the backend's own code as not row-level-scoped ("can read QUOTE" is a ceiling, not "can read only their own"). `myBookingsService`'s `/v1/me/bookings` has no safe Travel OS equivalent yet.
5. **No public path exists for a customer (or anonymous visitor) to create a Quote/enquiry in Travel OS.** `CUSTOMER` role has no `QUOTE:CREATE` grant, and there is no `/api/website/enquiry`-style public endpoint. `EnquiryForm`'s submission target does not exist in Travel OS.

## Missing APIs

Enumerated in full, endpoint-by-endpoint, in docs/29. Summary: Ferry, Flights, Guides, Experiences, Reviews, standalone FAQs, Calculator, Enquiries/Leads, and safely-scoped Customer Bookings/Quotes all have zero Travel OS backend coverage today.

## Missing DTOs

Travel OS has no DTO type for: `FerryRoute`/`FerrySchedule`/`FerryAvailability`, `FlightItinerary`/`FlightSearchResponse`, `Guide`/`Reel`, `Experience`, `Review`/`TrustStats`, standalone `FAQ` list (only embedded per-package/per-destination FAQ arrays exist), `CalculatorEstimate`, `EnquiryInput`, or a row-scoped `MyBooking`/`MyQuote`.

## Missing Components

None on the frontend side — the component library is comprehensive for the pages that exist. The gap is entirely on the backend/data side, not component/UI.

## Data Flow

See docs/27 §Data Flow for the full current-state vs. target-state diagrams.

## Authentication Flow

See docs/27 §Authentication Flow.

## SEO Flow

See docs/27 §SEO Flow.

## Image Flow

See docs/27 §Image Flow.

## Performance Opportunities

See docs/27 §Performance Opportunities.

## Reusable Components

See docs/27 §Reusable Components — nearly the entire `components/` tree qualifies once real data is wired in; almost nothing needs to be rebuilt.

## Migration Strategy

See docs/27 §Migration Strategy and docs/28 for the page-by-page rollout order.

## Risk Assessment

See docs/27 §Risk Assessment.
