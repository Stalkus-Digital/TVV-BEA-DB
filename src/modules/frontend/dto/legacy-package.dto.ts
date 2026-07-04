/**
 * Mirrors `lib/models/package.ts`'s `Package` type in the frontend
 * (tvv-new2-main), field for field — this is the shape
 * `packagesService.list()`/`getBySlug()` expect back from `/v1/packages`
 * and `/v1/packages/{slug}` in LIVE mode. Confirmed against the frontend's
 * own source (not inferred): `paginatedRows<Package>(body)` for the list
 * response and `pickField<Package>(body, "package")` for the detail
 * response — both assume rows already look like `Package`, not the raw
 * `ManualPackage`/`VendorPackage` shapes `fromManual`/`fromTripJack` only
 * ever run against mock data.
 *
 * Fields Travel OS has no source data for (rating, ratingCount, badges,
 * themes, highlights, inclusions, exclusions, policy, audit) are simply
 * omitted per package — every one of them is optional on the frontend
 * type, so omitting is safe, not a fabrication. See
 * docs/30_FRONTEND_COMPATIBILITY_LAYER.md for the full field-by-field
 * mapping and every documented gap.
 */

export interface LegacyDestinationPillDTO {
  days: number;
  city: string;
}

export interface LegacyPricingDTO {
  currency: string;
  perAdult: number;
  originalPerAdult?: number;
  pricingModel: "per-adult" | "per-couple" | "total";
  dynamic?: boolean;
}

export interface LegacyHeroDTO {
  image: string;
  alt?: string;
  gallery?: { url: string; alt?: string }[];
}

export interface LegacySeoMetaDTO {
  title?: string;
  description?: string;
  canonical?: string;
  ogImage?: string;
}

export interface LegacyItineraryDayDTO {
  day: number;
  title: string;
  city: string;
  description: string;
}

export interface LegacyPackageVendorRefDTO {
  source: "manual" | "tripjack";
  vendorName?: string;
}

/** The frontend's unified `Package` shape — never `ManualPackage`/`VendorPackage`. */
export interface LegacyPackageDTO {
  slug: string;
  vendor: LegacyPackageVendorRefDTO;
  title: string;
  destination: string;
  region: "domestic" | "international" | "andaman";
  durationDays: number;
  durationNights: number;
  pricing: LegacyPricingDTO;
  hero: LegacyHeroDTO;
  destinations: LegacyDestinationPillDTO[];
  itinerary?: LegacyItineraryDayDTO[];
  seo?: LegacySeoMetaDTO;
}

/** Matches `PaginatedPayload<T>` in the frontend's `lib/api/envelope.ts` exactly — `meta.limit`, not `pageSize`. */
export interface LegacyPackageListResponseDTO {
  meta: { total: number; page: number; limit: number; totalPages?: number };
  data: LegacyPackageDTO[];
}

/** Matches `pickField<Package>(body, "package")` — the detail response's inner shape. */
export interface LegacyPackageDetailResponseDTO {
  package: LegacyPackageDTO;
}
