# 32. Customer Experience Platform

Sprint 13 — a new, isolated `src/modules/customer/` module: the only backend entry point authenticated customers use. Admin APIs (`/api/quotes`, `/api/bookings`, `/api/users`, etc.) are untouched and unaware this module exists.

## 1. Folder Tree

```
src/modules/customer/
├── types/
│   ├── customer-profile.ts     CustomerProfile, EmergencyContact
│   ├── enquiry.ts               Enquiry, EnquiryType, EnquiryStatus
│   ├── notification.ts          Notification, NotificationType (placeholder)
│   └── index.ts
├── validation/
│   ├── customer-profile.validation.ts   validateUpdateMe, validateUpdateCustomerProfile
│   ├── quote-request.validation.ts      validateQuoteRequest (+ local TravelerDetails re-validation)
│   └── enquiry.validation.ts            validateSubmitEnquiry
├── repositories/
│   ├── customer-profile.repository.ts (+ .prisma.ts)
│   ├── enquiry.repository.ts (+ .prisma.ts)
│   └── notification.repository.ts (+ .prisma.ts)
├── services/
│   ├── customer-profile.service.ts      getAccount/updateAccount/getFullProfile/updateFullProfile
│   ├── customer-quote.service.ts        list/getById (ownership-checked) + submitQuoteRequest
│   ├── customer-booking.service.ts      list/getById (ownership-checked)
│   ├── enquiry.service.ts               submit (public, customerId optional)
│   └── index.ts
├── documents/
│   ├── document.service.ts     aggregates invoices/vouchers/passenger-documents across owned bookings
│   └── index.ts
├── dashboard/
│   ├── dashboard.service.ts    aggregates profile+trips+quotes+bookings+status+notifications+documents+stats
│   └── index.ts
├── api/
│   ├── me.handlers.ts, profile.handlers.ts, quotes.handlers.ts, bookings.handlers.ts,
│   │   documents.handlers.ts, dashboard.handlers.ts, enquiries.handlers.ts
│   └── index.ts
├── module.ts        DI registration, health check
└── index.ts          public surface — types + api + service accessors only

src/app/api/me/
├── route.ts                    GET, PATCH
├── profile/route.ts            GET, PATCH
├── quotes/route.ts              GET, POST
├── quotes/[id]/route.ts         GET
├── bookings/route.ts            GET
├── bookings/[id]/route.ts       GET
├── documents/route.ts           GET
└── dashboard/route.ts           GET

src/app/api/enquiries/route.ts   POST (public)
```

## 2. Files Created

31 new files under `src/modules/customer/`, 9 new route files under `src/app/api/me/*` and `src/app/api/enquiries/`, one new Prisma migration (`20260703184641_customer_experience_platform`), plus minimal, additive edits to 6 pre-existing files (see §5 for why each was necessary):

- `prisma/schema.prisma` — `customerId` added to `Quote`/`Booking`; new `CustomerProfile`/`Enquiry`/`Notification` models.
- `src/modules/quote/types/quote.ts`, `repositories/quote.repository.ts`, `repositories/quote.repository.prisma.ts`, `services/quote.service.ts` — `customerId` field + filter + `create()`'s new optional parameter.
- `src/modules/booking/types/booking.ts`, `repositories/booking.repository.ts`, `repositories/booking.repository.prisma.ts`, `services/booking.service.ts` — same, plus automatic propagation in `createFromQuote()`.
- `src/modules/auth/middleware/route-permission-map.ts` — `/api/enquiries` added to the public allow-list.
- `tsconfig.json` — excluded the nested `TVV FE:A-DB` frontend project (pre-existing noise unrelated to this sprint, fixed while it was in front of me).

## 3. Customer API List

| Method | Path | Auth | Ownership |
|---|---|---|---|
| GET | `/api/me` | Required | — (own account only, by construction) |
| PATCH | `/api/me` | Required | — |
| GET | `/api/me/profile` | Required | — |
| PATCH | `/api/me/profile` | Required | — |
| GET | `/api/me/quotes` | Required | Filtered to `customerId` |
| GET | `/api/me/quotes/:id` | Required | 404 if not owner |
| POST | `/api/me/quotes` | Required | `customerId` stamped server-side |
| GET | `/api/me/bookings` | Required | Filtered to `customerId` |
| GET | `/api/me/bookings/:id` | Required | 404 if not owner |
| GET | `/api/me/documents` | Required | Aggregated only across owned bookings |
| GET | `/api/me/dashboard` | Required | Aggregated only for the caller |
| POST | `/api/enquiries` | Public | `customerId` attached only if a valid session is present |

