# The Vacation Voice — Travel ERP
## Headless Backend API — Full Endpoint List

**Status:** Design only — no implementation. **The existing website is not being rebuilt.** This document defines the complete public API contract the admin ("Travel OS") must expose so that website — untouched, wherever and however it's currently hosted — can consume Destinations, Packages, Flights, Hotels, Activities, Blogs, Forms, and Bookings as pure data/services.

This is a **facade**, not a new implementation: every endpoint below is a thin, cached, read-optimized wrapper over services already designed in [INVENTORY_SYSTEM.md](INVENTORY_SYSTEM.md), [PACKAGE_BUILDER.md](PACKAGE_BUILDER.md), and [DATABASE_SCHEMA.md](DATABASE_SCHEMA.md) — nothing here is a parallel data model.

**Base path:** `/api/v1/public/*` for anonymous/website-consumed endpoints, `/webhooks/*` for inbound callbacks. (The internal admin-UI APIs from prior docs — `/api/inventory`, `/api/packages`, etc. — stay unversioned/internal and are a separate audience from this document.)

---

## 1. Destination APIs

| Method | Path | Purpose |
|---|---|---|
| GET | `/api/v1/public/destinations` | List all published destinations — powers nav, "Explore by Destination" |
| GET | `/api/v1/public/destinations/:slug` | Destination detail: hero content, trust stats, description, SEO metadata |
| GET | `/api/v1/public/destinations/:slug/packages` | Packages scoped to this destination (thin filter over §2) |
| GET | `/api/v1/public/destinations/:slug/activities` | Activities scoped to this destination (thin filter over §5) |

## 2. Package APIs

| Method | Path | Purpose |
|---|---|---|
| GET | `/api/v1/public/packages` | List, filterable by `destinationId`, `category` (deals/family/group/treks — matches the existing landing-page carousel categories), `duration`, `priceRange`, `sort` |
| GET | `/api/v1/public/packages/:slug` | Full detail: itinerary days/components, inclusions, gallery, SEO — `PINNED` components show a fixed price, `SLOT` components show "from ₹X" |
| GET | `/api/v1/public/packages/:slug/price-estimate?checkIn=&pax=` | Live estimate for any `SLOT` components (delegates to `package-pricing.service`) — indicative, not a locked quote |
| GET | `/api/v1/public/packages/categories` | Category labels for carousel headers (deals/family/group/treks) |
| GET | `/api/v1/public/packages/featured` | Curated homepage/carousel feed |

## 3. Flight APIs

Given this business's model is lead-generation/agent-assisted (WhatsApp/call CTAs, not self-serve OTA checkout — confirmed by the existing landing-page template's hero CTAs), flights are exposed **indicatively**, not as a bookable self-serve flow, unless told otherwise:

| Method | Path | Purpose |
|---|---|---|
| GET | `/api/v1/public/flights/routes` | Published Route-kind inventory items (e.g. "Chennai → Port Blair") — for "how to reach" marketing copy |
| POST | `/api/v1/public/flights/estimate` | `{origin, destination, date, pax}` → indicative fare range via the Supplier Gateway; explicitly not a lockable fare |

*Open question for you:* if the existing website already has (or is meant to gain) a self-serve flight booking flow, this section needs a `POST /bookings/flights` endpoint added — flagged rather than assumed, since it changes the payments/PNR-ticketing scope significantly.

## 4. Hotel APIs

| Method | Path | Purpose |
|---|---|---|
| GET | `/api/v1/public/hotels?destinationId=` | Published hotel inventory for a destination |
| GET | `/api/v1/public/hotels/:slug` | Detail: amenities, gallery, star rating, indicative rate range |
| POST | `/api/v1/public/hotels/:id/availability` | `{checkIn, checkOut, occupancy}` → live/indicative rate, short-TTL |

## 5. Activity APIs

| Method | Path | Purpose |
|---|---|---|
| GET | `/api/v1/public/activities?destinationId=&category=` | List |
| GET | `/api/v1/public/activities/:slug` | Detail: description, duration, indicative price |

## 6. Blog APIs

| Method | Path | Purpose |
|---|---|---|
| GET | `/api/v1/public/articles?category=&destinationId=&page=` | Paginated guide/blog listing |
| GET | `/api/v1/public/articles/:slug` | Full article: sections (hero/intro/richtext/faq — matches the existing `ArticleSection` model), author, SEO |
| GET | `/api/v1/public/articles/:slug/related` | Related-articles feed |
| GET | `/api/v1/public/articles/sitemap` | `{slug, updatedAt}[]` for the website's own `sitemap.xml` generation — long-cached, tag-invalidated on publish |

## 7. Forms APIs

This is the domain with an actual bug to fix, not just a gap to fill: the current codebase's landing-page generator ([template-generator.ts](src/lib/template-generator.ts)) POSTs leads to a hardcoded external webhook URL with a **bearer token embedded as plaintext in source** (flagged as P0 in [ARCHITECTURE_MIGRATION.md](ARCHITECTURE_MIGRATION.md)). This API section is the direct replacement — the existing website's forms should point here instead, and the token can be retired.

