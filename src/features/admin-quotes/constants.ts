import type { QuoteStatus } from "./types";

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

export const QUOTE_STATUS_LABELS: Record<QuoteStatus, string> = {
  DRAFT: "Draft",
  SENT: "Sent",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  CONVERTED: "Converted",
};

export const EDITABLE_QUOTE_STATUSES: QuoteStatus[] = ["DRAFT", "SENT"];
export const DECIDABLE_QUOTE_STATUSES: QuoteStatus[] = ["DRAFT", "SENT"];