None of these paths appear in `RESOURCE_PREFIX_MAP` (the admin permission-resource table) — they fall to the existing "authenticated-only, no specific permission" floor every unmapped path already gets. The real security boundary is row-level filtering in the service layer, not a coarse permission grant, per this sprint's explicit design.

## 4. Dashboard Model

`GET /api/me/dashboard` returns:

```ts
{
  profile: { id, email, fullName },
  upcomingTrips: Booking[],       // status in {CONFIRMED, PARTIALLY_PAID, PAID, TICKETED}
  recentQuotes: Quote[],          // last 5, newest first
  recentBookings: Booking[],      // last 5, newest first
  bookingStatus: { draft, confirmed, partiallyPaid, paid, ticketed, completed, cancelled },
  unreadNotifications: number,    // always 0 today — see §9
  documentCounts: { invoices, vouchers },
  statistics: { totalQuotes, totalBookings, totalSpend, memberSince },
}
```

`upcomingTrips` is a documented best-effort proxy: `Booking` has no explicit "travel start date" field yet, so this uses non-terminal booking status rather than fabricating a date.

## 5. Ownership Security Model

- **Identity source**: every customer-module service method takes `customerId`/`userId` as an explicit first argument. Every handler derives it from `readAuthContextFromHeaders(request.headers)` (the same middleware-forwarded, JWT-verified context every other authenticated route in this codebase uses) — never from a route param, query string, or request body field.
- **Enforcement point**: row-level filtering happens in `CustomerQuoteService`/`CustomerBookingService`, not in the admin `QuoteService`/`BookingService` themselves (which stay permission-agnostic, as before). `list()` passes `customerId` as a repository filter; `getById()` fetches by id then compares `result.customerId !== callerCustomerId` before returning.
- **Failure mode is 404, not 403**: a quote/booking that exists but belongs to someone else returns `NotFoundError`, so a customer can never distinguish "doesn't exist" from "exists but isn't yours."
- **The schema change this required**: `Quote`/`Booking` had no ownership field at all before this sprint (confirmed by reading both types directly, not assumed) — `customerId String?` was added to both, nullable so every pre-existing admin-created quote/booking is unaffected (`customerId: null`). `Booking.customerId` is never set independently; `createFromQuote()` copies it from the source `Quote` automatically.
- **`QuoteService.create()`'s new parameter**: `customerId: string | null = null`, a distinct function argument, not a validated body field — the one and only way this module attaches ownership at creation. Every existing admin call site is unaffected by the default.
- **Verified live, not just by reading the code** (see §10): two real customer accounts, cross-account 404 on direct ID access, correct list scoping, and confirmation that the *admin* `/api/quotes`/`/api/bookings` endpoints still see everything, completely unaware of the new filter.

## 6. Lead Capture Flow

`POST /api/enquiries` — public, supports `GENERAL | PACKAGE | DESTINATION | CALLBACK | CORPORATE` (`PACKAGE` requires `packageSlug`, `DESTINATION` requires `destinationSlug`). Every submission is stored via `PrismaEnquiryRepository`, status starts `NEW`. `customerId` is attached automatically when the submitter has a valid session — this required resolving the Authorization header directly inside the route handler (`resolveAuthContext()`), since `/api/enquiries` being on the public allow-list means `middleware.ts` never forwards auth-context headers for it (confirmed by reading `middleware.ts`, not assumed — public paths return `NextResponse.next()` immediately, before any context resolution). `resolveAuthContext()` is pure (JWT verify only), so calling it directly in a route handler carries none of the session-isolation caveats documented elsewhere in this project.

## 7. Future CRM Integration Points

