/**
 * Shared primitive types used across multiple domain models.
 *
 * These do not import from any other model file — they are leaves of the dependency graph.
 */

export type Region = "domestic" | "international" | "andaman";

export type Currency = "INR" | "USD" | "EUR" | "GBP" | "AED" | "SGD" | "JPY" | "THB";

export type CardBadge =
  | "flights-included"
  | "flash-sale"
  | "limited-seats"
  | "staff-pick"
  | "exclusive"
  | "new"
  | "verified";

export type PackageSource = "manual" | "tripjack";

export interface DestinationPill {
  days: number;
  city: string;
}

export interface PricingBreakdown {
  basePerAdult: number;
  taxes?: number;
  discount?: number;
  feesIncluded?: boolean;
}

export interface Pricing {
  currency: Currency;
  perAdult: number;
  originalPerAdult?: number;
  pricingModel: "per-adult" | "per-couple" | "total";
  dynamic?: boolean;
  validUntil?: string;
  breakdown?: PricingBreakdown;
}

export interface MediaAsset {
  url: string;
  alt?: string;
  width?: number;
  height?: number;
  caption?: string;
}

export interface Hero {
  image: string;
  alt?: string;
  gallery?: MediaAsset[];
  video?: string;
}

export interface SeoMeta {
  title?: string;
  description?: string;
  keywords?: string[];
  canonical?: string;
  ogImage?: string;
}

export interface AuditFields {
  createdAt?: string;
  updatedAt?: string;
  publishedAt?: string;
  vendorSyncedAt?: string;
}

export interface GeoPoint {
  lat: number;
  lng: number;
}
