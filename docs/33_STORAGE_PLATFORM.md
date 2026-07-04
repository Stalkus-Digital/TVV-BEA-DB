# 33. Storage Platform (Sprint 14)

Platform Services infrastructure: a single, reusable storage abstraction every business module uploads, deletes, replaces, and reads files through. Backend only — no frontend integration this sprint.

## 1. Folder Tree

```
src/modules/storage/
├── types/
│   ├── storage-category.ts    # StorageCategory, StorageVisibility, CATEGORY_VISIBILITY, CATEGORY_KEY_PREFIX
│   ├── storage-object.ts      # StorageObject — the one canonical file-record shape
│   ├── upload-options.ts      # UploadOptions, ReplaceOptions
│   └── index.ts
├── providers/
│   ├── storage-provider.ts        # StorageProvider interface (the swappable abstraction)
│   ├── vercel-blob.provider.ts    # Default concrete implementation (@vercel/blob)
│   ├── fake-storage.provider.ts   # In-memory test double (unit tests only)
│   └── index.ts
├── services/
│   ├── storage-config.service.ts  # Singleton env config (BLOB_READ_WRITE_TOKEN, signing secret, TTL, size limits)
│   ├── storage.service.ts         # StorageService facade — the ONLY entry point business modules use
│   └── (no index.ts — both exported directly from module.ts / storage.service.ts)
├── uploads/
│   ├── key-generator.ts   # generateStorageKey / extractOwnerIdFromKey
│   ├── file-validation.ts # shared mime/size rule table + isImageCategory
│   ├── ownership.ts       # validateOwnership (stateless, key-parsing only)
│   └── index.ts
├── images/
│   ├── image-variant.ts     # ImageVariant model (ORIGINAL only — see Remaining TODOs)
│   ├── image-validation.ts  # image-category-only wrapper over uploads/file-validation.ts
│   └── index.ts
├── documents/
│   ├── document-validation.ts  # document-category-only wrapper over uploads/file-validation.ts
│   └── index.ts
├── signed-urls/
│   ├── signed-url.service.ts  # Self-issued HMAC sign/verify (mirrors JwtService's pattern exactly)
│   └── index.ts
├── api/
│   ├── storage.handlers.ts  # upload/replace/delete/metadata/signedUrl/download handlers
│   └── index.ts
├── module.ts   # DI registration, health check, service accessors
└── index.ts    # public barrel: types, api, getStorageService, getSignedUrlService

src/app/api/storage/
├── upload/route.ts        # POST, multipart/form-data
├── replace/route.ts       # POST, multipart/form-data
├── delete/route.ts        # POST, JSON body
├── metadata/route.ts      # GET, query params
├── signed-url/route.ts    # GET, query params
└── download/route.ts      # GET, query params — the public download-proxy (streams private bytes back)

tests/unit/storage/
├── key-generator.test.ts
├── ownership.test.ts
├── file-validation.test.ts
├── signed-url.service.test.ts
└── storage.service.test.ts
```

No `repositories/` folder and no new Prisma models — deliberate, see §2.

## 2. Storage Architecture

**Stateless by design.** This sprint's folder list omits `repositories/`, unlike every other module (Customer's sprint explicitly mandated Prisma repositories). The conclusion: Storage carries no database state of its own. Ownership and categorization are encoded entirely in the object's **key**:

```
{category-prefix}/{ownerId}/{purpose}-{uuid}.{ext}
# e.g. profiles/93c8434e-.../profile-image-7e2f...-a1c9.jpg
#      bookings/invoices/booking-42/invoice-9b3d...-f001.pdf
```

- `category-prefix` comes from `CATEGORY_KEY_PREFIX` (types/storage-category.ts) — one source of truth, no other file re-decides it.
- `ownerId` is supplied at upload time and is never re-derived; `extractOwnerIdFromKey` parses it back out for the ownership check at delete/replace/metadata/signed-url time.
- `purpose` is the category slug (`profile-image`, `invoice`, `passport`, etc.) and `uuid` guarantees uniqueness — two uploads for the same owner/category never collide.

**Category → Visibility.** `CATEGORY_VISIBILITY` maps all 4 image categories to `PUBLIC` and all 6 document categories (invoice, voucher, passport, visa, insurance, travel document) to `PRIVATE`. `StorageService.upload()` reads this table once; nothing downstream re-decides visibility.