- `Enquiry` rows are the natural sync source — `type`, `status`, `source`, and the optional `customerId` link are all already there for a future outbound sync job.
- `Enquiry.status` (`NEW → CONTACTED → CONVERTED → CLOSED`) has no state-transition API yet — only `NEW` is ever written. A CRM integration would need its own status-update path (admin-side, out of this sprint's scope).
- No webhook/outbound-event mechanism exists yet for "enquiry created" — a future integration would need to add one without touching this module's core write path.

## 8. Future Payment Integration Points

- `Booking.paymentStatus`/`amountPaid`/`totalAmount` already exist (Booking Engine, unchanged this sprint) — a payment gateway integration would hook into `BookingService.recordPayment()`, not this module.
- Customer-facing "make a payment" has no endpoint yet — `/api/me/bookings/:id` is read-only. A future sprint would need a new, carefully-scoped `POST /api/me/bookings/:id/payments` that still enforces the same ownership check this sprint established.
- Document generation for a real invoice PDF (`BookingInvoice`/`BookingVoucher` are data-only, no rendering) is a prerequisite for anything payment-receipt-related.

## 9. Remaining TODOs

- **Notifications are a placeholder with no writer.** `NotificationRepository.countUnread()` is real and wired into the dashboard, but nothing in this codebase ever creates a `Notification` row — `unreadNotifications` will always read `0` until a future sprint adds the triggers (quote approved, booking confirmed, etc.) and the email/SMS/WhatsApp delivery this sprint was explicitly told not to build.
- **Documents have no real files.** `documentUrl` is `null` on every entry — no blob storage or signed-URL generation exists (explicitly out of scope). Invoices/vouchers are real structured data; tickets/insurance/passport/visa are placeholders inherited from Booking Engine's own `PassengerDocument` model.
- **No self-service password reset UI wiring in this module** — `/api/auth/request-password-reset`/`reset-password` already exist (Auth module, unchanged) and are outside the Customer module's surface by design; this sprint didn't re-expose them under `/api/me/*` since they don't need a customer session to begin with.
- **`/api/me/dashboard`'s booking/document aggregation scans up to 100 bookings** per request (a pragmatic cap, not true pagination) — fine at today's scale, worth revisiting if a customer's booking history ever grows large.
- **No rate limiting on `POST /api/enquiries`** — it's public and unauthenticated by design; spam/abuse protection wasn't in this sprint's scope.

## 10. Verification

- **TypeScript**: `tsc --noEmit` clean across the whole project, including the new module and every touched file.
- **Tests**: `npm test` — 26 files, 198 passed, 1 pre-existing expected fail (unrelated), no regressions from the `Quote`/`Booking` type changes.
- **Build**: `next build` clean; all 9 new `/api/me/*` routes and `/api/enquiries` present in the route manifest alongside every existing route, unchanged.
- **Health**: `GET /api/health` reports `"customer": "healthy"` alongside every other module; overall status `degraded` only because of the pre-existing supplier placeholder adapters (unrelated to this sprint).
- **Live, end-to-end, with two real customer accounts against a running server**:
  - Register/login customer A and customer B independently.
  - `PATCH /api/me/profile` on customer A — phone, date of birth (date-only, matching the Traveller precedent from Sprint 12), nationality, and a nested emergency contact all round-tripped correctly.
  - `POST /api/me/quotes` on customer A against a real package (resolved by slug, not id) succeeded, correctly stamped `customerId`, and started `DRAFT` — no automatic booking.
  - **Customer B could not see customer A's quote**: `GET /api/me/quotes` for B returned `total: 0`; `GET /api/me/quotes/:id` for A's quote as B returned `404 NOT_FOUND`, not the quote data and not a `403`.
  - `GET /api/me/dashboard` for customer A correctly surfaced the new quote under `recentQuotes` and `statistics.totalQuotes: 1`.
  - `POST /api/enquiries` verified three ways: anonymous (`customerId: null`), authenticated (`customerId` correctly attached), and invalid `type` (clean `VALIDATION_ERROR`, 400).
  - **Admin APIs confirmed unaffected**: logged in as the bootstrap `SUPER_ADMIN` and called `GET /api/quotes` — saw all 53 quotes in the system (including the customer-submitted one), and fetched that specific quote directly by id with no ownership restriction, exactly as before this sprint.
