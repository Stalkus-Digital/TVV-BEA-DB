# 14 — Quote Engine

**Status:** implemented under `src/modules/quote/`. Not part of the original numbered `00`–`13` series (that series was fixed before this module was requested); numbered `14` to continue the sequence rather than retrofit an existing file. Resolves the ambiguity `CLAUDE.md`'s Business Objects table had flagged since Quote was first named: a Quote is **its own bounded-context entity**, not a Package draft state and not a Booking pre-status.

## What a Quote Is

A priced-but-not-yet-booked itinerary shared with a customer before commitment. It references a Destination (required) and, optionally, a source Package, but is itself a standalone entity with its own status lifecycle, versioning, pricing adjustments, and line items — line items may point at a Package, an Inventory item, or be entirely custom text.

## Status Lifecycle

```
DRAFT --(send)--> SENT --(approve)--> APPROVED --(convert)--> CONVERTED
  \-------------------(approve)-----------/  \--(reject)--> REJECTED
```

- `create()` — DRAFT, quote number auto-generated (`QT-000001`, sequential), `validFrom`/`validTo` default to now → +14 days if not supplied.
- `update()` — allowed only in DRAFT or SENT; blocked (`ConflictError`) once APPROVED/REJECTED/CONVERTED.
- `send()` — DRAFT or SENT → SENT. Freezes the current item list + computed pricing into an immutable `QuoteVersion` snapshot (same freeze principle as `PackageVersion`/`publish()`).
- `approve()` / `reject()` — allowed from DRAFT or SENT; sets `approvedAt` or `rejectedAt` + `rejectionReason`. Once decided, items can no longer be added/updated/removed (verified live — a `POST .../items` against an APPROVED quote returns `CONFLICT`).
- `duplicate()` — allowed from any status; copies Quote + Items (including adjustments — see note below) into a fresh DRAFT with a new quote number.
- `convertToBooking()` — requires APPROVED (verified live — attempting it from SENT returns `CONFLICT`); transitions to CONVERTED and returns a `BookingHandoffPayload` (traveler details, items, computed pricing). Terminal — re-converting a CONVERTED quote is rejected.

## Consumption of Package, Destination, Inventory

Exclusively through public service accessors, never a repository (grep-verified: `src/modules/quote/` has zero imports from `src/modules/supplier`, `src/modules/website`, or any booking module — none exists yet):

- `getDestinationService().getById()` — required on create/update, and to resolve the destination summary in PDF data.
- `getPackageService().getById()` — validated when a quote or a quote item references a `packageId`.
- `getInventoryService().getById()` — validated when a quote item references an `inventoryItemId`.

Quote item titles/prices are **snapshotted at add-time**, not resolved live on every read — a commercial document must stay stable even if the referenced catalog record changes later (same reasoning as `PackageVersion`'s freeze, applied per-line instead of per-document).

## Pricing Adjustments (Markup/Discount)

Unlike Package (where markup/discount live on a separate `PackagePricing` entity), a Quote's `adjustments: QuoteAdjustment[]` live directly on the Quote — a quote has no separate reusable pricing record to point at. Each adjustment has a `kind` (MARKUP/DISCOUNT) and `type` (PERCENTAGE/FLAT). `pricing/quote-pricing-calculator.ts` is a pure function computing `itemsSubtotal → + each adjustment in order → total`; every line pushed into `lineItems` counts toward `total` (no separate "informational" line — the exact class of bug that double-counted Package's base price earlier this project is structurally avoided here).

**Duplicate() deliberately copies adjustments**, unlike Package's `clone()` (which drops pricing on purpose, calling it "the clone's own commercial decision") — a Quote's adjustments are the quote's own commercial state, not a separate entity, so dropping them on duplicate wouldn't produce a duplicate.

## Versioning

