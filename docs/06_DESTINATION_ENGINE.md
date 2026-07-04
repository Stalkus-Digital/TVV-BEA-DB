# 06 — Destination Engine

**Status:** Sprint 5 — implemented under `src/modules/destination/`, isolated from Inventory and Supplier (zero imports from either, verified). Provider-First strategy: this module has no dependency on any external supplier or on TripJack.

## Destination Hierarchy

Two hierarchies exist and are deliberately kept separate:

1. **Geography hierarchy** — `Country → State → City`, with `Region` as a flexible, non-administrative grouping that may span states or omit a country, and `Airport` belonging to a `City`. Plain ID references (`State.countryId`, `City.stateId`, etc.), no ORM relations, matching every other module's persistence pattern (in-memory today, Prisma-shaped later).
2. **Destination hierarchy** — `Destination.parentDestinationId` (self-referencing, nullable). Verified end-to-end: created "Andaman Islands" as a parent, "Havelock Island" and "Neil Island" as children; `GET /:id/children` returned both, `GET /:id/breadcrumbs` returned `[Andaman Islands, Havelock Island]` root-first for the child. Cycle prevention (`assertNoCycle`) walks the parent chain on create, capped at 20 levels, rejecting a `parentDestinationId` that would make a destination its own ancestor.

**Breadcrumbs are not a separate data model** — `getBreadcrumbs()` is a projection of the same parent-walk `getChildren`'s hierarchy uses, returning `{id, name, slug}` triples.

**Nearby** has no geo-distance math yet (`latitude`/`longitude` fields exist on `Destination` for a future upgrade) — today it's a heuristic: siblings under the same parent if one exists, otherwise other destinations in the same city, then state, then country. Verified: Havelock's nearby list correctly returned Neil Island (its sibling) and excluded itself.

## Destination as Anchor Entity

`Destination` (`types/destination.ts`) is deliberately the *only* place hotel/flight/activity data could theoretically be duplicated — and it holds none. No `hotels: []`, no `flights: []`, nothing inventory-shaped. "Do NOT duplicate Inventory. Reference Inventory IDs only" is satisfied structurally: this module has zero imports from `src/modules/inventory` (grep-verified), so there is nothing here that *could* duplicate Inventory's data. The relationship that already exists — `InventoryItem.destinationId: string | null` (built in Sprint 2) — is the only link, and it points *from* Inventory *to* Destination, not the reverse; this sprint added no new coupling in either direction, per the explicit "do not change existing modules" instruction.

Categories (`DestinationCategory`), status lifecycle (`DRAFT → ACTIVE → ARCHIVED`, same three-state shape as Inventory's), and slugs (unique, checked on create via `ConflictError`) round out the entity.

## Destination Content Model

- **SEO** (`DestinationSeo`) — embedded, not a separate table/repository: `metaTitle`, `metaDescription`, `canonicalUrl`, `ogImageUrl`, `focusKeyword`.
- **Gallery** (`DestinationGalleryImage[]`) and **FAQ** (`DestinationFaqEntry[]`) — embedded arrays on `Destination`, managed via dedicated service methods (`addFaq`/`removeFaq`/`addGalleryImage`/`removeGalleryImage`) that read-modify-write through the repository, rather than separate top-level repositories. A scope decision: full CRUD is still possible (add/remove individual entries without touching the rest of the record), just without the overhead of two more repository classes for what are always accessed as part of their parent destination. Verified end-to-end via `curl`.
- **Guides** — `guideReferenceIds: string[]`, reference-only. CMS doesn't exist yet (Sprint 9); this is a reserved slot, not an integration.
- **Featured** — `Destination.isFeatured: boolean` + `listFeatured()`. Verified: PATCH to set `isFeatured: true`, then `GET /featured` returned it.

## Consolidation decisions (flagged, not silent)

`Country`/`State`/`Region`/`City`/`Airport` — five distinct entities in the brief — were consolidated into one types file, one validation file, one repository file, and one service (`GeographyService`), rather than five parallel sets of files each. They're structurally near-identical reference data (id, name, one or two parent FKs, timestamps); Inventory's per-kind file separation was justified by genuinely different domain shapes (hotel vs. flight vs. visa), which doesn't apply here. Each entity still has its own typed interface, validator, and `BaseRepository`-conformant repository class — the consolidation is file-count only, not a loss of type safety or testability.

## APIs exposed

```
GET/POST   /api/destinations                          list (filters: countryId, stateId, cityId, categoryId, parentDestinationId, featured) / create
GET        /api/destinations/featured                  featured list
GET/POST   /api/destinations/categories                 list / create categories
GET        /api/destinations/slug/:slug                  lookup by slug
GET/PATCH/DELETE /api/destinations/:id                     detail / update / archive
GET        /api/destinations/:id/breadcrumbs               root-to-leaf trail
GET        /api/destinations/:id/children                    direct children
GET        /api/destinations/:id/nearby                       heuristic nearby list
POST       /api/destinations/:id/faqs                          add FAQ entry
DELETE     /api/destinations/:id/faqs/:faqId                     remove FAQ entry
POST       /api/destinations/:id/gallery                          add gallery image
DELETE     /api/destinations/:id/gallery/:imageId                   remove gallery image

GET/POST   /api/geography/countries
GET/POST   /api/geography/states?countryId=
GET/POST   /api/geography/regions
GET/POST   /api/geography/cities?countryId=&stateId=
GET/POST   /api/geography/airports?cityId=
```

All 17 routes return the shared `ApiResponse` envelope. `destination` is registered with the shared `healthCheckRegistry` (trivially healthy — no external dependency to be unhealthy about) — `GET /api/health` now reports `self` + `destination` + the three suppliers, verified live.

## Remaining TODOs before Package Builder

1. Latitude/longitude-based real distance calculation for `getNearby()`, replacing the sibling/city/state heuristic.
2. A real decision on whether Package Builder reads `Destination` directly or through a service accessor pattern like Inventory's — not yet wired either way.
3. Prisma-backed repositories once the database phase starts — every repository here is in-memory, same as Inventory/Supplier.
4. Guide reference integration once CMS (Sprint 9) exists — `guideReferenceIds` is currently a dead field with nothing to reference.
5. `ACTIVE` status transition has no dedicated service method yet (same gap noted for Inventory) — only `DRAFT` (create) and `ARCHIVED` (archive) are wired.
