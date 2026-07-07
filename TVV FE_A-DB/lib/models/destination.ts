import type { GeoPoint, MediaAsset, Region, SeoMeta } from "./common";

export interface Destination {
  slug: string;
  name: string;
  tagline: string;
  description?: string;
  region: Region;
  continent?: string;
  countryCode?: string;
  geo?: GeoPoint;
  startsFrom: number;
  currency?: "INR" | "USD";
  image: string;
  heroImage?: string;
  gallery?: MediaAsset[];
  /** Slug aliases — useful when re-routing legacy URLs (e.g. /destinations/andamans → /andaman). */
  aliases?: string[];
  seo?: SeoMeta;
  /** True for the destinations TVV positions as authority hubs (Andaman). */
  isAuthorityHub?: boolean;
}
