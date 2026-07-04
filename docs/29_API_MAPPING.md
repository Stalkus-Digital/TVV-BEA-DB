# 29. API Mapping

**Analysis only — no code was modified to produce this document.**

## Purpose

The definitive, exact endpoint-by-endpoint reference: what the frontend calls today (`lib/api/endpoints`), what Travel OS actually exposes, and the precise field-level deltas between them. This is the table an implementer opens first.

## Website API — exact coverage

| Frontend expects (`lib/api/config.ts` endpoints, `/v1/*` on legacy backend) | Travel OS equivalent | Match |
|---|---|---|
| `GET /v1/packages` (list, with region/theme/destination filters) | `GET /api/website/packages?destinationSlug=&page=&pageSize=` | **Partial** — no region/theme filter param |
| `GET /v1/packages/{slug}` | `GET /api/website/package/{slug}` | **Partial** — see field deltas below |
| `GET /v1/packages/{slug}/related` | Included inline as `relatedPackages` on `WebsitePackageDetailDTO` | **Yes, different shape** (embedded, not a separate call) |
| `GET /v1/destinations` | `GET /api/website/destinations?page=&pageSize=` | **Exists, but `lib/hierarchy` currently owns this role live — see docs/27/28** |
| `GET /v1/destinations/{slug}` | `GET /api/website/destination/{slug}` | **Exists, same caveat as above** |
| — (no direct equivalent; frontend computes search client-side across 3 services) | `GET /api/website/search?keyword=&destinationSlug=&minDurationDays=&maxDurationDays=&minPrice=&maxPrice=&categoryId=&packageType=&page=&pageSize=` | **Partial** — packages only, no destinations/guides in result |
| `GET /v1/ferry/routes`, `/schedules`, `POST /v1/ferry/search` | **None** | **Missing entirely** |
| `GET /v1/flights/airports`, `POST /v1/flights/search` | **None** | **Missing entirely** |
| `GET /v1/guides`, `/v1/guides/{slug}`, `/v1/reels` | **None** (Destination DTO's `guides` field is always `never[]`) | **Missing entirely** |
| `GET /v1/experiences`, `/v1/experiences/{slug}` | **None** | **Missing entirely** |
| `GET /v1/reviews`, `/v1/reviews?tour={slug}` | **None** | **Missing entirely** |
| `GET /v1/faqs` (standalone list) | Only embedded: `WebsitePackageDetailDTO.faqs`, `WebsiteDestinationDetailDTO.faqs` | **Missing as a standalone list** |
| `POST /v1/calculator/estimate` | **None** | **Missing entirely** (lowest-priority gap — existing mock computation is a real, working estimator) |
| `GET /hotels` (legacy, no `/v1` prefix) | Inventory has `HOTEL`-kind items, but no public/Website-API exposure | **Missing from public surface** (exists admin-side only) |
| `POST /enquiries` (legacy, no `/v1` prefix) | **None** | **Missing entirely** — no public lead-capture endpoint |
| `GET /v1/me/bookings`, `/v1/me/bookings/{kind}/{id}` | `/api/bookings` exists but is admin-gated, resource-level only, no row-ownership filter | **Missing a safe equivalent** — do not wire as-is |
| — | `GET /api/website/home` | Frontend has no direct equivalent call; homepage currently assembles its own sections from multiple services |
| — | `GET /api/website/navigation` | Frontend currently uses `lib/hierarchy`'s `getDestinationTree()` instead |

## Auth endpoints — exact field deltas

| Frontend calls | Travel OS route | Request body delta | Response body delta |
|---|---|---|---|
| `POST /v1/auth/login` | `POST /api/auth/login` | Same (`email`, `password`) | `access_token` → **`accessToken`**; Travel OS also returns `refreshToken`, `expiresIn`, `user`, `roles` — frontend's `token.ts` doesn't currently store `refreshToken` or use `expiresIn` |
| `POST /v1/auth/register` | `POST /api/auth/register` | Frontend sends `{email, password, name?, phone?}`; Travel OS's register handler expects `{email, password, fullName}` — **`name` → `fullName`**, and Travel OS has no `phone` field on `User` at all | Travel OS returns `PublicUser` (no `passwordHash` — this was a deliberately fixed security bug from Sprint 11); frontend expects `{access_token, user}` on register too — **Travel OS's register endpoint does not auto-login**, it returns the created user only (201), a separate login call would be needed |
| `GET /v1/auth/me` | `GET /api/auth/me` | — | Travel OS returns `AuthContext` (`userId`, `email`, `sessionId`, `roles`), not a full `CustomerUser` profile — frontend's `hydrate()` expects `{user: {id, email, name?, phone?, role?}}`; field names and nesting differ |
| `PATCH /v1/auth/me` (profile update) | **None** — `/api/users/[id]` exists but requires `USER:UPDATE` (admin-only) | — | **Missing entirely** as a self-service route |
| — | `POST /api/auth/refresh` | — | Frontend has no refresh-token flow today; this is new capability the frontend doesn't yet use, not a gap on Travel OS's side |
| — | `POST /api/auth/logout`, `/api/auth/change-password`, `/api/auth/request-password-reset`, `/api/auth/reset-password` | — | Travel OS has all of these; frontend currently only clears local storage on "logout" (no server-side session revocation call) and has no password-reset UI at all |

## Response envelope — confirmed match

`lib/api/envelope.ts`'s `unwrapApiData()`:
```ts
if (rec.success === false) throw fromStatus(400, {...rec});
if (rec.success === true && "data" in rec) return rec.data;
```
Travel OS's `jsonSuccess()`/`jsonError()` (`src/api/http.ts`): `{ success: true, data: T }` / `{ success: false, error: { code, message } }`. **Exact match — no envelope adapter code needed.** Only base URL and path segments need to change.

## Query parameter naming — confirmed match where overlap exists

Travel OS's pagination params (`page`, `pageSize`) match the frontend's expected pagination shape (`meta.page`, `meta.limit` in the legacy envelope's `paginatedRows()` helper — note: **`pageSize` vs `limit`** is itself a small naming delta the adapter layer needs to handle).

## Summary counts

- **7** Website API endpoints exist on Travel OS; **0** are currently called by the frontend.
- **2** of those 7 (destinations list/detail) are already served live by a different, working system (`lib/hierarchy`) and should not be switched without a separate architectural decision.
- **10** distinct content/feature areas the frontend expects (Ferry, Flights, Guides, Experiences, Reviews, standalone FAQ, Calculator, Enquiries, public Hotels, row-scoped Customer Bookings/Quotes) have **zero** Travel OS backend coverage.
- **8** auth-related endpoints exist on both sides with compatible envelopes but **mismatched field names and one missing self-service route** (profile update).
