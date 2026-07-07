# Backend contracts required before wiring live

Features below have **no Travel OS public API** today. The frontend throws
`ApiError.notImplemented()` when `NEXT_PUBLIC_USE_MOCK=false` instead of
calling unsafe or non-existent endpoints.

## Customer account (`/api/me/*`)

| Feature | Status | Notes |
|---------|--------|-------|
| Wishlist list/add/remove | **Missing** | Needs `/api/me/wishlist` with row ownership |
| Profile update (name, phone) | **Missing** | Needs self-service PATCH on auth profile |
| Profile `name` on session hydrate | **Partial** | `/api/auth/me` returns auth context only — no `fullName` |

## Quotes & enquiries

| Feature | Status | Notes |
|---------|--------|-------|
| Public enquiry / lead capture | **Missing** | Contact form cannot submit in live mode |
| Customer "my quotes" list | **Missing** | `/api/quotes` is admin-only, no row filter |
| Quote detail for customer | **Missing** | Same as above |

## Bookings

| Feature | Status | Notes |
|---------|--------|-------|
| Customer "my bookings" list | **Missing** | `/api/bookings` is admin-gated, no ownership filter |
| Booking detail / cancel for customer | **Missing** | Wiring as-is would expose all bookings |

## Content modules (no Website API)

| Module | Status |
|--------|--------|
| Ferry routes / search | **Missing** |
| Flights airports / search | **Missing** |
| Guides / reels (standalone) | **Missing** |
| Experiences | **Missing** |
| Reviews | **Missing** |
| Standalone FAQ list | **Missing** (embedded on package/destination detail only) |
| CMS pages / site settings | **Missing** |
| TripJack vendor sync (public) | **Missing** |
| Public hotels catalog | **Missing** |

## Website API — partial coverage

| Endpoint | Gap |
|----------|-----|
| `GET /api/website/packages` | No region/theme/tripType filters — client-side filter after fetch |
| `GET /api/website/search` | Packages only — no destination/guide search |
| `GET /api/website/destinations` | Hierarchy BFF (`/api/navigation/tree`) still used for nav |

## Auth — known limitations

- Register composes login (Travel OS register does not auto-login).
- Session rehydration loses display name until profile endpoint exists.
- Refresh token flow is implemented client-side.

See backend `docs/29_API_MAPPING.md` for field-level deltas.
