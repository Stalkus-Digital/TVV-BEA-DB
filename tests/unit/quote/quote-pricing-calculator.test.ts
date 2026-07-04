import { describe, expect, it } from "vitest";
import { computeQuotePrice } from "@/modules/quote/pricing/quote-pricing-calculator";
import type { QuoteItem } from "@/modules/quote/types/quote-item";
import type { QuoteAdjustment } from "@/modules/quote/types/quote-adjustment";

function item(overrides: Partial<QuoteItem> = {}): QuoteItem {
  return {
    id: "item-1",
    quoteId: "quote-1",
    kind: "CUSTOM",
    packageId: null,
    inventoryItemId: null,
    title: "Line item",
    description: null,
    quantity: 1,
    unitPrice: 10_000,
    position: 0,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("computeQuotePrice", () => {
  it("itemsSubtotal is the sum of unitPrice × quantity across every item", () => {
    const items = [item({ unitPrice: 25_000, quantity: 2 }), item({ id: "i2", unitPrice: 6_000, quantity: 1 })];
    const result = computeQuotePrice(items, [], "INR");
    expect(result.itemsSubtotal).toBe(56_000);
  });

  it("total always equals the sum of every lineItem — no informational, uncounted line ever exists", () => {
    const items = [item({ unitPrice: 58_000, quantity: 1 })];
    const adjustments: QuoteAdjustment[] = [
      { id: "a1", kind: "MARKUP", type: "PERCENTAGE", label: "Agency markup", value: 10 },
      { id: "a2", kind: "DISCOUNT", type: "FLAT", label: "Early bird", value: 1500 },
    ];
    const result = computeQuotePrice(items, adjustments, "INR");
    const recomputedTotal = result.lineItems.reduce((sum, line) => sum + line.amount, 0);
    expect(result.total).toBe(recomputedTotal);
    // 58000 + 10% markup (5800) - 1500 flat discount = 62300 — same scenario verified live during Sprint 8.
    expect(result.total).toBe(62_300);
  });

  it("a percentage adjustment compounds on the running total, not the original subtotal", () => {
    const items = [item({ unitPrice: 10_000, quantity: 1 })];
    const adjustments: QuoteAdjustment[] = [
      { id: "a1", kind: "MARKUP", type: "PERCENTAGE", value: 10, label: "M1" }, // 10000 -> 11000
      { id: "a2", kind: "MARKUP", type: "PERCENTAGE", value: 10, label: "M2" }, // 11000 -> 12100, not 12000
    ];
    const result = computeQuotePrice(items, adjustments, "INR");
    expect(result.total).toBe(12_100);
  });

  it("a discount is applied as a negative amount, reducing the running total", () => {
    const items = [item({ unitPrice: 10_000, quantity: 1 })];
    const adjustments: QuoteAdjustment[] = [{ id: "a1", kind: "DISCOUNT", type: "FLAT", value: 2000, label: "Discount" }];
    const result = computeQuotePrice(items, adjustments, "INR");
    const discountLine = result.lineItems.find((line) => line.label === "Discount");
    expect(discountLine?.amount).toBe(-2000);
    expect(result.total).toBe(8_000);
  });

  it("no items and no adjustments produces a zero total, not an error", () => {
    const result = computeQuotePrice([], [], "INR");
    expect(result.itemsSubtotal).toBe(0);
    expect(result.total).toBe(0);
    expect(result.lineItems).toEqual([{ label: "Items subtotal", amount: 0 }]);
  });

  it("passes currency through unchanged", () => {
    expect(computeQuotePrice([], [], "USD").currency).toBe("USD");
  });
});
