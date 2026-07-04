export interface QuotePriceLineItem {
  label: string;
  amount: number;
}

/**
 * total is always the sum of lineItems — nothing is pushed into lineItems
 * that shouldn't count toward it (the Package pricing calculator shipped a
 * bug earlier this project by breaking that invariant; this type's only
 * consumer, ../pricing/quote-pricing-calculator.ts, is written to preserve it).
 */
export interface QuotePriceResult {
  currency: string;
  itemsSubtotal: number;
  lineItems: QuotePriceLineItem[];
  total: number;
}
