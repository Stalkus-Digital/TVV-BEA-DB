import type { PackageTripType } from "../constants/trip-type";

export const PackageStatus = {
  DRAFT: "DRAFT",
  PUBLISHED: "PUBLISHED",
  ARCHIVED: "ARCHIVED",
} as const;

export type PackageStatus = (typeof PackageStatus)[keyof typeof PackageStatus];

/**
 * Derived/denormalized label, not five different data shapes — same
 * resolution-mode-per-item principle as the root-level PACKAGE_BUILDER.md
 * draft. Set by whichever Builder (see ../builders/) constructed the
 * package: MANUAL = every item PINNED, DYNAMIC = every item SLOT,
 * AI_GENERATED/SUPPLIER = sourced from a (non-live, this sprint) AI/Supplier
 * draft input, MIXED = an explicit combination.
 */
export const PackageSourceType = {
  MANUAL: "MANUAL",
  DYNAMIC: "DYNAMIC",
  AI_GENERATED: "AI_GENERATED",
  SUPPLIER: "SUPPLIER",
  MIXED: "MIXED",
} as const;

export type PackageSourceType = (typeof PackageSourceType)[keyof typeof PackageSourceType];

export interface PackageSeo {
  metaTitle?: string;
  metaDescription?: string;
  canonicalUrl?: string;
  ogImageUrl?: string;
  focusKeyword?: string;
}

export interface PackageFaqEntry {
  id: string;
  question: string;
  answer: string;
  position: number;
}

/**
 * The core business object per this sprint's brief ("Everything sold by TVV
 * is ultimately a Package"). Holds no embedded Days/Items/Pricing/Rules —
 * those are their own repositories (see ../repositories/), same reasoning
 * as Inventory: a package can have many days, each with many items, too
 * large/numerous to embed the way Destination's small FAQ/gallery arrays
 * are. SEO and FAQ *are* embedded here, matching Destination's exact
 * precedent (small, always-accessed-with-parent collections).
 *
 * PackageTemplate is not a separate entity/repository — it's this same
 * type with isTemplate=true. A distinct table would duplicate this one;
 * `sourceTemplateId` tracks lineage when cloned from a template. Flagged as
 * a scope decision, not silently assumed — see docs/07_PACKAGE_BUILDER.md.
 */
export interface Package {
  id: string;
  title: string;
  code: string;
  slug: string;
  destinationId: string;
  sourceType: PackageSourceType;
  tripType: PackageTripType | null;
  durationDays: number;
  durationNights: number;
  durationText: string | null;
  isTemplate: boolean;
  sourceTemplateId: string | null;
  aiGeneratedFromId: string | null;
  status: PackageStatus;
  isStaffPick: boolean;
  flightsIncluded: boolean;
  currentVersionId: string | null;
  seo: PackageSeo;
  faqs: PackageFaqEntry[];
  createdAt: string;
  updatedAt: string;
  content?: any;
}

export type PackageTemplate = Package;
