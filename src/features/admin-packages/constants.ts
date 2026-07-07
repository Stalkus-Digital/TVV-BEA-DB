export const PackageStatus = {
  DRAFT: "DRAFT",
  PUBLISHED: "PUBLISHED",
  ARCHIVED: "ARCHIVED",
} as const;

export type PackageStatus = (typeof PackageStatus)[keyof typeof PackageStatus];

export const PackageSourceType = {
  MANUAL: "MANUAL",
  DYNAMIC: "DYNAMIC",
  AI_GENERATED: "AI_GENERATED",
  SUPPLIER: "SUPPLIER",
  MIXED: "MIXED",
  SEMBARK: "SEMBARK",
  TRIPJACK: "TRIPJACK",
} as const;

export type PackageSourceType = (typeof PackageSourceType)[keyof typeof PackageSourceType];

export const PACKAGE_STATUS_LABELS: Record<PackageStatus, string> = {
  DRAFT: "Draft",
  PUBLISHED: "Published",
  ARCHIVED: "Archived",
};

export const PACKAGE_SOURCE_TYPE_LABELS: Record<PackageSourceType, string> = {
  MANUAL: "Manual",
  DYNAMIC: "Dynamic",
  AI_GENERATED: "AI Generated",
  SUPPLIER: "Supplier",
  MIXED: "Mixed",
  SEMBARK: "Sembark Sync",
  TRIPJACK: "TripJack Sync",
};

/** Category column maps to sourceType — no dedicated category field on Package. */
export const PACKAGE_CATEGORY_LABELS = PACKAGE_SOURCE_TYPE_LABELS;

export const EDITABLE_PACKAGE_STATUSES: PackageStatus[] = [PackageStatus.DRAFT, PackageStatus.PUBLISHED];

export const DEFAULT_LIST_COMPUTE_PAX = { adults: 2 } as const;
