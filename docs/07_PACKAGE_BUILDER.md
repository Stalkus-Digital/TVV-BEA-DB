# 07 — Package Builder (Package Engine)

**Status:** Sprint 6 — implemented under `src/modules/package/`, the largest bounded context so far (60 module files + 24 route files). Isolated from Supplier/TripJack (zero imports, grep-verified); a genuine consumer of Inventory and Destination (the approved direction per docs/02), limited to exactly four files.

## Package Types

Not five data models — one component-resolution model, same principle as the original root-level `PACKAGE_BUILDER.md` draft, generalized: `PackageItem.resolutionMode` is `PINNED` (a specific `inventoryItemId`/`destinationReferenceId`, price locked in) or `SLOT` (criteria only, resolved later). `Package.sourceType` (`MANUAL | DYNAMIC | AI_GENERATED | SUPPLIER | MIXED`) is a derived label set by whichever Builder constructed it — Manual/AI/Supplier default every item to `PINNED`, Dynamic forces every item to `SLOT`, Mixed requires the caller to specify per item. Five builder *classes* (`builders/`), one *data* model.

**Naming note, same decision as every prior sprint**: "Ferry" and "Transfer" were listed separately again — kept as one `TRANSFER` `PackageItemKind`, matching Inventory's `TRANSFER(mode=FERRY|ROAD)`.

## Itinerary Model

`PackageDay` (day-level: number, title, description, an optional anchor `destinationId`) → `PackageItem` (fine-grained: kind, time, notes, images, resolution mode, reference). Both are their own repositories, not embedded arrays — a package can have many days each with many items, the same reasoning that kept Inventory's items in a repository rather than embedded. **"Generate Itinerary"** (`itinerary/itinerary-generator.ts`) is deterministic templated scaffolding ("Day 1: Arrival...", "Day N: Departure..."), explicitly not an AI call — Sprint 10 is where a real generator produces the same output shape.

## Version History

`publish()` assembles the full package (days+items+pricing+rules via one `assemble()` read-model) and freezes it into an immutable `PackageVersion`, then sets `Package.status = PUBLISHED` and `currentVersionId`. `preview()` is the exact same assembly with no side effect. Verified live: publish created version 1, `currentVersionId` was set correctly.

## Pricing

`pricing/pricing-calculator.ts` — pure functions, no I/O, computing base → occupancy/group override → seasonal adjustment → markup → discount → child/infant additions → tax, in that order. Every rule type requested is supported (base, markup, discount, tax, season, occupancy, child, infant, group).

**Bug found and fixed during verification, not left in**: the calculator originally pushed an informational "Base (per adult)" line into the same array that gets summed for `total` — since "Adults × N" already incorporated that base price, the total double-counted it (a ₹45,000 base showed as ₹148,950 instead of the correct ₹103,950 for 2 adults + 10% markup + 5% tax). Fixed by not pushing the informational line at all; re-verified live afterward.

## Rules

`rules/rule-evaluator.ts` — pure functions checking pax count against min/max and booking date against the booking window. Verified live: a 1-pax request against a `minPax: 2` rule correctly returned `{valid: false, violations: [...]}`.

## Duplicate Inventory Validation

`PackageItemService` checks, on every `PINNED` item add, whether the same `inventoryItemId` already appears anywhere else in the package (across all days) — verified live: adding the same hotel to a second day was correctly rejected with `CONFLICT`.

## Reference Inventory IDs — verified, not assumed

`PackageItem.inventoryItemId`/`destinationReferenceId` are plain strings; nothing in this module holds a copy of Inventory or Destination data. Existence is checked by calling `getInventoryService().getById()` / `getDestinationService().getById()` at item-add time — the approved cross-module direction (docs/02: "Package Builder ↓ Inventory Service" / "↓ Destination Engine"). Isolation from Supplier/TripJack: `grep -rn "modules/supplier" src/modules/package/` matches only a comment.

## Templates

`PackageTemplate` is not a separate repository — `Package.isTemplate: boolean` + `sourceTemplateId` for lineage. A distinct entity would have duplicated `Package` itself; flagged as a scope decision in the type file, not silently assumed.

## API

CRUD, `clone`/`duplicate` (duplicate = clone with no overrides — both verified live, producing auto-disambiguated code/slug), `publish`, `archive`, version list + rollback, `preview`, `generate-itinerary`, plus the 5 builder endpoints (`/api/packages/builders/{manual,dynamic,ai,supplier,mixed}`) and full sub-resource CRUD for days/items/pricing/rules/availability. 24 routes total, all through the shared `ApiResponse` envelope.

## Known gap, flagged not hidden

`Package.aiGeneratedFromId` exists on the type (reserved for Sprint 10's AI Engine) but nothing in this sprint ever sets it to a non-null value — even `AIPackageBuilder` accepts an `aiGenerationReferenceId` in its input but the underlying `PackageService.create()` doesn't yet persist it (same reserved-but-inert pattern as Destination's `guideReferenceIds`). Wiring this through is trivial when Sprint 10 needs it.

## Remaining TODOs before Booking Engine

1. `PackageItem` has no update method, only add/remove (matches Destination's FAQ/gallery precedent) — revisit if in-place editing turns out to matter.
2. `aiGeneratedFromId` plumbing (above).
3. Prisma/PostgreSQL still not installed — all seven repositories remain in-memory.
4. No decision yet on how Booking Engine will consume a published `PackageVersion.snapshot` — the shape exists (`PackagePreview`) but nothing reads it yet.
