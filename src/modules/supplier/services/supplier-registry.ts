import { ConflictError } from "@/shared/errors";
import type { Supplier, SupplierCapability } from "../types";

/**
 * The ONLY way any code obtains a live Supplier instance. Inventory Engine
 * (and, later, Booking/Package Builder through Inventory) calls
 * getSupplier()/getSuppliersByCapability() here — nothing outside this
 * module's own module.ts composition root ever does `new TripJackAdapter()`
 * directly, per "Never instantiate suppliers directly."
 */
export class SupplierRegistry {
  private readonly suppliers = new Map<string, Supplier>();

  register(supplier: Supplier): void {
    if (this.suppliers.has(supplier.code)) {
      throw new ConflictError(`Supplier "${supplier.code}" is already registered`);
    }
    this.suppliers.set(supplier.code, supplier);
  }

  getSupplier(code: string): Supplier | undefined {
    return this.suppliers.get(code);
  }

  getAllSuppliers(): Supplier[] {
    return Array.from(this.suppliers.values());
  }

  /** Dynamic capability discovery — no hardcoded "which suppliers do X" list anywhere. */
  getSuppliersByCapability(capability: SupplierCapability): Supplier[] {
    return this.getAllSuppliers().filter((supplier) => supplier.capabilities().includes(capability));
  }
}
