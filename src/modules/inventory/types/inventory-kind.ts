export const InventoryKind = {
  HOTEL: "HOTEL",
  FLIGHT: "FLIGHT",
  ACTIVITY: "ACTIVITY",
  TRANSFER: "TRANSFER",
  VISA: "VISA",
  INSURANCE: "INSURANCE",
} as const;

export type InventoryKind = (typeof InventoryKind)[keyof typeof InventoryKind];

export const INVENTORY_KINDS: InventoryKind[] = Object.values(InventoryKind);
