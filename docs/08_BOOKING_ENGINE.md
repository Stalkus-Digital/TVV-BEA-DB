# 08 — Booking Engine

**Status:** Sprint 9 — implemented under `src/modules/booking/` (60 module files, 16 route files). Created **only** from an APPROVED Quote — never assembled from a Package directly, never built up manually. Consumes an immutable Quote Version; never modifies Packages or Quotes (see "Touching Quote" below for exactly how that boundary is enforced).

## Booking Lifecycle

```
DRAFT --confirm--> CONFIRMED --payment--> PARTIALLY_PAID --payment--> PAID --ticket--> TICKETED --complete--> COMPLETED
  \                    \                        \                      \                  /
   \--cancel-------------\--cancel----------------\--cancel--------------\--cancel--------/
                                                                                       CANCELLED
```

`status/booking-status-machine.ts` is a pure transition table (`BOOKING_STATUS_TRANSITIONS`), checked by every service method before writing — CANCELLED is reachable from any non-terminal state (DRAFT/CONFIRMED/PARTIALLY_PAID/PAID/TICKETED), never from COMPLETED or CANCELLED itself.

`confirm`/`cancel` are the two explicitly requested transition endpoints. `ticket` and `complete` are **added, not in the sprint's literal API list** — TICKETED and COMPLETED are stated lifecycle statuses with no other endpoint that could ever reach them, so omitting dedicated actions would leave two of the seven statuses permanently unreachable.

## Create Booking From — Approved Quote Only

`BookingService.createFromQuote()` is the **only** entry point that creates a Booking. It calls `getQuoteService().getById(quoteId)` (read) then `getQuoteService().convertToBooking(quoteId)` — Quote's own public service method, which itself enforces "must be APPROVED" and returns `CONFLICT` for every other status (verified live: attempting from SENT returned exactly that message). Booking Engine does not duplicate this check; it reuses Quote's own tested guard.

**Touching Quote — how "never modify Quotes" is actually satisfied**: this module holds zero imports of a Quote repository and writes zero Quote fields directly. The one call it makes, `convertToBooking()`, is Quote's own sanctioned state transition (it flips Quote's status to CONVERTED inside Quote's own bounded context) — the same public-service-boundary discipline every other module edge in this project already follows (Package → Inventory/Destination, Quote → Package/Destination/Inventory: always through a public accessor, never a repository). The alternative — never calling it, leaving the Quote perpetually APPROVED — would allow the same Quote to be converted into multiple Bookings with no record of it (verified live: attempting `POST /api/bookings` again against the same now-CONVERTED quote correctly returned `CONFLICT`, proving double-booking is blocked).

