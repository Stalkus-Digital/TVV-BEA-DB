import { describe, expect, it } from "vitest";
import { SupplierRegistry } from "@/modules/supplier/services/supplier-registry";
import { ManualSupplierAdapter } from "@/modules/supplier/adapters/manual-supplier.adapter";
import { FerryAdapter } from "@/modules/supplier/adapters/ferry.adapter";
import { SupplierCapability } from "@/modules/supplier/types";
import { createTestLogger } from "../../helpers/test-logger";

function buildAdapters() {
  const context = { logger: createTestLogger() };
  return { manual: new ManualSupplierAdapter(context), ferry: new FerryAdapter(context) };
}

describe("SupplierRegistry", () => {
  it("register() then getSupplier() returns the same instance", () => {
    const registry = new SupplierRegistry();
    const { manual } = buildAdapters();
    registry.register(manual);
    expect(registry.getSupplier("manual")).toBe(manual);
  });

  it("registering the same supplier code twice throws ConflictError", () => {
    const registry = new SupplierRegistry();
    const { manual } = buildAdapters();
    registry.register(manual);
    expect(() => registry.register(manual)).toThrow(/already registered/);
  });

  it("getSupplier() returns undefined for an unknown code, not an error", () => {
    const registry = new SupplierRegistry();
    expect(registry.getSupplier("nonexistent")).toBeUndefined();
  });

  it("getAllSuppliers() returns every registered adapter", () => {
    const registry = new SupplierRegistry();
    const { manual, ferry } = buildAdapters();
    registry.register(manual);
    registry.register(ferry);
    expect(registry.getAllSuppliers().map((s) => s.code).sort()).toEqual(["ferry", "manual"]);
  });

  it("getSuppliersByCapability() dynamically filters — no hardcoded per-capability list", () => {
    const registry = new SupplierRegistry();
    const { manual, ferry } = buildAdapters();
    registry.register(manual);
    registry.register(ferry);

    expect(registry.getSuppliersByCapability(SupplierCapability.FERRIES).map((s) => s.code)).toEqual(["ferry"]);
    expect(registry.getSuppliersByCapability(SupplierCapability.HOTELS).map((s) => s.code)).toEqual(["manual"]);
  });
});
