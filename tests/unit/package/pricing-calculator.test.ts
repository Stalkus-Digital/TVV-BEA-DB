import { describe, expect, it } from "vitest";
import { computePrice } from "@/modules/package/pricing/pricing-calculator";
import type { PackagePricing } from "@/modules/package/types/package-pricing";

const basePricing: PackagePricing = {
  id: "pricing-1",
  packageId: "package-1",
  basePrice: 45_000,
  currency: "INR",
  markup: { type: "PERCENTAGE", value: 10 },
  discount: null,
  tax: { type: "PERCENTAGE", value: 5 },
  occupancyPricing: [],
  childPricing: [],
  infantPricing: null,
  groupPricing: [],
  seasonalPricing: [],
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

describe("computePrice — regression: base price double-counting (Sprint 6 bug)", () => {
  it("does NOT double-count the base price when markup and tax are both set", () => {
    // Original bug: an informational "Base (per adult)" line was pushed into
    // the same lineItems array that gets summed for total, alongside
    // "Adults × N" which already included that base amount — a ₹45,000 base
    // for 2 adults + 10% markup + 5% tax showed ₹148,950 instead of the
    // correct ₹103,950. This test locks in the correct total.
    const lineItems = computePrice(basePricing, { adults: 2 });
    const total = lineItems.reduce((sum, line) => sum + line.amount, 0);

    // 45000 * 2 = 90000 (adults base)
    // + 10% markup = 9000 → 99000
    // + 5% tax on 99000 = 4950 → 103950
    expect(total).toBe(103_950);
  });

  it("never emits a separate informational base-price line item", () => {
    const lineItems = computePrice(basePricing, { adults: 2 });
    expect(lineItems.some((line) => /base.*per adult/i.test(line.label))).toBe(false);
  });

  it("with no markup/discount/tax, total is exactly adults × basePrice", () => {
    const plain: PackagePricing = { ...basePricing, markup: null, discount: null, tax: null };
    const lineItems = computePrice(plain, { adults: 3 });
    const total = lineItems.reduce((sum, line) => sum + line.amount, 0);
    expect(total).toBe(135_000);
  });

  it("discount reduces the adults subtotal before tax is applied", () => {
    const withDiscount: PackagePricing = { ...basePricing, markup: null, discount: { type: "FLAT", value: 5000 }, tax: null };
    const lineItems = computePrice(withDiscount, { adults: 1 });
    const total = lineItems.reduce((sum, line) => sum + line.amount, 0);
    expect(total).toBe(40_000); // 45000 - 5000
  });

  it("occupancy pricing overrides the base per-adult unit price when it matches the request", () => {
    const withOccupancy: PackagePricing = {
      ...basePricing,
      markup: null,
      tax: null,
      occupancyPricing: [{ occupancyType: "DOUBLE", pricePerPerson: 30_000 }],
    };
    const lineItems = computePrice(withOccupancy, { adults: 2, occupancy: "DOUBLE" });
    const total = lineItems.reduce((sum, line) => sum + line.amount, 0);
    expect(total).toBe(60_000); // 30000 * 2, not the 45000 base
  });

  it("a child with no matching age band is priced as a full adult, not silently free", () => {
    const withChildBands: PackagePricing = {
      ...basePricing,
      markup: null,
      tax: null,
      childPricing: [{ minAge: 2, maxAge: 5, priceType: "FLAT", value: 10_000 }],
    };
    const lineItems = computePrice(withChildBands, { adults: 1, children: [{ age: 12 }] });
    const childLine = lineItems.find((line) => line.label.startsWith("Children"));
    expect(childLine?.amount).toBe(45_000); // priced as an adult unit, not 0 and not the 10,000 band
  });

  /**
   * NEWLY DISCOVERED while writing this regression suite (not fixed here —
   * "no business logic changes" this turn, per the current sprint's
   * instruction). This is the exact same double-counting bug class as the
   * base-price bug above, in the seasonal-adjustment path instead:
   * `resolveSeasonalAdjustment`'s amount is pushed as its own "Seasonal
   * adjustment" line item AND folded into `adultUnitPrice` before "Adults ×
   * N" is computed and pushed as a second line item — so
   * `total = lineItems.reduce(sum)` counts the seasonal amount twice.
   * `it.fails` documents the CORRECT expected total; this test will start
   * failing (i.e. the suite will report success) the moment someone applies
   * the same fix pattern already used for the base-price bug. Do not delete
   * or "fix" this test by changing the expectation — fix pricing-calculator.ts.
   */
  it.fails("KNOWN BUG: seasonal adjustment is double-counted in the total (see comment above)", () => {
    const seasonal: PackagePricing = {
      ...basePricing,
      tax: null,
      seasonalPricing: [{ id: "s1", seasonName: "Peak", startDate: "2026-12-01", endDate: "2026-12-31", adjustment: { type: "FLAT", value: 5000 } }],
    };
    const lineItems = computePrice(seasonal, { adults: 1, date: "2026-12-15" });
    const total = lineItems.reduce((sum, line) => sum + line.amount, 0);
    // Correct total: (45000 base + 5000 seasonal) = 50000 adult unit; +10% markup = 5000 → 55000.
    // Actual total today: 60000 — the 5000 seasonal amount is counted twice.
    expect(total).toBe(55_000);
  });
});
