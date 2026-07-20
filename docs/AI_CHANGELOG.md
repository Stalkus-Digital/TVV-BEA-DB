# AI Changelog

## 2026-07-20

PP-002C-6 Email Communication — Completed (closes PP-002C)

Scope

- Email only — no SMS / WhatsApp / Push / generic notification framework

Booking emails (async, non-blocking)

- Booking Created / Confirmed / Cancelled
- Payment Received / Refund Processed
- Invoice Generated / Voucher Generated
- No mail for traveller edits, notes, or internal-only ops

Templates (branded, provider-independent)

- Booking Created, Booking Confirmation, Booking Cancellation
- Payment Confirmation, Refund Confirmation
- Invoice Ready, Voucher Ready

Delivery

- BookingEmailService reuses EmailService (SMTP vault)
- enqueueBookingEmail fire-and-forget — booking mutations never fail on SMTP
- EmailDispatch table for dedupe + status (QUEUED/SENT/FAILED)
- Opt-out via customer profile preferences when present
- Admin retry: POST /api/bookings/[id]/emails/retry (EMAIL_RETRIED)

Audit / timeline

- EMAIL_SENT / EMAIL_FAILED / EMAIL_RETRIED (actorUserId, bookingId, templateId)
- Booking Activity Timeline category: Emails

Migration

- 20260720170000_pp002c6_notification_dispatches → email_dispatches

Build verified with TypeScript checks and production build.

---

PP-002C-5 Travellers & Documents — Completed

Travellers

- Add / edit (PATCH) / delete with booking ownership checks
- Adult / Child / Infant with age-band validation (INFANT <2, CHILD 2–11, ADULT 12+)
- Duplicate prevention (passport or name+DOB); single lead traveller enforcement
- Completeness indicator (name, type, nationality; DOB for child/infant; contact for lead)
- Confirm gate: ≥1 traveller, one lead, all travellers complete

Documents

- Kinds: PASSPORT, VISA, NATIONAL_ID, OTHER (+ legacy TICKET/INSURANCE)
- verificationStatus column (PENDING/VERIFIED/REJECTED); uploadStatus derived
- Expiry display + missing passport/visa warnings
- DELETE + PATCH document APIs; BOOKING_DOCUMENT_DELETED audit

Invoices & vouchers

- GET list endpoints; structured preview + JSON download; status Generated
- Generate audit events preserved with actorUserId

Booking detail drawer

- Traveller edit/type/DOB/lead/completeness; document CRUD + warnings
- Invoice/voucher history panels with preview/download

Migration

- 20260720160000_pp002c5_travellers_documents (verificationStatus)

Build verified with TypeScript checks and production build.

---

PP-002C-4 Booking Payments — Completed

Payment records

- Manual / gateway / partial / multiple payments via existing BookingPayment + aggregates
- Outstanding balance from denormalized booking.amountPaid (no repeated full recalculation in UI)
- Refunded amount via computeRefundedAmount / computePaymentSummary
- Overpayment + invalid refund guards on BookingPaymentService.record and gateway paths

Booking summary (admin drawer)

- Booking total, amount paid, pending balance, refunded amount, payment status badge
- Record payment, refund, reconcile gateway payments
- Removed stale “no payment gateway integrated” copy

Gateway (reused, not duplicated)

- Razorpay processPayment: upper-bound overpayment rejection, audit BOOKING_PAYMENT_RECORDED
- PhonePe processPhonePePayment: same overpayment + audit parity
- Duplicate callbacks: existing reference unique + P2002 skip preserved
- recordPaymentFailure: FAILED BookingPayment row + BOOKING_PAYMENT_FAILED audit (idempotent)
- refund(): Razorpay gateway refunds + offline/manual/PhonePe local refund rows; actorUserId on audit

Validation & status

- Negative amounts blocked (existing validateRecordPayment)
- Status machine allows PAID/PARTIALLY_PAID → CONFIRMED|PARTIALLY_PAID on refunds
- recomputeBookingAggregate + BookingService.recordPayment share downgrade path
- ADJUSTMENT method → BOOKING_PAYMENT_ADJUSTED audit

Timeline / CRM

- Activity + EntityActivityTimeline labels: confirmed / failed / refunded / manual adjustment
- Customer CRM payment history (admin listPayments already batched; /api/me/payments N+1 removed)
- CRM list shows refunded rows clearly

Build verified with TypeScript checks and production build.

---

PP-002C-3 Booking Timeline & Audit — Completed

Audit events added

- BOOKING_TRAVELLER_ADDED / UPDATED / REMOVED
- BOOKING_PAYMENT_RECORDED
- BOOKING_REFUND_RECORDED
- BOOKING_NOTE_ADDED
- BOOKING_DOCUMENT_ADDED
- BOOKING_VOUCHER_GENERATED
- BOOKING_INVOICE_GENERATED
- Existing CREATED / UPDATED / STATUS_CHANGED / CANCELLED / DELETED preserved

