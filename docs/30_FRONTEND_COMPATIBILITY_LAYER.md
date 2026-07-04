# 30. Frontend Compatibility Layer

Sprint 13 (Frontend Compatibility Layer) — a new `src/modules/frontend/` module exposing legacy-shaped, `/v1/*`-prefixed endpoints that the existing frontend (`tvv-new2-main`) already calls, each internally transforming to/from the real Travel OS Website/Auth modules. **No frontend code and no business module was modified** — the one necessary exception, and why, is documented in §Migration plan.

## Folder Tree

```
src/modules/frontend/
├── dto/
│   ├── legacy-package.dto.ts     LegacyPackageDTO, list/detail response envelopes
│   ├── legacy-search.dto.ts      LegacySearchResultDTO
│   ├── legacy-auth.dto.ts        LegacyCustomerUserDTO, LegacyLoginResponseDTO, LegacyRegisterRequestBody
│   ├── unsupported.dto.ts        UNIMPLEMENTED_ENGINE names
│   └── index.ts
├── transformers/
│   ├── package.transformer.ts    WebsitePackageSummaryDTO/DetailDTO → LegacyPackageDTO
│   ├── search.transformer.ts     WebsiteSearchResultDTO → LegacySearchResultDTO
│   ├── auth.transformer.ts       LoginResult/AuthContext ↔ legacy auth shapes
│   └── index.ts
├── adapters/
│   ├── website-package.adapter.ts   thin pass-through to @/modules/website's package handlers
│   ├── website-search.adapter.ts    thin pass-through to @/modules/website's search handler
│   ├── auth.adapter.ts              thin pass-through to @/modules/auth's handlers
│   └── index.ts
├── services/
│   ├── legacy-package.service.ts    orchestrates adapter + transformer + pagination reshaping
│   ├── legacy-search.service.ts     orchestrates adapter + transformer
│   ├── legacy-auth.service.ts       orchestrates register→login composition, me enrichment
│   ├── unsupported.service.ts       produces the shared NOT_IMPLEMENTED error
│   └── index.ts
├── api/
│   ├── legacy-package.handlers.ts
│   ├── legacy-search.handlers.ts
│   ├── legacy-auth.handlers.ts
│   ├── unsupported.handlers.ts
│   └── index.ts
├── module.ts        registers the module + a health check; no DI tokens (stateless pass-through)
└── index.ts          public surface — exports dto/ and api/ only, per project convention

src/app/api/v1/
├── packages/route.ts                  GET  — list
├── packages/[slug]/route.ts            GET  — detail
├── search/route.ts                     GET
├── auth/login/route.ts                 POST
├── auth/register/route.ts              POST
├── auth/me/route.ts                    GET  (authenticated)
├── ferry/routes/route.ts               GET  — 501
├── ferry/routes/[slug]/route.ts        GET  — 501
├── ferry/schedules/route.ts            GET  — 501
├── ferry/search/route.ts               POST — 501
├── flights/search/route.ts             POST — 501
├── flights/airports/route.ts           GET  — 501
├── guides/route.ts                     GET  — 501
├── guides/[slug]/route.ts              GET  — 501
├── experiences/route.ts                GET  — 501
├── experiences/[slug]/route.ts         GET  — 501
├── reviews/route.ts                    GET  — 501
└── calculator/estimate/route.ts        POST — 501
```