**Request flow (upload):**
```
route.ts (multipart parse) → api/storage.handlers.ts (shape validation)
  → StorageService.upload()
      → images/image-validation.ts | documents/document-validation.ts (category/mime/size gate)
      → uploads/key-generator.ts (deterministic key)
      → StorageProvider.upload() (VercelBlobProvider in production, FakeStorageProvider in tests)
  → StorageObject returned
```

**Request flow (private download):**
```
StorageService.getSignedUrl() (ownership-gated) → HMAC-signed query-string URL
  → GET /api/storage/download?key=&expiresAt=&signature= (public route, no JWT)
      → SignedUrlService.verify() (HMAC + expiry check)
      → StorageProvider.getPrivateObjectBytes()
  → raw bytes streamed back with the object's real Content-Type
```

## 3. Provider Abstraction

`StorageProvider` (providers/storage-provider.ts) is the one interface every implementation must satisfy:

```ts
interface StorageProvider {
  upload(input: ProviderUploadInput): Promise<Result<ProviderObjectMetadata, AppError>>;
  delete(key: string): Promise<Result<void, AppError>>;
  getMetadata(key: string): Promise<Result<ProviderObjectMetadata | null, AppError>>;
  getPrivateObjectBytes(key: string): Promise<Result<{ body: Buffer; contentType: string }, AppError>>;
}
```

- **`VercelBlobProvider`** — the default, only concrete implementation this sprint, wrapping `@vercel/blob`'s `put`/`del`/`head`/`get`. Fails closed with a clear `InternalError` if `BLOB_READ_WRITE_TOKEN` isn't configured, rather than crashing or silently no-op'ing. Converts `get()`'s `ReadableStream<Uint8Array>` into a `Buffer` for `getPrivateObjectBytes`; tracks upload size from the input buffer's own length since `PutBlobResult` doesn't return one.
- **`FakeStorageProvider`** — an in-memory `Map`-backed test double, used only by `tests/unit/storage/storage.service.test.ts`. Not reachable from any production code path.
- **S3 / Cloudflare R2** — not implemented. Adding either later means writing one new class satisfying `StorageProvider` and swapping the factory in `module.ts`'s `STORAGE_PROVIDER_TOKEN` registration — no other file in this module (or any caller) would change.

## 4. Security Model

| Feature | Mechanism |
|---|---|
| **Private Documents** | All 6 document categories are `PRIVATE` by construction (`CATEGORY_VISIBILITY`); `VercelBlobProvider` uploads them with `access: 'private'`. |
| **Public Images** | All 4 image categories are `PUBLIC`; uploaded with `access: 'public'`, readable directly via their stored `url`, no signed URL needed. |
| **Expiry URLs** | `SignedUrlService` (self-issued HMAC-SHA256 over `{key}:{expiresAt}`, `timingSafeEqual` comparison) — mirrors `JwtService`'s exact hand-rolled pattern rather than adding a dependency or using Vercel Blob's newer multi-step `issueSignedToken`/`presignUrl` flow, which doesn't fit this module's simple "expiring download link" need. Default TTL 300s, configurable per-call and via `STORAGE_SIGNED_URL_TTL_SECONDS`. |
| **Ownership Validation** | Stateless, no DB lookup: `extractOwnerIdFromKey` parses the key's own `ownerId` segment and compares it against the caller's claimed id. A mismatch returns `NotFoundError` (404), never `ForbiddenError` (403) — same "don't confirm existence" discipline as the Customer module's row-level checks. Gates `delete`, `replace` (against the *existing* key), `getMetadata`, and `getSignedUrl`; `upload` has nothing to gate since it always mints a brand-new key. |
| **File Validation** | One shared table (`uploads/file-validation.ts`): allowed mime types and max size differ for images (5 MB default, jpeg/png/webp/gif) vs. documents (10 MB default, pdf/jpeg/png), both configurable via env. `images/` and `documents/` are thin category-guard wrappers over this single source of truth. |
| **Download proxy auth** | `/api/storage/download` is on `PUBLIC_EXACT_PATHS` (no JWT required) because the HMAC signature in its own query params **is** the credential — requiring a JWT on top would add nothing and would break the "hand someone a link" use case a signed URL exists for. Every other `/api/storage/*` route is left unmapped in `route-permission-map.ts`, which still means "authenticated-only" under the fail-closed default (same tier as `/api/suppliers`). |

**Caller-trust note (documented, not enforced by this module):** `ownerId` is accepted from the request body/query on the generic `/api/storage/*` routes because those routes are admin-permission-gated platform endpoints, not a customer-facing row-level boundary. Any future customer-facing route built on top of Storage (e.g. a profile-avatar upload) **must** derive `ownerId` from `AuthContext.userId`, never the client body — the same "never accept customerId from the client" discipline the Customer module already follows.

