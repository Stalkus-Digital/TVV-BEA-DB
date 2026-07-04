export const AdjustmentType = {
  PERCENTAGE: "PERCENTAGE",
  FLAT: "FLAT",
} as const;

export type AdjustmentType = (typeof AdjustmentType)[keyof typeof AdjustmentType];

export const AdjustmentKind = {
  MARKUP: "MARKUP",
  DISCOUNT: "DISCOUNT",
} as const;

export type AdjustmentKind = (typeof AdjustmentKind)[keyof typeof AdjustmentKind];

/**
 * Lives directly on the Quote (see ../quote.ts), unlike Package's markup/
 * discount which belong to a separate PackagePricing entity — a Quote has
 * no reusable pricing record of its own to point to, adjustments ARE part
 * of the quote's own commercial state.
 */
export interface QuoteAdjustment {
  id: string;
  kind: AdjustmentKind;
  type: AdjustmentType;
  label: string;
  value: number;
}
