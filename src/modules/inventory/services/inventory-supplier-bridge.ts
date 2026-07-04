import { getSupplierRegistry, type SupplierCapability } from "@/modules/supplier";

/**
 * Extension point only (Sprint 3 — Supplier Engine). Inventory is now
 * *capable* of asking the Supplier Registry for a supplier — this file
 * exists so that capability is real and compiled, not just described in a
 * doc. Nothing calls these functions yet, and they are deliberately NOT
 * re-exported from src/modules/inventory/index.ts or ./services/index.ts,
 * so importing Inventory for its existing CRUD surface does not newly pull
 * in the Supplier module as a side effect. InventoryService, InventoryItem,
 * and every other existing Inventory file are untouched by this sprint.
 */
export function getSupplierForCode(code: string) {
  return getSupplierRegistry().getSupplier(code);
}

export function getSuppliersForCapability(capability: SupplierCapability) {
  return getSupplierRegistry().getSuppliersByCapability(capability);
}
