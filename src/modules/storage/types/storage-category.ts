export const StorageCategory = {
  PROFILE_IMAGE: "PROFILE_IMAGE",
  PACKAGE_IMAGE: "PACKAGE_IMAGE",
  DESTINATION_IMAGE: "DESTINATION_IMAGE",
  GALLERY_IMAGE: "GALLERY_IMAGE",
  INVOICE: "INVOICE",
  VOUCHER: "VOUCHER",
  PASSPORT: "PASSPORT",
  VISA: "VISA",
  INSURANCE: "INSURANCE",
  TRAVEL_DOCUMENT: "TRAVEL_DOCUMENT",
} as const;

export type StorageCategory = (typeof StorageCategory)[keyof typeof StorageCategory];

export const StorageVisibility = {
  PUBLIC: "PUBLIC",
  PRIVATE: "PRIVATE",
} as const;

export type StorageVisibility = (typeof StorageVisibility)[keyof typeof StorageVisibility];

/**
 * The one place category maps to visibility — every other file in this
 * module reads from here rather than re-deciding public/private per call
 * site. Images the public website already renders (profile/package/
 * destination/gallery) are public; every document category (invoices,
 * vouchers, passport/visa/insurance/travel documents) is private by
 * construction, matching docs/18's sensitivity classes exactly.
 */
export const CATEGORY_VISIBILITY: Record<StorageCategory, StorageVisibility> = {
  [StorageCategory.PROFILE_IMAGE]: StorageVisibility.PUBLIC,
  [StorageCategory.PACKAGE_IMAGE]: StorageVisibility.PUBLIC,
  [StorageCategory.DESTINATION_IMAGE]: StorageVisibility.PUBLIC,
  [StorageCategory.GALLERY_IMAGE]: StorageVisibility.PUBLIC,
  [StorageCategory.INVOICE]: StorageVisibility.PRIVATE,
  [StorageCategory.VOUCHER]: StorageVisibility.PRIVATE,
  [StorageCategory.PASSPORT]: StorageVisibility.PRIVATE,
  [StorageCategory.VISA]: StorageVisibility.PRIVATE,
  [StorageCategory.INSURANCE]: StorageVisibility.PRIVATE,
  [StorageCategory.TRAVEL_DOCUMENT]: StorageVisibility.PRIVATE,
};

/** The `{module}` segment of docs/18's `{module}/{entityId}/{purpose}-{uuid}.{ext}` key convention. */
export const CATEGORY_KEY_PREFIX: Record<StorageCategory, string> = {
  [StorageCategory.PROFILE_IMAGE]: "profiles",
  [StorageCategory.PACKAGE_IMAGE]: "packages",
  [StorageCategory.DESTINATION_IMAGE]: "destinations",
  [StorageCategory.GALLERY_IMAGE]: "gallery",
  [StorageCategory.INVOICE]: "bookings/invoices",
  [StorageCategory.VOUCHER]: "bookings/vouchers",
  [StorageCategory.PASSPORT]: "bookings/documents/passport",
  [StorageCategory.VISA]: "bookings/documents/visa",
  [StorageCategory.INSURANCE]: "bookings/documents/insurance",
  [StorageCategory.TRAVEL_DOCUMENT]: "bookings/documents/travel",
};
