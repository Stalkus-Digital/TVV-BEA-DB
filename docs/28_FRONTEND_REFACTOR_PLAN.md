# 28. Frontend Refactor Plan

**Analysis only — no code was modified to produce this document.**

## Purpose

A page-by-page implementation roadmap for a future integration sprint, sequenced by real dependency order and actual backend readiness — not by an idealized order assumed in advance. Where the assumed order (Homepage → Destination Listing → Destination Detail → Package Listing → Package Detail → Search → Quote → Booking → Customer Dashboard) doesn't match what docs/26 and docs/27 actually found, this document says so explicitly rather than silently forcing the plan to fit.

## The requested example order, checked against reality

```
Homepage
  ↓
Destination Listing     ← already live, owned by lib/hierarchy (tvv_hierarchy) — NOT a Website API integration target
  ↓
Destination Detail      ← same as above
  ↓
Package Listing
  ↓
Package Detail
  ↓
Search
  ↓
Quote                   ← blocked: CUSTOMER role has no QUOTE:CREATE grant, no public enquiry endpoint
  ↓
Booking                 ← blocked: no row-level ownership scoping on BOOKING:READ
  ↓
Customer Dashboard      ← blocked: depends on both of the above
```

Two of the nine steps in the example are already solved by a different, live system and are not integration work at all; the last three are genuinely blocked on backend features that don't exist yet, not on frontend wiring effort. The revised roadmap below reflects this.

## Recommended integration order (revised)

### Phase 1 — Lowest-risk, highest-overlap (do first)

**1. Auth repointing** — `/v1/auth/*` → `/api/auth/*`, field-name fixes (`access_token`→`accessToken`, add refresh-token storage). Independent of everything else; unblocks nothing else but blocks nothing either. *Complexity: Low.*

**2. Homepage** — `HomepageResponseDTO` maps well onto the existing hero/featured/latest sections. Missing: experiences/guides/reviews shelves have no DTO fields (defer those sections or keep them mock temporarily). *Complexity: Medium* (mostly mapping + deciding what to do with the unsupported sections, not hard engineering).

**3. Package Listing** (`/packages/domestic`, `/packages/international`, `/packages/domestic/[region]`) — `GET /api/website/packages` covers the base case; region/theme filtering needs client-side (or new route-handler-side) post-filtering since the backend doesn't support those query params. *Complexity: Medium.*

**4. Package Detail** (`/tours/[slug]`) — `WebsitePackageDetailDTO` covers itinerary/pricing/gallery/faqs/related/breadcrumbs/seo well. Missing fields (rating, badges, inclusions/exclusions, themes) need either a deliberate "not shown yet" UI decision or a backend DTO extension (out of scope for a frontend sprint to decide unilaterally). *Complexity: Medium-High* (most field-complete DTO, but also the page with the most missing-field decisions to make).

**5. Search** — `GET /api/website/search` covers packages; destinations/guides sub-results in the current `SearchResults` UI have no backend source and need to be dropped or left mock for this pass. *Complexity: Medium.*

**6. Navigation** (Navbar/MegaMenu/Footer) — `GET /api/website/navigation` exists but `lib/hierarchy`'s `getDestinationTree()` currently serves this role live. Recommend **not** switching this yet — same reasoning as Destination Listing/Detail below. *Complexity: N/A — deferred, see Phase 3.*

### Phase 2 — Explicitly out of scope for Website API wiring (already solved elsewhere)

**Destination Listing, Destination Detail** — `lib/hierarchy` already serves these live, with materialized slug-path routing, redirects, i18n, and ISR caching that Travel OS's Destination Engine doesn't replicate. Wiring these to `/api/website/destinations`/`destination/[slug]` today would be a regression, not progress, unless a deliberate, separately-scoped decision is made to retire `lib/hierarchy` in favor of Travel OS (a real architectural choice with real tradeoffs — not something to default into as a side effect of a frontend integration sprint). **Recommendation: leave as-is; revisit only as its own future initiative.**

### Phase 3 — Blocked on backend work that doesn't exist yet (not frontend effort)

**7. Quote (enquiry/proposal request)** — `EnquiryForm` and every "Get Proposal"/"Turn this into a proposal" CTA need a path to create something server-side. Today: `CUSTOMER` role has no `QUOTE:CREATE` grant, and no public `/api/website/enquiry`-style endpoint exists. **Blocked until a backend decision is made** on whether this becomes a public lead-capture endpoint, a customer-authenticated quote-request flow, or both. *Complexity once unblocked: Medium.*

**8. Booking (customer-facing)** — Same story as Quote, plus a second, more serious blocker: even read-only "show me my booking" needs row-level ownership scoping that doesn't exist in the Booking module's repositories today (permission grants are resource-level only, by the backend's own documented admission). **Do not build this against the current backend under any circumstances** — it's a security regression waiting to happen, not a missing feature waiting to be wired. *Complexity once unblocked: Medium-High* (real scoping work needed server-side first).

**9. Customer Dashboard** (`/(account)/account`, `/(account)/account/bookings`) — Depends entirely on 7 and 8. The `/(account)/account` overview page itself (name/email/phone display) is trivial once Auth is repointed (Phase 1); the bookings sub-page is fully blocked per above. *Complexity: Low for the overview shell, Blocked for bookings content.*

## Complexity legend

- **Low** — mechanical path/field renames, no new logic.
- **Medium** — real mapping work (new adapter functions), plus product decisions about what to do with fields/sections the backend doesn't support.
- **Medium-High** — mapping work plus multiple missing-field decisions that affect what the page visually shows.
- **Blocked** — no amount of frontend effort resolves this; a specific, named backend capability must be built first.

## Production risks (roadmap-specific)

- Building Phase 1–2 without addressing Phase 3's blockers first is safe and recommended — nothing in Phase 1/2 depends on Phase 3.
- The single most important discipline for whoever executes this plan: **resist the temptation to wire Customer Bookings to `/api/bookings` "just to see it work."** It will appear to work in a single-customer test and fail catastrophically as a data-exposure issue the moment two customer accounts exist.
- Region/theme/ferry/flights/guides/experiences/reviews/FAQ/calculator gaps are all genuine product-scope questions (does TVV want a public FAQ page backed by real content? a real Ferry booking flow?) that this analysis surfaces but does not answer — those answers belong to the user/product owner, not to an integration sprint.