| Method | Path | Purpose |
|---|---|---|
| POST | `/api/v1/public/forms/enquiry` | Generic lead capture: `{name, email, phone, packageId?, destinationId?, budget?, duration?, utm, pageUrl}` → creates `contacts` + `leads` rows directly (no external webhook, no embedded token) |
| POST | `/api/v1/public/forms/callback-request` | Lightweight "call me back" form variant |
| POST | `/api/v1/public/forms/newsletter-subscribe` | Marketing opt-in |
| GET | `/api/v1/public/forms/:formKey/schema` | Optional: admin-configurable field schema, so ops can add/remove a form field without a website redeploy |

Every write endpoint here is rate-limited per IP/session and sits behind bot detection (e.g. Vercel BotID) before it reaches the CRM — the current setup has zero spam protection since it's a raw client-side `fetch` to an external webhook.

## 8. Booking APIs

| Method | Path | Purpose |
|---|---|---|
| POST | `/api/v1/public/bookings` | Initiate a booking (package or standalone component) → creates `bookings` + `booking_items` in `PENDING` status |
| GET | `/api/v1/public/bookings/:reference/status` | Requires reference + verified contact (see §9) |
| POST | `/api/v1/public/bookings/:reference/payment` | Initiate/confirm payment against a payment gateway |
| POST | `/webhooks/payments/:provider` | Inbound gateway webhook (e.g. Razorpay/Stripe) → updates booking/payment status; HMAC-verified, not API-key based |

*Same open question as Flights:* whether the existing website supports full self-serve checkout or only "enquire → agent confirms manually" determines whether this section is fully built or reduced to `POST /bookings` (a booking intent) plus the enquiry form in §7. Worth confirming before implementation — it changes payment/PCI scope materially.

---

## 9. Authentication

Three distinct trust boundaries, not one:

**Service-to-service (the website calling this API).**
An `api_clients` row (already in the base schema) per consuming site/environment: API key in a request header, scoped (`read:catalog`, `write:forms`, `write:bookings`), CORS-locked to the website's known origin(s), per-key rate limit. Read-only catalog endpoints (§1–6) can be a lower-friction key than write endpoints (§7–8).

**Customer-facing (booking status / "my booking" lookups).**
No new full account system — deliberately, since the existing site wasn't built around one. A booking reference alone is not sufficient to prove identity: `GET /bookings/:reference/status` requires pairing the reference with the contact's phone/email, verified via a short-lived OTP, exchanged for a signed token scoped to that one booking only.

**Inbound webhooks (payment providers, supplier callbacks).**
HMAC signature verification per provider's own scheme — never protected by our own API key, since the caller is a third party we don't control.

**Internal admin-UI auth** (Travel OS staff logging into the dashboard itself) is out of scope for this document — it's covered by Phase 4 of [ARCHITECTURE_MIGRATION.md](ARCHITECTURE_MIGRATION.md). This section is specifically the boundary between the *unmodified external website* and the headless backend.

---

## 10. Caching Strategy

| Endpoint group | Strategy | TTL / invalidation |
|---|---|---|
| Destinations, Packages listing/detail, Activities, Blogs | CDN/edge cache (ISR / Next.js Cache Components) | Long TTL, invalidated immediately via `revalidateTag` fired from the admin's publish action — push-based, not poll-based |
| `packages/:slug/price-estimate`, `hotels/:id/availability`, `flights/estimate` | Short-TTL cache-aside (Redis), 1–5 min | Never treated as a locked price — always re-quoted at actual booking time, per the Supplier Gateway's own re-check step |
| `articles/sitemap` | Long TTL | Tag-invalidated on any article publish/unpublish |
| Forms (`POST /forms/*`) | Never cached | Always live; only rate-limited, not cached |
| Bookings (`POST/GET /bookings/*`) | Never cached | Booking state must always be read live — this is the one category where a stale cache is a correctness bug, not a UX nit |

This is the same volatility-tiered principle from [DATABASE_SCHEMA.md](DATABASE_SCHEMA.md) §5, applied concretely per public endpoint rather than described abstractly.

---

## 11. Versioning

- **URL-path versioning**: everything here lives under `/api/v1/public/`. Because the consuming website is external code this team may not control the deploy cadence of, the v1 contract is a promise, not a suggestion — no field is renamed or removed without a version bump.
- **Additive changes** (new optional response fields, new optional query params) ship into `v1` without notice — the website's existing integration can't break from something it doesn't read yet.
- **Breaking changes** (renamed/removed fields, changed status codes, changed auth requirements) require standing up `/api/v2/public/...` alongside `v1`, keeping `v1` fully functional for a fixed deprecation window (suggest 90 days), with a `Sunset` HTTP header added to `v1` responses once a `v2` exists.
- **A machine-readable contract** (OpenAPI/JSON schema) is the actual source of truth for this document, checked in and covered by contract tests in CI — so a schema-breaking change to any endpoint above fails the build before it ever reaches the website that depends on it, even though that website's own source isn't in this repo.
- `GET /api/v1/public/meta/version` reports the current version and any active deprecation dates, so whoever maintains the website can monitor without guessing or waiting for something to break.
