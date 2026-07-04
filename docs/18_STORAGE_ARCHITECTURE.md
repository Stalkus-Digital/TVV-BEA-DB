# 18 — Storage Architecture

**Status:** Phase 2 — architecture plan only, no code implemented. No blob/file storage exists anywhere in this project. Every field that should eventually hold a real uploaded file is currently a plain string URL with no upload mechanism behind it, or explicitly null by construction.

## Current State — Every Storage Gap, Enumerated

| Field | Module | Current state |
|---|---|---|
| `PassengerDocument.fileUrl` | Booking | Always `null` — explicitly flagged as "reserved but inert" in `docs/08`; no storage exists to point it at |
| `Destination.gallery[].url` | Destination | A plain string field — accepted as-is on `addGalleryImage()`, no upload path, caller must already have a hosted URL |
| `PackageItem.images` | Package | Same pattern — string array, no upload path |
| `WebsitePackageDetailDTO.gallery` / `heroImage` | Website | Derived from the above — inherits the same gap one layer up |
| `Destination.seo.ogImageUrl`, `Package.seo.ogImageUrl` | Destination, Package | Same pattern |
| `BookingVoucher` / `BookingInvoice` | Booking | Structured data models only, explicitly "no PDF library yet" — there is no *file* to store at all today, only the data that would eventually render into one |

This is a consistent, deliberate pattern (not an oversight in any one module) — every module that touches an image or document field was built "reserved but inert," the same discipline applied to `Package.aiGeneratedFromId` and `Quote.convertedBookingId`. This document is where that reservation gets a concrete plan.

## Recommended Approach: Vercel Blob

This project is already deployed on Vercel (confirmed by the presence of Vercel-specific tooling in this environment). Vercel Blob is the natural fit: it supports both **public** storage (gallery images, OG images — content meant to be publicly served on the website) and **private** storage (passport/visa scans, invoices — content that must never be publicly reachable by URL guessing), which maps directly onto the two real sensitivity classes already present in the data above. This avoids standing up a separate S3 account/IAM policy for a project that's otherwise fully within the Vercel platform.

## Design

### A New Shared Port, Following Website's Own Precedent

Website's `cache/website-cache.port.ts` established the pattern this project already uses for "define the interface now, implement it when there's a real backing store": an interface with no concrete implementation, registered nowhere, until the day it's needed. Storage should follow the identical shape, but as a **shared** capability (`src/shared/storage/`, not module-owned) since Destination, Package, and Booking all need it independently and it is not business logic — it is infrastructure, the same category as Logger/Config/DI:

```ts
// src/shared/storage/storage.types.ts
interface UploadResult {
  url: string;
  key: string;
  size: number;
  contentType: string;
}

interface StorageService {
  upload(file: Buffer | ReadableStream, options: { key: string; contentType: string; visibility: "public" | "private" }): Promise<Result<UploadResult, AppError>>;
  getSignedUrl(key: string, expiresInSeconds: number): Promise<Result<string, AppError>>;  // for private files
  delete(key: string): Promise<Result<void, AppError>>;
}
```

A `VercelBlobStorageService` implementation lives behind this interface, registered once in the shared DI container (not per-module) — the same "swap the implementation behind the interface, not every call site" principle `docs/CODING_CONVENTIONS.md` already states for Logger and Config.

### Key Naming Convention

`{module}/{entityId}/{purpose}-{uuid}.{ext}`, e.g.:
- `bookings/{bookingId}/travellers/{travellerId}/passport-{uuid}.pdf` (private)
- `destinations/{destinationId}/gallery/{uuid}.jpg` (public)
- `packages/{packageId}/items/{itemId}/{uuid}.jpg` (public)
- `bookings/{bookingId}/vouchers/{voucherNumber}.pdf` (private, once PDF rendering exists — see below)

### Upload Flow

Two options, both compatible with the existing API-first discipline:
1. **Presigned/direct upload** (recommended for gallery/passenger-document images): the client requests a signed upload URL from a new thin endpoint (e.g. `POST /api/bookings/:id/documents/upload-url`), uploads directly to Blob storage from the browser, then calls the existing `POST /api/bookings/:id/documents` with the resulting `fileUrl` — the file bytes never transit through the Next.js server, matching how a real admin UI would want this to work.
2. **Server-side upload** (simpler, acceptable for low-volume admin use): the existing `POST /api/bookings/:id/documents` endpoint accepts multipart form data instead of/alongside JSON, uploads to Blob server-side, then persists the resulting `fileUrl` — fine for the current single-file-at-a-time admin flows, avoids building a second endpoint per upload site.

Recommend starting with option 2 for simplicity (fewer new routes, works with the existing validation pattern in `validation/document.validation.ts` with minimal change) and revisiting option 1 only if upload volume or file size becomes a real bottleneck.

### PDF Rendering (Voucher/Invoice) — Explicitly Out of Scope Here

Both `docs/08` and `docs/14` were explicit: "no PDF library yet." This document defines where a rendered PDF would eventually be *stored* (private Blob storage, same as passport documents), not how it would be *generated* — that remains a deliberate future decision (a library like `@react-pdf/renderer` or a headless-Chrome-based renderer are the two realistic options), not assumed here.

## Data Model Changes (additive, per `docs/16`'s migration discipline)

- `PassengerDocument`: `fileUrl` becomes a real value once uploaded; add `fileSize: number | null`, `contentType: string | null` (currently absent from the type entirely).
- `Destination.gallery[]` / `PackageItem.images`: no schema change needed — these are already string-URL fields; only the *source* of the string changes (Blob URL instead of an externally-hosted one a caller previously had to already have).

## What This Plan Does Not Cover

- CDN/image-optimization pipeline (Next.js's built-in `next/image` can point at Blob URLs directly without additional infrastructure — no separate CDN decision needed).
- Virus/malware scanning on passenger document uploads — worth a follow-up decision once real uploads are live, not blocking the initial implementation.
- File retention/deletion policy for cancelled bookings' documents — a data-retention/compliance question for the business, not an architecture question this document can answer unilaterally.
