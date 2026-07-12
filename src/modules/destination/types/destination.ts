export const DestinationStatus = {
  DRAFT: "DRAFT",
  ACTIVE: "ACTIVE",
  ARCHIVED: "ARCHIVED",
} as const;

export type DestinationStatus = (typeof DestinationStatus)[keyof typeof DestinationStatus];

export interface DestinationSeo {
  metaTitle?: string;
  metaDescription?: string;
  canonicalUrl?: string;
  ogImageUrl?: string;
  focusKeyword?: string;
}

export interface DestinationFaqEntry {
  id: string;
  question: string;
  answer: string;
  position: number;
}

export interface DestinationGalleryImage {
  id: string;
  url: string;
  altText?: string;
  position: number;
}

/**
 * The primary business object per docs/00/02 ("Destination is the highest
 * level business object. Everything belongs to a destination"). Deliberately
 * holds NO copy of hotel/flight/activity data — "Do NOT duplicate Inventory.
 * Reference Inventory IDs only" is satisfied by having nothing here that
 * COULD duplicate Inventory: this module has zero imports from
 * src/modules/inventory (verified after build, same isolation discipline as
 * Supplier Engine). Guides are reference-only (guideReferenceIds) since CMS
 * doesn't exist yet (Sprint 9) — not a real integration, just IDs reserved
 * for one.
 */
export interface Destination {
  id: string;
  name: string;
  slug: string;
  countryId: string | null;
  stateId: string | null;
  cityId: string | null;
  regionId: string | null;
  parentDestinationId: string | null;
  categoryIds: string[];
  description: string | null;
  isFeatured: boolean;
  latitude: number | null;
  longitude: number | null;
  seo: DestinationSeo;
  gallery: DestinationGalleryImage[];
  faqs: DestinationFaqEntry[];
  guideReferenceIds: string[];
  status: DestinationStatus;
  createdAt: string;
  updatedAt: string;
}

export interface DestinationBreadcrumb {
  id: string;
  name: string;
  slug: string;
}