Audit wiring

- Travellers, notes, documents, voucher, invoice, payment, refund (+ cancel auto-refund)
- Mutating routes pass readAuthContextFromHeaders (actorUserId)
- Traveller PATCH update API added for UPDATED audit

Server-side filtering

- AuditLogFilter.bookingId → Prisma JSON path details.bookingId
- GET /api/bookings/[id]/audit-logs uses bookingId filter (no global fetch + client filter)
- GET /api/bookings/[id]/activity — unified chronological feed with category filter

Timeline UI

- BookingActivityTimeline: All / Status / Payments / Notes / Documents / Travellers / System
- Replaces client merge of status history + timeline + audit sections
- BookingTimelineEntry + BookingStatusHistory preserved (fed into activity service)
- EntityActivityTimeline labels extended for new BOOKING_* suffixes

Build verified with TypeScript checks and production build.

---

PP-002C-2 Booking CRUD & Admin UX — Completed

List API (server-side)

- Search: booking #, quote #, id, traveller name/email/phone
- Filters: status, paymentStatus, customerId, dateFrom/dateTo, hasItemKind
- Sort: createdAt, bookingNumber, status, paymentStatus, totalAmount, amountPaid
- Pagination only — removed client fetch-all path

Database

- Indexes: bookings.paymentStatus, bookings.createdAt
- Migration: 20260720140000_pp002c2_booking_list_indexes

Admin UI

- Shared BookingsPage for All / Hotels / Holidays / Activities
- Product tabs map to server hasItemKind (fixes pagination mismatch)
- Filter bar: status, payment, customer, dates, sort (CRM-aligned)
- Table skeletons, empty/error states, toast notifications
- Detail drawer: contact from travellers first, product details section, toast on actions
- parseWebsiteBookingFields / resolveBookingContact helpers (structured data preferred)

Technical debt retained

- Website hotel/activity fields still originate in internalNotes JSON from external booking bridge
- HOLIDAY_OR_PACKAGE product filter still scans booking id sets (scalability note for later)

Build verified with TypeScript checks and production build.

---

PP-002C-1 Booking Foundation — Completed

Database

- Index on quotes.convertedBookingId
- Migration: 20260720130000_pp002c1_booking_foundation

Quote → booking conversion (single path)

- buildBookingHandoff prepares payload without status change
- completeConversion sets CONVERTED + convertedAt + convertedBookingId
- POST /api/quotes/[id]/convert creates real booking via BookingService.createFromQuote
- Orphan recovery: CONVERTED quotes with null convertedBookingId can still convert
- External booking bridge unchanged (already used createFromQuote)

Audit + auth actor

- Audit events: BOOKING_CREATED, BOOKING_UPDATED, BOOKING_STATUS_CHANGED, BOOKING_CANCELLED, BOOKING_DELETED
- BookingService records audit on create/update/delete/confirm/cancel/ticket/complete/payment
- Mutating /api/bookings routes pass readAuthContextFromHeaders
- GET /api/bookings/[id]/audit-logs

Timeline

- Status lifecycle timeline entries preserved (CREATED, APPROVED, CONFIRMED, PAID, TICKETED, CANCELLED, COMPLETED)
- Booking detail drawer: Activity section via EntityActivityTimeline

UI

- Create booking dialog copy: approval does not auto-create booking
- Quote Convert creates booking and links convertedBookingId
- View booking deep-link (/bookings?selected=)
- BookingsPage reads selected query param

Build verified with TypeScript checks and production build.

---

PP-002A Approved

Implemented

Inventory

Packages

Ferries

Deployment

42ae8cb

Production Ready

---

PP-002B Sales CRM — Completed

Customers

- CRUD (create, edit, archive, restore)
- Search, filters, pagination
- Customer profile with extended fields
- Booking history (funnel view)
- Payment history API
- Notes (CustomerNote model)
- Activity timeline + audit logs
- Bulk archive
- Toast notifications

Leads (Enquiries)

- CRUD via Enquiry service
- Search, filters (status, type, source, date)
- Lead status pipeline (list + kanban)
- Lead source options (Website, Google Ads, Meta Ads, etc.)
- Follow-up date + priority
- Notes, timeline, audit logs
- Sembark integration preserved

Quotes

- Data management (no PDF quote engine)
- List, create, edit, status workflow
- Customer linking
- Version history + pricing
- Audit logs endpoint

Infrastructure

- Schema migration: followUpDate, priority on enquiries, customer_notes table
- Audit event types: CUSTOMER_*, ENQUIRY_*, QUOTE_*
- Sidebar: Sales CRM group (Leads, Customers, Quotes)
- AdminCustomerService + API routes

Build verified with TypeScript checks and production build.

---

PP-002B Started

Created feature branch

feature/pp-002b-sales-crm
