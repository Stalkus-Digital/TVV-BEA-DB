/**
 * PackageItemKind covers everything a package can contain. Mirrors
 * Inventory's InventoryKind for the six kinds that actually reference
 * Inventory, plus two that don't: DESTINATION (references Destination
 * Engine) and MEALS (package-internal, no external reference).
 *
 * Naming note, same decision as Inventory (Sprint 2) and Supplier
 * (Sprint 3): the brief lists "Transfer" and "Ferry" separately — kept as
 * one TRANSFER kind here too, matching Inventory's TRANSFER(mode=FERRY|ROAD)
 * design in CLAUDE.md's Business Objects glossary, not a 7th/9th kind.
 */
export const PackageItemKind = {
  DESTINATION: "DESTINATION",
  HOTEL: "HOTEL",
  FLIGHT: "FLIGHT",
  TRANSFER: "TRANSFER",
  ACTIVITY: "ACTIVITY",
  VISA: "VISA",
  INSURANCE: "INSURANCE",
  MEALS: "MEALS",
} as const;

export type PackageItemKind = (typeof PackageItemKind)[keyof typeof PackageItemKind];

export const PACKAGE_ITEM_KINDS: PackageItemKind[] = Object.values(PackageItemKind);

/** Only these kinds carry an inventoryItemId — DESTINATION uses destinationReferenceId, MEALS uses neither. */
export const INVENTORY_REFERENCING_KINDS: PackageItemKind[] = [
  PackageItemKind.HOTEL,
  PackageItemKind.FLIGHT,
  PackageItemKind.TRANSFER,
  PackageItemKind.ACTIVITY,
  PackageItemKind.VISA,
  PackageItemKind.INSURANCE,
];

/**
 * PINNED = a specific inventory/destination item, price locked in.
 * SLOT = criteria only, resolved later (by a future sprint, once Supplier
 * Engine search is wired in — not this sprint). This one field is what
 * makes Manual/Dynamic/Mixed packages one data model instead of three (see
 * PackageSourceType on Package for the derived, package-level label).
 */
export const PackageItemResolutionMode = {
  PINNED: "PINNED",
  SLOT: "SLOT",
} as const;

export type PackageItemResolutionMode = (typeof PackageItemResolutionMode)[keyof typeof PackageItemResolutionMode];

export const PackageItemPricingMode = {
  INCLUDED: "INCLUDED",
  ADDON: "ADDON",
} as const;

export type PackageItemPricingMode = (typeof PackageItemPricingMode)[keyof typeof PackageItemPricingMode];

/**
 * A single line item within a PackageDay. Never holds a copy of Inventory
 * or Destination data — only ID references ("Reference Inventory IDs. Do
 * NOT duplicate Inventory."), each a plain string, no cross-module type
 * import required for the field itself.
 */
export interface PackageItem {
  id: string;
  packageDayId: string;
  kind: PackageItemKind;
  resolutionMode: PackageItemResolutionMode;
  inventoryItemId: string | null;
  destinationReferenceId: string | null;
  slotCriteria: Record<string, unknown> | null;
  title: string;
  description: string | null;
  timeOfDay: string | null;
  notes: string | null;
  images: string[];
  pricingMode: PackageItemPricingMode;
  addonPrice: number | null;
  position: number;
  createdAt: string;
  updatedAt: string;
}
