# 09 — Website API

**Status:** Sprint 7 — implemented under `src/modules/website/`, a dedicated Backend-for-Frontend module. This resolves the open gap this file previously flagged: the public-facing facade is its own bounded context (`src/modules/website/`), not a thin `src/app/api/v1/public/*` layer with no module behind it — routes under `src/app/api/website/*` are thin wrappers calling this module's handlers, same pattern as every other module in this project. Not versioned (`/api/website/*`, not `/api/v1/public/*`) — that decision is still open, noted below.

## Endpoint List

```
GET /api/website/home                    Homepage: hero banner, featured/latest packages, featured/popular destinations, quick links, SEO
GET /api/website/packages                 List published packages (filter: destinationSlug)
GET /api/website/package/:slug             Full package detail: itinerary, pricing, gallery, FAQs, related packages, destination summary, breadcrumbs, SEO
GET /api/website/destinations               List destinations
GET /api/website/destination/:slug           Full destination detail: gallery, FAQs, guides (empty — no CMS), featured packages, nearby destinations, breadcrumbs, SEO
GET /api/website/search                       Keyword + destination + duration range + price range + category + package-type filtering over published packages
GET /api/website/navigation                     Menu, footer, quick links, popular destinations
```

Only `PUBLISHED` packages and (implicitly, via Destination Engine's own status field) active destinations are ever returned — draft/archived records used internally by ops never reach this surface.

## Never Expose Internal Entities — verified, not assumed

Every response is a `dto/website-*.dto.ts` shape, never the internal `Package`/`Destination`/`PackagePreview` entity. Confirmed by inspection: `WebsitePackageSummaryDTO`/`WebsitePackageDetailDTO` have no `currentVersionId`, `sourceTemplateId`, `aiGeneratedFromId`, `isTemplate`, or raw pricing markup/discount/tax rules — fields a customer-facing site has no business seeing. `transformers/` is the only place internal entities are read, and their output is always a DTO.

## Do Not Expose Repositories — verified, not assumed

`src/modules/website/` owns zero repositories (no `repositories/` folder exists in this module at all — it's a pure aggregator). Every read goes through `getPackageService()`, `getDestinationService()`, `getPackagePricingService()` — Package's and Destination's public service accessors — grep-verified to be the only way this module touches their data.

## Bug found and fixed during verification, not left in

The homepage's `featuredPackages`/`latestPackages` and the search results initially called the bare transformer directly with `destination: null, fromPrice: null` (to avoid resolving them), which meant every package card on the homepage and in search results showed an empty destination name and no price — a real usability gap, not just cosmetic. Fixed by exposing `WebsitePackageService.toSummaryDTO()` publicly and having `HomepageService`/`WebsiteSearchService` inject and reuse it, so every package card anywhere on the site resolves destination + live price consistently. Reproduced via `curl` before the fix (`destinationName: ""`, `fromPrice: null`) and re-verified after (`destinationName: "Havelock Island"`, `fromPrice: 90000`).

## Authentication

Not implemented this sprint — no auth exists anywhere in this codebase yet (per `docs/01_CURRENT_SYSTEM_AUDIT.md`, still true). All Website API routes are open reads today. When the existing public website is actually wired to this API, whether it needs an API-key/service-to-service auth layer (as sketched generically in the earlier root-level `WEBSITE_API.md`) is a decision for that integration sprint, not assumed here.

## Caching

**Interfaces only, per this sprint's explicit instruction** — `cache/website-cache.port.ts` defines a `WebsiteCache` port (`get`/`set`/`invalidate`/`invalidateByTag`); no concrete implementation exists, no service in this module depends on or injects one. "No Redis implementation yet" was taken literally: there is no in-memory fallback implementation either, unlike the shared foundation's logger/DI (which got working hand-rolled implementations behind their interfaces) — caching here is reserved-but-inert, same pattern as `Package.aiGeneratedFromId` and `Destination.guideReferenceIds`.

## SEO

- **Canonical URLs**: `seo/seo-builder.ts` builds `{WEBSITE_BASE_URL}{path}` — `WEBSITE_BASE_URL` read via `WebsiteConfigService` (same `validateEnv` pattern as every other module's config), empty default, so an unset base URL produces a relative path rather than a broken absolute one.
- **Meta tags / Open Graph**: `buildSeoDTO()` — falls back to entity title + a generated description when no `Package.seo`/`Destination.seo` override exists, so the DTO is never empty even for content ops hasn't filled in yet.
- **JSON-LD placeholders**: `seo/json-ld-builder.ts` — `buildBreadcrumbJsonLd()` and `buildTouristTripJsonLd()`, explicitly flagged as provisional shapes, not schema.org-validated.
- **Breadcrumb Schema**: `WebsiteBreadcrumbDTO[]` on both package and destination detail responses, plus the JSON-LD builder above for the structured-data version.

## Versioning

Not addressed this sprint — routes are unversioned (`/api/website/*`). The root-level `WEBSITE_API.md`'s `/api/v1/public/*` versioning proposal (URL-path versioning, additive-within-a-version, deprecation windows) is still valid *source material*, per `CLAUDE.md`'s Documentation Structure note, but adopting it is a decision for whichever sprint actually connects the existing external website — not assumed here.

## Remaining TODOs before Booking Engine

1. `Package` has no top-level `description` field — `WebsitePackageDetailDTO` has none either, honestly, rather than fabricating one from day descriptions. Package Engine would need this added (an additive change, not a redesign) for a real detail page.
2. "Popular Destinations" is a provisional proxy (same source as featured, no real ranking) — needs booking-count analytics that don't exist before Booking Engine.
3. Hero banner and navigation menu/footer are static/config-driven placeholders — real authoring needs CMS (Sprint 9 in the roadmap, unrelated numbering coincidence with this doc's own "09").
4. `cache/` interfaces are unused — no service benefits from caching yet; wiring a real implementation is additive when needed.
5. Price-range search filtering is an in-memory per-candidate pricing lookup (N+1) — fine at current scale, revisit once real data volume or the dedicated Search Engine (still unscheduled per `CLAUDE.md`) exists.