Layer responsibilities (each layer does exactly one thing, matching the existing `website` module's own convention):
- **adapters/** — one function per underlying Travel OS capability, a direct call into `@/modules/website`/`@/modules/auth`'s already-exported handlers. No logic.
- **transformers/** — pure functions, DTO shape in → DTO shape out. No I/O.
- **services/** — the only layer with orchestration: pagination-shape reshaping, and the register→login composition (see below). Still no *business* logic — no password hashing, no validation, no session creation.
- **api/** — thin handlers matching the codebase's `api/*.handlers.ts` convention, called directly by `route.ts` files.

## API mappings

| Legacy path (frontend's real `lib/api/config.ts`) | Method | Internally calls | Notes |
|---|---|---|---|
| `/v1/packages` | GET | `GET /api/website/packages` (via `listWebsitePackagesHandler`) | `destinationSlug`/`page`/`pageSize` supported; region/theme filters are not (Website API has no such params — see docs/26). |
| `/v1/packages/{slug}` | GET | `GET /api/website/package/{slug}` (via `getWebsitePackageDetailHandler`) | Full itinerary/pricing/seo mapped; several fields have no source (see DTO mappings). |
| `/v1/search` | GET | `GET /api/website/search` (via `searchWebsitePackagesHandler`) | Only searches packages — `destinations`/`guides` in the response are always `[]`. |
| `/v1/auth/login` | POST | `loginHandler` | Field renames only (`accessToken`→`access_token`, etc.) — see DTO mappings. |
| `/v1/auth/register` | POST | `registerHandler` **then** `loginHandler` | Composed, not duplicated — Travel OS's register returns no token; this endpoint needs one, so it logs in immediately afterward with the same credentials. |
| `/v1/auth/me` | GET | `meHandler` **then** `getUserHandler` | `AuthContext` alone lacks `name`; the second call fills it. Requires a valid Bearer token, same as `/api/auth/me`. |

**Sprint brief said `/v1/package/:slug` (singular).** The real frontend source (`tvv-new2-main/lib/api/config.ts`) defines `detail: (slug) => \`/v1/packages/${slug}\`` — plural, nested under `packages`. Implemented the **verified real path**, not the brief's shorthand, since the entire point of this layer is matching what the frontend's actual code calls. Flagging the discrepancy explicitly rather than silently deviating.

## DTO mappings

### Package (list & detail)

| Legacy `Package` field | Source | Note |
|---|---|---|
| `slug`, `title`, `durationDays`, `durationNights` | Direct 1:1 from `WebsitePackageSummaryDTO`/`DetailDTO` | — |
| `destination` | `destinationName` | — |
| `pricing.perAdult` | `fromPrice` (list) / `pricing.fromPrice ?? pricing.basePrice` (detail) | Defaults to `0` if Travel OS has no price yet. |
| `pricing.currency` | `currency` / `pricing.currency` | Defaults to `"INR"` if null. |
| `hero.image` | `heroImage` | Defaults to `""` if null — **no image CDN exists on either side yet** (docs/27 §Image Flow); expect empty images until that's built. |
| `hero.gallery` (detail only) | `gallery: string[]` | Mapped to `{url}[]`. |
| `itinerary[].city` (detail only) | *(no source)* | Defaults to the package's own destination name for every day — Travel OS's day DTO has no per-day city field. |
| `seo.*` (detail only) | `WebsiteSeoDTO` | Clean 1:1 mapping (`canonicalUrl`→`canonical`, etc.). |
| `region` | *(no source)* | **Always `"domestic"`** — Travel OS has no region/country-code concept on any package/destination DTO. Documented placeholder, not an inference. |
| `vendor` | *(no source)* | Always `{source: "manual", vendorName: "travel-os"}` — the closer of the frontend's two allowed values (`"manual"` \| `"tripjack"`). |
| `destinations[]` (pill list) | *(no source)* | Single pill: `{days: durationDays, city: destinationName}` — accurate at whole-trip granularity, not fabricated per-leg detail. |
| `rating`, `ratingCount`, `badges`, `themes`, `highlights`, `inclusions`, `exclusions`, `policy`, `audit` | *(no source)* | **Omitted** — every one is optional on the frontend type; Travel OS has no backing field for any of them. |

### Search

`WebsiteSearchResultDTO.results` → `packages[]` via the same package transformer. `destinations`/`guides` are always `[]` (Travel OS's search only ever searches packages).

### Auth

| Legacy field | Travel OS source | Note |
|---|---|---|
| `access_token` | `LoginResult.accessToken` | Renamed. `refreshToken`/`expiresIn` exist on Travel OS's side but the frontend doesn't read them yet — no data loss, just unused today. |
| `user.name` | `LoginResult.user.fullName` / `PublicUser.fullName` | Renamed. |
| `user.phone` | *(no source)* | **Always `null`** — Travel OS's `User` entity has no `phone` field at all. |
| `user.role` | `roles[0]` | Travel OS supports multiple roles per user; the frontend's `CustomerUser.role` is singular. Self-registered customers only ever hold `CUSTOMER`, so taking the first is safe for the accounts this endpoint actually serves — not a general-purpose multi-role reduction. |
| Register request `name` | → `fullName` | Structural rename only, in `toTravelOsRegisterInput()` — `AuthService.register()`'s own `validateRegister()` still owns all real validation. |
| Register request `phone` | *(dropped)* | No Travel OS field to store it in. |

## Unsupported endpoints

Six content types have zero Travel OS backend coverage (docs/26/29) and return a consistent `{success:false, error:{code:"NOT_IMPLEMENTED", message:"<Engine> is not implemented yet..."}}` at HTTP 501, using the already-existing `NotImplementedError` class:

| Engine | Legacy paths stubbed |
|---|---|
| Ferry | `/v1/ferry/routes`, `/v1/ferry/routes/{slug}`, `/v1/ferry/schedules`, `/v1/ferry/search` |
| Flights | `/v1/flights/search`, `/v1/flights/airports` |
| Guides | `/v1/guides`, `/v1/guides/{slug}` |
| Experiences | `/v1/experiences`, `/v1/experiences/{slug}` |
| Reviews | `/v1/reviews` |
| Calculator | `/v1/calculator/estimate` |

All 11 stub routes are public (no auth required) — an anonymous visitor browsing the live site should get a clean 501, not a 401, for content Travel OS doesn't model yet.

## Migration plan

1. **Repoint the frontend's `NEXT_PUBLIC_API_BASE_URL`** at this Travel OS deployment — no other frontend change is required for packages/search/auth, since the paths and shapes now match exactly what `lib/api/endpoints`/`lib/services/*` already call.
2. **Leave `NEXT_PUBLIC_USE_MOCK` handling as-is for Ferry/Flights/Guides/Experiences/Reviews/Calculator** — those services should stay on mock until each engine is genuinely built; the 501 stubs exist so a premature live-mode flip fails loudly and specifically instead of silently 404ing.
3. **The one necessary exception to "only the compatibility layer"**: `src/modules/auth/middleware/route-permission-map.ts` needed new entries — `/api/v1/auth/login`/`register` added to `PUBLIC_EXACT_PATHS`, and `/api/v1/packages`, `/api/v1/search`, and the six stub prefixes added to `PUBLIC_PREFIXES`. This is unavoidable: the middleware is fail-closed by design (nothing is public unless explicitly allow-listed here), so no new public endpoint — compatibility layer or otherwise — can exist without this file changing. `/api/v1/auth/me` was deliberately left out of both lists, preserving its authentication requirement. This is the only file touched outside `src/modules/frontend/` and the new route files themselves.
4. **`tsconfig.json`'s `exclude` gained `"tvv-new2-main"`** — a pre-existing gap from when that project was extracted into this repo for analysis (Sprint 13's prior phase); without it, `tsc --noEmit` tried to compile a separate Next.js project's files under this project's own config and failed with unrelated noise. Tooling hygiene, not a business or frontend code change.
5. **Region/theme package filtering, and destination/guide results in search, remain unsupported** — these need either new Website API query parameters/fields (a backend decision) or client-side post-filtering; this sprint only builds the passthrough, not new Website API surface.

## Verification

- `npx tsc --noEmit` — clean.
- `next build` — clean; all 15 new `/api/v1/*` routes present in the route manifest alongside the existing `/api/website/*` and admin routes.
- `npm test` — 26 files, 198 passed, 1 pre-existing expected fail (unrelated). No regressions.
- Live server, curl-verified end to end:
  - `GET /v1/packages` (no auth) → `200`, correct `{meta:{total,page,limit,totalPages}, data:[...]}` shape.
  - `GET /v1/packages/{slug}` (no auth) → `200`, correct `{package: {...}}` shape.
  - `GET /v1/search?q=...` (no auth) → `200`, correct `{query,packages,destinations:[],guides:[],totalCount}` shape.
  - `POST /v1/auth/register` → `200`, `{access_token, user:{id,email,name,phone:null,role:"CUSTOMER"}}` — confirmed the register→login composition works and the CUSTOMER role is present.
  - `GET /v1/auth/me` with the returned token → `200`, same user shape.
  - `POST /v1/auth/login` with the same credentials → `200`, fresh token.
  - `GET /v1/auth/me` with no token → `401 UNAUTHORIZED` (correctly still gated).
  - `GET /v1/ferry/routes` (no auth) → `501 NOT_IMPLEMENTED`.
  - `POST /v1/calculator/estimate` (no auth) → `501 NOT_IMPLEMENTED`.