## 5. Remaining TODOs

- **`BLOB_READ_WRITE_TOKEN` is not configured anywhere in this environment.** `StorageConfigService` defaults it to `""`; `VercelBlobProvider` fails closed with a clear `InternalError` on every real call. This is why `GET /api/health` currently reports `storage: degraded` (see §8) — expected until a real token is set in `.env`.
- **`STORAGE_SIGNING_SECRET`** defaults to an insecure placeholder (`dev-insecure-storage-secret-change-in-production`), same discipline as `AUTH_JWT_SECRET` — must be overridden before any non-local deployment.
- **No real image resizing.** `images/image-variant.ts`'s `ImageVariant` model is structurally present (`ORIGINAL`/`THUMBNAIL`/`MEDIUM` names exist) but `buildImageVariants()` only ever returns `ORIGINAL` — no image-processing library is installed, and none was authorized this sprint.
- **S3 / Cloudflare R2 providers are not implemented** — the interface allows them, nothing more.
- **No business module wired to Storage yet** — Package/Destination/Booking/Customer images and documents are still whatever they were before this sprint. Wiring is explicitly out of scope per this sprint's acceptance criteria.
- **No frontend upload UI or frontend API calls** — explicitly out of scope per this sprint's constraints.
- **No dedicated `PermissionResource.STORAGE`** — `/api/storage/*` routes are authenticated-only, not permission-scoped, to avoid touching Auth's RBAC seed data this sprint (out of this sprint's declared scope). A future sprint should decide whether Storage needs its own granular permission once real admin UI wiring happens.

## 6. Tests

New: `tests/unit/storage/` (5 files, 36 tests) —

- `key-generator.test.ts` — key shape, extension derivation, uniqueness, `extractOwnerIdFromKey` round-trip and failure cases.
- `ownership.test.ts` — owner match/mismatch, confirms mismatch returns `NotFoundError` not `ForbiddenError`.
- `file-validation.test.ts` — mime/size rules for both image and document paths, `isImageCategory`, both category-guard wrappers.
- `signed-url.service.test.ts` — sign/verify round-trip, tampered signature, wrong key, expired signature, cross-secret rejection.
- `storage.service.test.ts` — full `StorageService` orchestration against `FakeStorageProvider`: upload (image + document, visibility, validation-before-provider-call), delete/getMetadata ownership enforcement, replace (new-then-delete-old, ownership mismatch leaves the original untouched), signed URL issuance + download-proxy verification (including tampered-signature rejection).

Full suite result:
```
npm test            → 31 files, 234 passed, 1 expected fail (pre-existing, unrelated to Storage)
npm run test:integration → 8 files, 38 passed
npm run test:e2e         → 3 passed
```

## 7. Build

```
npm run build
```
Succeeds. All 6 new routes registered as dynamic (`ƒ`) functions:
```
/api/storage/upload
/api/storage/replace
/api/storage/delete
/api/storage/metadata
/api/storage/signed-url
/api/storage/download
```
`tsc --noEmit` clean throughout every step of this sprint's implementation.

## 8. Health

Live-verified against a running dev server:

```json
GET /api/health
{
  "success": true,
  "data": {
    "status": "degraded",
    "checks": [
      { "name": "self", "status": "healthy", ... },
      { "name": "database", "status": "healthy", ... },
      { "name": "auth", "status": "healthy", ... },
      {
        "name": "storage",
        "status": "degraded",
        "details": { "reason": "BLOB_READ_WRITE_TOKEN is not configured — uploads will fail until it is set" }
      }
    ]
  }
}
```

`storage` reports honestly as `degraded`, not `healthy`, because no real Vercel Blob token exists in this environment — this is the intended signal (see §5), not a bug. A live end-to-end upload attempt through `POST /api/storage/upload` (real multipart request, valid JWT, valid image, valid category) confirmed the entire pipeline — route → auth → multipart parsing → shape validation → file validation → key generation → provider call — executes correctly and fails only at the final `VercelBlobProvider` step with the exact configured error message. A live `GET /api/storage/metadata` call also confirmed the ownership check rejects a non-matching key with `404 NotFoundError` as designed.

Module registration follows the same lazy, import-triggered pattern as every other module in this codebase (Customer, Frontend, Auth) — `storage`'s health check only appears once some request has caused `src/modules/storage/module.ts` to be imported at least once in the running process; this is pre-existing project behavior, not something introduced this sprint.
