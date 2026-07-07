/**
 * Package domain model.
 *
 * `Package` is the unified, frontend-facing shape that every package card and detail
 * page consumes. It is built by normalising one of two raw sources:
 *
 *   ManualPackage   ─┐
 *                    ├─►  adapters/*  ─►  Package (UnifiedPackage)
 *   VendorPackage  ──┘
 *
 * Components NEVER consume `ManualPackage` or `VendorPackage` directly — they
 * receive `Package`.
 */

import type {
  AuditFields,
  CardBadge,
  DestinationPill,
  Hero,
  PackageSource,
  Pricing,
  Region,
  SeoMeta,
} from "./common";

/* ============================================================
   UNIFIED — frontend-facing
   ============================================================ */

export interface ItineraryDay {
  day: number;
  title: string;
  city: string;
  description: string;
  stay?: string;
  meals?: string;
  highlights?: string[];
}

export interface Policy {
  cancellation?: string;
  payment?: string;
  refund?: string;
  bookingTerms?: string[];
}

export interface PackageVendorRef {
  source: PackageSource;
  externalId?: string;
  vendorName?: string;
  vendorUrl?: string;
}

export interface Package {
  /** URL-safe identifier — primary key in the frontend. */
  slug: string;

  /** Source provenance — never null. */
  vendor: PackageVendorRef;

  title: string;
  subtitle?: string;
  description?: string;

  destination: string;
  region: Region;
  countryCode?: string;

  durationDays: number;
  durationNights: number;

  rating?: number;
  ratingCount?: number;

  pricing: Pricing;
  hero: Hero;

  destinations: DestinationPill[];

  badges?: CardBadge[];
  themes?: string[];

  highlights?: string[];
  inclusions?: string[];
  exclusions?: string[];
  itinerary?: ItineraryDay[];

  policy?: Policy;
  seo?: SeoMeta;
  audit?: AuditFields;

  /** Future-ready: dynamic pricing hook, AI itinerary hook, etc. */
  flags?: {
    dynamicPricing?: boolean;
    aiCustomisable?: boolean;
    instantConfirm?: boolean;
    soldOut?: boolean;
  };
}

/* ============================================================
   RAW SOURCES — never consumed by components
   ============================================================ */

/**
 * `ManualPackage` is the shape we author internally — typically through a CMS
 * (Sanity) or admin dashboard. Adapter: adapters/manual.adapter.ts
 */
export interface ManualPackage {
  slug: string;
  title: string;
  subtitle?: string;
  description?: string;
  destination: string;
  region: Region;
  durationDays: number;
  durationNights: number;
  priceCurrent: number;
  priceOriginal?: number;
  currency?: "INR" | "USD";
  image: string;
  gallery?: string[];
  destinations: DestinationPill[];
  rating?: number;
  ratingCount?: number;
  badges?: CardBadge[];
  themes?: string[];
  highlights?: string[];
  inclusions?: string[];
  exclusions?: string[];
  cancellationPolicy?: string;
  audit?: AuditFields;
}

/**
 * `VendorPackage` mirrors a third-party vendor response shape (selected fields).
 * Normalised to `Package` via a vendor adapter when a public vendor API exists.
 */
export interface VendorPackage {
  // TripJack identifiers
  packageId: string;
  vendorPackageCode: string;
  vendorName: "tripjack" | string;

  // Core
  packageName: string;
  shortDescription?: string;
  longDescription?: string;

  // Locations
  destinationName: string;
  countryCode?: string;
  cities?: { cityName: string; nights: number }[];

  // Schedule
  totalDays: number;
  totalNights: number;

  // Pricing (vendor sends raw numbers in paise/cents-style minor units sometimes)
  priceInfo: {
    sellingPricePerAdult: number;
    publishedPricePerAdult?: number;
    currency: "INR" | "USD" | string;
    taxesIncluded?: boolean;
  };

  // Media
  thumbnailUrl: string;
  images?: string[];

  // Itinerary
  itinerary?: {
    dayNo: number;
    title: string;
    cityName: string;
    description: string;
    hotelName?: string;
    mealsIncluded?: string;
  }[];

  // What's covered
  inclusions?: string[];
  exclusions?: string[];
  highlights?: string[];

  // Tags
  themes?: string[];
  tags?: string[];

  // Policies
  cancellationPolicy?: string;
  paymentPolicy?: string;

  // Ratings if vendor provides
  rating?: number;
  reviewCount?: number;

  // Vendor metadata
  lastSyncedAt?: string;
  vendorDetailUrl?: string;
}
