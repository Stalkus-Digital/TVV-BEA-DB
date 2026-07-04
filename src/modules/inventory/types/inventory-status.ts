export const InventoryStatus = {
  DRAFT: "DRAFT",
  ACTIVE: "ACTIVE",
  ARCHIVED: "ARCHIVED",
  MAINTENANCE: "MAINTENANCE",
} as const;

export type InventoryStatus = (typeof InventoryStatus)[keyof typeof InventoryStatus];
