import { AdjustmentKind, AdjustmentType, type QuoteAdjustment } from "../types/quote-adjustment";
import type { QuoteItem } from "../types/quote-item";
import type { QuotePriceResult } from "../types/quote-pricing";

/**
 * Pure calculation, no I/O — mirrors package/pricing/pricing-calculator.ts.
 * Every entry pushed into lineItems is meant to count toward total, and
 * total is always their sum — no separate "informational" line is ever
 * pushed (that exact mistake double-counted Package's base price earlier
 * this project; this function is written to avoid repeating it).
 */
export function computeQuotePrice(items: QuoteItem[], adjustments: QuoteAdjustment[], currency: string): QuotePriceResult {
  const itemsSubtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

  const lineItems = [{ label: "Items subtotal", amount: itemsSubtotal }];
  let runningTotal = itemsSubtotal;

  for (const adjustment of adjustments) {
    const rawAmount = adjustment.type === AdjustmentType.PERCENTAGE ? (runningTotal * adjustment.value) / 100 : adjustment.value;
    const signedAmount = adjustment.kind === AdjustmentKind.DISCOUNT ? -rawAmount : rawAmount;
    lineItems.push({ label: adjustment.label, amount: signedAmount });
    runningTotal += signedAmount;
  }

  return {
    currency,
    itemsSubtotal,
    lineItems,
    total: lineItems.reduce((sum, line) => sum + line.amount, 0),
  };
}
