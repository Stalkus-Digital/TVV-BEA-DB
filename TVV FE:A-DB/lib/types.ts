/**
 * @deprecated — Import from `@/lib/models` instead. This file remains as a
 * compatibility shim while the codebase migrates off the legacy `TourPackage`
 * shape onto the unified `Package` model.
 *
 * Mapping:
 *   TourPackage      →  Package          (use the unified model)
 *   DestinationPill  →  models/common
 *   CardBadge        →  models/common
 *   Destination      →  models/destination
 *   Experience       →  models/experience
 *   Guide / Reel /
 *     AndamanTileItem →  models/guide
 *   Review / FAQ     →  models/review, models/faq
 */

export type {
  CardBadge,
  DestinationPill,
  Destination,
  Experience,
  Guide,
  Reel,
  AndamanTileItem,
  Review,
  FAQ,
  Package,
} from "./models";

import type { Package } from "./models";

/**
 * Legacy flat-shape alias. New code: import `Package` from `@/lib/models`.
 */
export type TourPackage = Package & {
  priceCurrent: number;
  priceOriginal?: number;
  image: string;
  gallery?: string[];
};