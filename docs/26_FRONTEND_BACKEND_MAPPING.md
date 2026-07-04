# 26. Frontend ↔ Backend Mapping

**Analysis only — no code was modified to produce this document.**

## Purpose

Provide the definitive, field-level mapping between every frontend page/service and the Travel OS backend, so implementation (a later sprint) can proceed from a single source of truth instead of re-discovering these mappings mid-build.

## Current State

Frontend and backend were built independently. Overlap exists only for Package, Destination, Search, and Navigation-adjacent content. Everything else (Ferry, Flights, Guides, Experiences, Reviews, FAQs-as-a-list, Calculator, Enquiries, Customer Bookings) is frontend-only today, backed by mock data or a legacy API that isn't Travel OS.

## Per-page mapping

For every page: current data source → future Website API → required DTO → backend module → required changes.

| Page | Current data source | Future Website API | Required DTO | Backend module | Required changes |
|---|---|---|---|---|---|
| `/` (homepage) | `packagesService.featured()`, `destinationsService.homepageShelf()`, `experiencesService`, `guidesService`, `reviewsService` (mock) | `GET /api/website/home` | `HomepageResponseDTO` | `website` | Homepage DTO covers hero/featured/latest packages + destinations + quickLinks + SEO. **No experiences/guides/reviews fields exist on this DTO** — those sections need either a DTO extension (business decision, out of this sprint's scope) or removal/deferral on first integration pass. |
| `/destinations/[slug]`, `/destinations-v2/[...slugs]`, `/[...slugs]` | `lib/hierarchy` (live Postgres `tvv_hierarchy`) | **N/A — do not replace.** This is a separate, working system. | — | — | None. This sprint's mandate is Website API integration, not touching a live, functioning geographic-routing system that Travel OS was never meant to replace. Flag for a future architectural decision (see docs/27 §Migration Strategy). |
| `/packages`, `/packages/domestic`, `/packages/domestic/[region]`, `/packages/international` | `packagesService.byRegion()`/`byTheme()` (mock) | `GET /api/website/packages?destinationSlug=&page=&pageSize=` | `WebsitePackageSummaryDTO[]` (paginated) | `website` | **No "region" (domestic/international) or "theme" filter exists on this endpoint** — only `destinationSlug`. Region/theme browsing needs either a new query param on the backend (business decision) or purely client-side post-filtering by destination once all packages for a set of destinations are fetched (inefficient at scale, workable for launch). |
| `/tours/[slug]` | `packagesService.getBySlug()` — merges manual + TripJack (mock) | `GET /api/website/package/[slug]` | `WebsitePackageDetailDTO` | `website` | Good coverage: itinerary, pricing, gallery, faqs, relatedPackages, breadcrumbs, seo all present. **Missing vs. frontend model**: `rating`/`ratingCount` (frontend `Package.rating`), `badges` (flights-included/staff-pick/etc.), `inclusions`/`exclusions` as distinct lists, `policy.cancellation` text, `themes[]`. These exist on the frontend's `Package` model and mock data but have no backend field to source from yet. |
| `/search` | `searchService.query()` — fans out to packages/destinations/guides (mock) | `GET /api/website/search?keyword=&destinationSlug=&minDurationDays=&maxDurationDays=&minPrice=&maxPrice=&categoryId=&packageType=&page=&pageSize=` | `WebsiteSearchResultDTO` | `website` | Backend search returns **packages only** (`results: WebsitePackageSummaryDTO[]`). Frontend's `SearchResults` expects `{packages[], destinations[], guides[], totalCount}` — destinations and guides sub-results have no backend equivalent search path. |
| `/experiences`, `/experiences/[slug]` | `experiencesService` (mock) | **None exists.** | — | — | No `Experience` concept exists in Travel OS at all (no module, no DTO). Full gap. |
| `/guides`, `/guides/[slug]` | `guidesService` (mock) | **None exists** (Destination DTO's `guides: never[]` is always empty). | — | — | No `Guide`/editorial-content module exists in Travel OS. Full gap — explicitly flagged in the backend's own DTO comment as "CMS doesn't exist yet." |
| `/ferry`, `/ferry/[route]` | `ferryService` (mock) | **None exists.** | — | — | Supplier module has a `FERRIES` *capability* enum value (for B2B supplier onboarding), and there's a placeholder `ferry` supplier adapter — but nothing customer-facing (no route/schedule/availability model, no public endpoint). Full gap. |
| `/flights` | `flightsService` (mock) | **None exists.** | — | — | Inventory has a `FLIGHT` item kind (admin-only, not exposed via Website API), no public search. Full gap. |
| `/faq` | `faqsService.list()` (mock) | **None exists as a standalone list.** FAQs only exist embedded in `WebsitePackageDetailDTO.faqs` and `WebsiteDestinationDetailDTO.faqs`. | — | — | A general, cross-cutting FAQ page has no backend source. Would need either a new public FAQ endpoint or client-side aggregation of every package/destination's embedded FAQs (semantically different from a general FAQ page). |
| `/calculator` | `calculatorService.estimate()` — pure client-side computation in mock mode (mock is actually a real, working pricing model, not placeholder data) | **None exists.** | — | — | No backend pricing-estimate endpoint. This one is lowest-risk to leave client-side-only indefinitely since the mock computation is already a legitimate estimation model, not fake data. |
| `/(account)/login`, `/(account)/register` | `authActions.login()`/`register()` → `/v1/auth/login`, `/v1/auth/register` (always live, legacy backend) | `POST /api/auth/login`, `POST /api/auth/register` | `LoginResult`, `PublicUser` | `auth` | **Path mismatch only** (`/v1/auth/*` vs `/api/auth/*`), plus response field names differ (`access_token` vs `accessToken`, see docs/29). Travel OS already auto-assigns the `CUSTOMER` role on `/api/auth/register` — functionally compatible once the client is repointed. |
| `/(account)/account` | `useAuth()` client store, hydrates via `/v1/auth/me` | `GET /api/auth/me` | `AuthContext` | `auth` | Path + shape mismatch only, same as above. |
| `/(account)/account/bookings` | `myBookingsService.list()` → `/v1/me/bookings` (always live, legacy backend) | **No safe equivalent exists.** Travel OS's `/api/bookings` requires `BOOKING:READ`, which for `CUSTOMER` is resource-level, not row-scoped — a customer with that grant could see every booking in the system, not just their own. | — | `booking` (needs new capability) | **Do not wire this page to `/api/bookings` as-is** — it would either be rejected (customer lacks admin permission entirely in a stricter reading) or, if `CUSTOMER` role is ever given broader access, leak every other customer's bookings. Needs a genuinely new, row-scoped "my bookings" backend capability before this page can go live. Flagged as a production blocker, not a wiring task. |
| `/about`, `/contact`, `/corporate`, `/privacy`, `/terms` | Static content, no service calls | N/A | — | — | No backend involvement needed; leave as-is. |
| `/honeymoon`, `/luxury`, `/andaman` | `packagesService.byTheme()`/`byRegion()`, `reviewsService`, `faqsService` (mock) | `GET /api/website/packages` (partial) | `WebsitePackageSummaryDTO[]` | `website` | Theme-based filtering (`byTheme("honeymoon")`) has no backend equivalent (see `/packages` row above). Reviews/FAQs sections have no full backend source per rows above. |
| `/sitemap.ts` | Mock data (`destinationsMock`, package/guide/experience mocks) | `GET /api/website/destinations`, `GET /api/website/packages` (paginated, would need to page through all results) | `WebsiteDestinationSummaryDTO[]`, `WebsitePackageSummaryDTO[]` | `website` | Straightforward once repointed — paginate through both list endpoints to build the sitemap. Guides/experiences/ferry routes in the sitemap have no backend source (see above). |

## Per-endpoint mapping

For every Website API endpoint: current frontend consumer → missing frontend consumer → unused endpoints → missing endpoints.

| Endpoint | Current frontend consumer | Missing frontend consumer (needs building) |
|---|---|---|
| `GET /api/website/home` | None (frontend has no code calling this URL today) | `app/page.tsx` needs its service layer repointed |
| `GET /api/website/packages` | None | `/packages/*` pages' services |
| `GET /api/website/package/[slug]` | None | `/tours/[slug]`'s service |
| `GET /api/website/destinations` | None | Any destination-listing view (currently `lib/hierarchy` owns this instead — see docs/27) |
| `GET /api/website/destination/[slug]` | None | Same caveat — `lib/hierarchy` currently owns destination detail |
| `GET /api/website/search` | None | `/search`'s service (partial — packages only) |
| `GET /api/website/navigation` | None | `Navbar`/`MegaMenu`/`Footer` currently use `lib/hierarchy`'s `getDestinationTree()` instead |

**Unused endpoints**: all 7 — none of the Website API is currently called by the frontend in any form.

**Missing endpoints** (referenced by the frontend, absent from Travel OS): Ferry (routes/schedules/availability/search), Flights (airports/search), Guides (list/detail/reels/andamanSpotlight), Experiences (list/detail), Reviews (list/forTour/trustStats), FAQ (standalone list), Calculator (estimate — low priority, see above), Enquiries (submit), Customer Bookings (row-scoped list/detail), Customer Quotes (row-scoped list/detail).

## Problems

The frontend and backend overlap on exactly one thing both sides call "the same": Package and Destination summary/detail data. Even there, the field sets differ (ratings, badges, inclusions/exclusions, themes exist on the frontend model with no backend source). Everything else the frontend renders (Ferry, Flights, Guides, Experiences, Reviews, FAQs, Calculator, Enquiries, Customer Bookings) is either mock-only or pointed at a different, legacy backend that this analysis has no visibility into.

## Missing APIs / Missing DTOs / Missing Components

Covered in full above and in docs/29; no components are missing (see docs/25).

## Data Flow / Authentication Flow / SEO Flow / Image Flow / Performance Opportunities / Reusable Components / Migration Strategy / Risk Assessment

Covered in docs/27.
