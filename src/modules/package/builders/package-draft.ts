import type { PackageItemKind, PackageItemPricingMode, PackageItemResolutionMode } from "../types/package-item";
import type { PackageSourceType } from "../types/package";

export interface PackageDraftItemInput {
  kind: PackageItemKind;
  resolutionMode?: PackageItemResolutionMode;
  inventoryItemId?: string | null;
  destinationReferenceId?: string | null;
  slotCriteria?: Record<string, unknown> | null;
  title: string;
  description?: string | null;
  timeOfDay?: string | null;
  notes?: string | null;
  images?: string[];
  pricingMode?: PackageItemPricingMode;
  addonPrice?: number | null;
}

export interface PackageDraftDayInput {
  dayNumber: number;
  title: string;
  description?: string | null;
  destinationId?: string | null;
  items: PackageDraftItemInput[];
}

/**
 * The one shape every builder converts its specific input into — this is
 * what makes five builders one orchestration path (package-draft-builder.ts)
 * instead of five parallel persistence implementations.
 */
export interface PackageDraft {
  title: string;
  code?: string;
  slug?: string;
  destinationId: string;
  durationDays: number;
  durationNights: number;
  sourceType: PackageSourceType;
  aiGeneratedFromId?: string | null;
  days: PackageDraftDayInput[];
}
