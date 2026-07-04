export const SupplierStatus = {
  NOT_REQUIRED: "NOT_REQUIRED",
  PENDING: "PENDING",
  CONFIRMED: "CONFIRMED",
  FAILED: "FAILED",
} as const;

export type SupplierStatus = (typeof SupplierStatus)[keyof typeof SupplierStatus];

/**
 * Placeholder reference only — no supplier is ever called from this module
 * (no TripJack, no Ferry). `supplierCode` is a plain string, not a live
 * lookup into src/modules/supplier, matching this sprint's explicit
 * exclusion. Stays NOT_REQUIRED/null by construction until a future sprint
 * wires a real supplier booking call behind it.
 */
export interface SupplierBookingReference {
  supplierCode: string | null;
  supplierBookingId: string | null;
  status: SupplierStatus;
}
