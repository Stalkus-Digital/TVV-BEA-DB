import type { SupplierCapability } from "./supplier-capability";

export const SupplierRecordStatus = {
  ACTIVE: "ACTIVE",
  DISABLED: "DISABLED",
} as const;

export type SupplierRecordStatus = (typeof SupplierRecordStatus)[keyof typeof SupplierRecordStatus];

/**
 * Persisted metadata about a registered supplier — distinct from the live
 * `Supplier` adapter instance itself. This is what docs/02's "Supplier
 * Engine Owns: TripJack, Ferry, Future Suppliers, Health, Credentials, Logs"
 * refers to at the data level (credentials/logs are not modeled yet — no
 * supplier has real credentials to store).
 */
export interface SupplierRecord {
  id: string;
  code: string;
  name: string;
  capabilities: SupplierCapability[];
  status: SupplierRecordStatus;
  registeredAt: string;
}
