import { describe, expect, it } from "vitest";
import { isOk } from "@/shared/types";
import { ManualSupplierAdapter } from "@/modules/supplier/adapters/manual-supplier.adapter";
import { FerryAdapter } from "@/modules/supplier/adapters/ferry.adapter";
import { createTestLogger } from "../../helpers/test-logger";

describe("Placeholder supplier adapters (Manual, Ferry)", () => {
  it.each([
    ["ManualSupplierAdapter", () => new ManualSupplierAdapter({ logger: createTestLogger() })],
    ["FerryAdapter", () => new FerryAdapter({ logger: createTestLogger() })],
  ] as const)("%s: initialize() succeeds without touching any external API", async (_name, build) => {
    const adapter = build();
    const result = await adapter.initialize();
    expect(isOk(result)).toBe(true);
  });

  it.each([
    ["ManualSupplierAdapter", () => new ManualSupplierAdapter({ logger: createTestLogger() })],
    ["FerryAdapter", () => new FerryAdapter({ logger: createTestLogger() })],
  ] as const)("%s: health() reports unhealthy=false with a placeholder message, not a real check", async (_name, build) => {
    const adapter = build();
    const result = await adapter.health();
    expect(isOk(result)).toBe(true);
    if (isOk(result)) {
      expect(result.value.healthy).toBe(false);
      expect(result.value.message).toMatch(/placeholder/i);
    }
  });

  it("ManualSupplierAdapter declares HOTELS and ACTIVITIES capabilities", () => {
    const adapter = new ManualSupplierAdapter({ logger: createTestLogger() });
    expect(adapter.capabilities()).toEqual(["HOTELS", "ACTIVITIES"]);
  });

  it("FerryAdapter declares only FERRIES", () => {
    const adapter = new FerryAdapter({ logger: createTestLogger() });
    expect(adapter.capabilities()).toEqual(["FERRIES"]);
  });

  it.each(["search", "details", "book", "cancel", "sync"] as const)(
    "%s() rejects with NotImplementedError rather than silently no-op-ing",
    async (method) => {
      const adapter = new ManualSupplierAdapter({ logger: createTestLogger() });
      // @ts-expect-error — calling each unimplemented method with a throwaway arg for this generic check
      await expect(adapter[method]({})).rejects.toThrow(/not implemented/i);
    }
  );
});
