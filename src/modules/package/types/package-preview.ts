import type { Package } from "./package";
import type { PackageDay } from "./package-day";
import type { PackageItem } from "./package-item";
import type { PackagePricing } from "./package-pricing";
import type { PackageRule } from "./package-rule";

export interface PackageDayWithItems extends PackageDay {
  items: PackageItem[];
}

/**
 * The assembled, read-only view of a full package — used by both preview()
 * (no side effect) and publish() (the same shape becomes the frozen
 * PackageVersion.snapshot). One assembly function, two callers.
 */
export interface PackagePreview {
  package: Package;
  days: PackageDayWithItems[];
  pricing: PackagePricing | null;
  rules: PackageRule | null;
}