`QuoteVersion` — immutable snapshot (`{quote, items, pricing}`) created every time `send()` runs, numbered sequentially per quote (mirrors `PackageVersion`). `GET /api/quotes/:id/versions` lists them newest-first. No rollback endpoint — not requested this sprint and, unlike Package (where rollback just repoints `currentVersionId`), a meaningful Quote rollback would need to also restore the item list, which is a larger decision left open rather than half-built.

## PDF-Ready Data Model

`GET /api/quotes/:id/pdf` returns `QuotePdfData` — a data shape only, **no PDF-rendering library is installed or implied** (same "interface/data only" discipline as Website's cache port). `pdf/quote-pdf-builder.ts` is a pure function (`buildQuotePdfData`) assembling quote header, destination summary, traveler details, itemized lines with `lineTotal`, the pricing breakdown, and `isExpired` (computed from `validTo` vs. now — no background job invented to auto-flip a stored status).

## Conversion to a Future Booking

`convertToBooking()` returns a `BookingHandoffPayload`, not a real Booking — no Booking module exists yet (Sprint 8 in the original roadmap, still unbuilt). `Quote.convertedBookingId` is **reserved but inert**: it exists on the type, stays `null` forever from this module's side, and only a real Booking Engine (once built) could ever populate it by writing through its own path — this module has no import from a booking module to fabricate a value itself. Same pattern as `Package.aiGeneratedFromId`.

## Explicitly Not Built (per this sprint's exclusions)

- No payment integration.
- No TripJack/Ferry supplier integration.
- No real Booking creation — see Conversion section above.

## Admin API Surface

```
GET    /api/quotes                       List (filter: status, destinationId, packageId)
POST   /api/quotes                       Create
GET    /api/quotes/:id                   Get
PATCH  /api/quotes/:id                   Update (DRAFT/SENT only)
POST   /api/quotes/:id/send              DRAFT/SENT → SENT, creates a version
POST   /api/quotes/:id/approve           DRAFT/SENT → APPROVED
POST   /api/quotes/:id/reject            DRAFT/SENT → REJECTED (body: { reason })
POST   /api/quotes/:id/duplicate         Clone into a new DRAFT quote
POST   /api/quotes/:id/convert           APPROVED → CONVERTED, returns BookingHandoffPayload
GET    /api/quotes/:id/pricing           Computed QuotePriceResult
GET    /api/quotes/:id/pdf               QuotePdfData
GET    /api/quotes/:id/versions          List QuoteVersion snapshots, newest first
GET    /api/quotes/:id/items             List line items
POST   /api/quotes/:id/items             Add a line item (packageId XOR inventoryItemId XOR neither/custom)
PATCH  /api/quotes/:id/items/:itemId     Update a line item
DELETE /api/quotes/:id/items/:itemId     Remove a line item
```

## Live Verification

Built a full prerequisite chain (country → destination → hotel inventory item → package), then exercised the complete lifecycle via `curl`: created a quote with a lead traveler, 2 adults + 1 child, a 10% markup and a flat ₹1,500 discount; added a PACKAGE item (₹25,000 × 2), an INVENTORY item (₹6,000 × 1), and a CUSTOM item (₹2,000 × 1) — computed pricing correctly returned `itemsSubtotal: 58000`, markup `+5800`, discount `-1500`, `total: 62300`. Sent the quote (version 1 created), confirmed `convert` correctly rejected from SENT (`must be APPROVED`), approved it, confirmed item mutation was then correctly rejected (`CONFLICT`), converted it (returned the handoff payload, `convertedBookingId` stayed `null`), confirmed re-conversion was rejected. Duplicated the converted quote into a new DRAFT (`QT-000002`) with adjustments and items copied intact, then updated and deleted an item on the duplicate to confirm DRAFT quotes remain fully editable. Verified a reject flow independently and a 404 on an unknown quote ID. `tsc --noEmit` and `next build` both clean throughout (12 new routes, 47 routes total, every pre-existing route unchanged). `quote: healthy` registered in `GET /api/health` alongside `self`, `destination`, `package`, `website`, and the three `supplier.*` checks.
