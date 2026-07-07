export const InventoryKind = {
  HOTEL: "HOTEL",
  FLIGHT: "FLIGHT",
  ACTIVITY: "ACTIVITY",
  TRANSFER: "TRANSFER",
  VISA: "VISA",
  INSURANCE: "INSURANCE",
} as const;

export type InventoryKind = (typeof InventoryKind)[keyof typeof InventoryKind];

export const INVENTORY_KINDS = Object.values(InventoryKind);

export const InventoryStatus = {
  DRAFT: "DRAFT",
  ACTIVE: "ACTIVE",
  ARCHIVED: "ARCHIVED",
  MAINTENANCE: "MAINTENANCE",
} as const;

export type InventoryStatus = (typeof InventoryStatus)[keyof typeof InventoryStatus];

export const INVENTORY_STATUS_LABELS: Record<InventoryStatus, string> = {
  DRAFT: "Draft",
  ACTIVE: "Active",
  ARCHIVED: "Archived",
  MAINTENANCE: "Maintenance",
};

export const INVENTORY_KIND_LABELS: Record<InventoryKind, string> = {
  HOTEL: "Hotel",
  FLIGHT: "Flight Route",
  ACTIVITY: "Activity",
  TRANSFER: "Transfer",
  VISA: "Visa",
  INSURANCE: "Insurance",
};

export const EDITABLE_INVENTORY_STATUSES: InventoryStatus[] = [
  InventoryStatus.DRAFT,
  InventoryStatus.ACTIVE,
  InventoryStatus.MAINTENANCE,
];