Booking freezes, at creation time: `sourceQuoteId`/`sourceQuoteNumber`/`sourceQuoteVersionId` (Quote's `currentVersionId` at the moment of conversion — the immutable `QuoteVersion` snapshot), `destinationId`/`packageId`, and `currency`/`totalAmount` from the handoff payload's computed pricing. `BookingItem` records are a frozen 1:1 copy of the Quote's items (same "commercial document must stay stable" reasoning `QuoteItem` itself already applies) — there is no API path to add/edit/remove a `BookingItem` directly; the source Quote already decided the line items.

Only the **lead traveller** is seeded automatically, from the Quote's `travelerDetails.leadTraveler` — Quote only ever tracked headcounts (adults/children/infants), never individual identities system-wide, so the remaining travellers must be added one at a time via `POST /api/bookings/:id/travellers`.

## Domain Objects

`Booking`, `BookingItem`, `Traveller`, `PassengerDocument`, `BookingPayment`, `BookingInvoice`, `BookingVoucher`, `BookingStatusHistory`, `BookingNote`, `BookingTimeline` — all ten named in the sprint brief, each with its own repository (`repositories/`, 10 files, same hand-rolled in-memory-per-module pattern as every prior sprint).

- **Traveller**: `type` (ADULT/CHILD/INFANT), passport/visa/DOB/gender/nationality/emergency contact, `isLeadTraveller`. **Duplicate prevention** (verified live): a new traveller is rejected with `CONFLICT` if its passport number matches an existing traveller on the booking, or if its `(fullName, dateOfBirth)` pair matches one — the two realistic ways the same person gets entered twice. No update endpoint, only add/remove — same precedent as `PackageItem` (`docs/07`: "no update method, only add/remove").
- **PassengerDocument**: Passport/Visa/Ticket/Insurance — metadata records only (`fileUrl` stays null; no blob storage exists anywhere in this project yet). Voucher and Invoice are **not** `DocumentKind` values — they're first-class structured entities with their own generated data model (see below), not a metadata+file record like a passport scan.
- **BookingStatusHistory** vs. **BookingTimeline**: intentionally distinct, both explicitly named as separate domain objects. StatusHistory is a generic `fromStatus → toStatus` audit trail recorded on every transition. Timeline is the curated, named business-event log (`CREATED`/`APPROVED`/`CONFIRMED`/`PAID`/`TICKETED`/`CANCELLED`/`COMPLETED`) — `CONFIRMED` was added beyond the brief's literal six-event list, since it's a real lifecycle transition with its own API action; omitting it while logging every other transition would have been an inconsistent gap, not a faithful reading.

## Payments — No Gateway

`BookingPayment.status` (PENDING/PARTIAL/PAID/REFUNDED/FAILED) is per-record; `Booking.paymentStatus` is the aggregate, computed by the pure `payments/payment-calculator.ts` from every PAID-status record (minus REFUNDED) against `Booking.totalAmount`. Recording a payment is manual (`method`/`reference` are free-text — "Bank Transfer", "UPI" — never a gateway transaction), and only accepted once the booking is CONFIRMED/PARTIALLY_PAID/PAID (verified live: attempting on a DRAFT booking returned `CONFLICT`). A recorded payment automatically bumps `Booking.status` through the status machine (CONFIRMED → PARTIALLY_PAID on a partial amount, → PAID once the total is met) — verified live end-to-end: a ₹20,000 payment against a ₹65,000 total moved the booking to `PARTIALLY_PAID`; the remaining ₹45,000 moved it to `PAID`, unlocking `ticket()`.

**`POST /api/bookings/:id/payments` was added, not in the sprint's literal 8-route list** — without it, `BookingPayment` (an explicitly named domain object) and "Payment validation" (an explicitly required validation category) would have been unreachable dead code.

## Supplier — Placeholder Only

`SupplierBookingReference` (`supplierCode`/`supplierBookingId`/`status: NOT_REQUIRED|PENDING|CONFIRMED|FAILED`) sits on every `BookingItem`, always `null` by construction. `supplierCode` is a plain string, never a live lookup into `src/modules/supplier` — grep-verified zero real imports from that module anywhere in `src/modules/booking/` (only explanatory comments mention it). No TripJack or Ferry call exists anywhere in this sprint.

## Voucher and Invoice

Both are **data models only** — no PDF-rendering library is installed or implied (same discipline as Quote's PDF data model). Both are pure builder functions (`voucher/voucher-builder.ts`, `documents/invoice-builder.ts`) wrapped by a thin persisting service, invoked via `POST /api/bookings/:id/voucher` / `.../invoice` — each call creates and stores a new sequentially-numbered record (`VCH-000001`, `INV-000001`), so a booking's generation history survives. Voucher pulls the destination name live via `getDestinationService().getById()`; Invoice's `billTo` falls back to a placeholder if no traveller has been added yet, rather than throwing. Verified live: generated both against a fully paid, ticketed booking — invoice correctly showed `amountDue: 0`.

## API Surface

Explicitly requested (8):
```
GET    /api/bookings
GET    /api/bookings/:id
POST   /api/bookings                     Create from an APPROVED quote only
PATCH  /api/bookings/:id                 internalNotes only
POST   /api/bookings/:id/confirm
POST   /api/bookings/:id/cancel
POST   /api/bookings/:id/voucher
POST   /api/bookings/:id/invoice
```

Added, to make the stated domain objects and lifecycle actually reachable (flagged, not silently expanded):
```
POST   /api/bookings/:id/ticket          PAID → TICKETED (no other path to this status)
POST   /api/bookings/:id/complete        TICKETED → COMPLETED (no other path to this status)
GET    /api/bookings/:id/items           Read-only — items are frozen at creation
GET    /api/bookings/:id/travellers
POST   /api/bookings/:id/travellers
DELETE /api/bookings/:id/travellers/:travellerId
GET    /api/bookings/:id/documents
POST   /api/bookings/:id/documents
GET    /api/bookings/:id/payments
POST   /api/bookings/:id/payments        Otherwise BookingPayment/"Payment validation" would be unreachable
GET    /api/bookings/:id/notes
POST   /api/bookings/:id/notes
GET    /api/bookings/:id/timeline
GET    /api/bookings/:id/status-history
```

## Verified Live

Full chain: country → destination → hotel (Inventory) → package → quote (sent, approved) → booking. Confirmed booking creation correctly rejected against a SENT (not APPROVED) quote, then succeeded once approved — quote flipped to CONVERTED, `convertedBookingId` stayed `null` (still reserved-but-inert; only a real write-back would set it, and this module doesn't perform one). Confirmed items and lead traveller were frozen correctly from the quote's data, confirmed double-booking from the same converted quote was blocked, confirmed payment-before-CONFIRMED was blocked, confirmed a partial then full payment correctly bumped status PARTIALLY_PAID → PAID with the right `amountPaid`, confirmed ticket/complete worked once PAID and that CANCELLED was correctly blocked once COMPLETED, confirmed a separate DRAFT booking could be cancelled directly, confirmed duplicate-traveller prevention on both passport-number and name+DOB, confirmed voucher/invoice generation, notes, and passenger-document add. `tsc --noEmit` and `next build` both clean (16 new routes, 63 total, every pre-existing route unchanged — file counts for inventory/supplier/destination/package/website/quote all match their prior-sprint totals exactly). `booking: healthy` registered in `GET /api/health`.

## Explicitly Not Implemented

TripJack, Ferry, a real payment gateway, AI, CRM — per this sprint's exclusions.

## Remaining TODOs

1. `Quote.convertedBookingId` stays permanently `null` — no write-back path exists from Booking to Quote (would require either a Quote import of Booking, or Booking writing to Quote's repository directly, both of which this sprint's "never modify Quotes" rule rules out). Revisit only if a future sprint explicitly asks for it.
2. `PassengerDocument.fileUrl` is always `null` — no blob storage exists anywhere in this project yet (`docs/02`'s Persistence Layer still lists it as unimplemented).
3. `BookingVoucher.validity` is always `null` — no dedicated "travel dates" field was requested anywhere in the domain; the Quote's own `validFrom`/`validTo` describe quote validity, not travel dates, so it wasn't reused as a stand-in.
4. Prisma/PostgreSQL still not installed — all ten repositories remain in-memory.
