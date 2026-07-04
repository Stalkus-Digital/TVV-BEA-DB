/**
 * Independent from Inventory's InventoryKind by design — the Supplier
 * Engine must stay completely isolated (nothing here imports from
 * src/modules/inventory). Reconciling "FERRIES" here with Inventory's
 * TRANSFER(mode=FERRY) kind is future integration work, not this module's
 * concern.
 */
export const SupplierCapability = {
  FLIGHTS: "FLIGHTS",
  HOTELS: "HOTELS",
  ACTIVITIES: "ACTIVITIES",
  FERRIES: "FERRIES",
  TRANSFERS: "TRANSFERS",
  VISA: "VISA",
  INSURANCE: "INSURANCE",
} as const;

export type SupplierCapability = (typeof SupplierCapability)[keyof typeof SupplierCapability];

export const SUPPLIER_CAPABILITIES: SupplierCapability[] = Object.values(SupplierCapability);
