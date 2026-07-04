import type { QuoteStatus, TravelerDetails } from "./quote";

export interface QuotePdfLineItem {
  title: string;
  description: string | null;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface QuotePdfDestinationSummary {
  id: string;
  name: string;
  slug: string;
}

/**
 * A data model only — no PDF-rendering library is installed or implied
 * here (same "interface/data only, no implementation" discipline as
 * Website's cache port). Whatever renders this into an actual PDF later
 * consumes this shape, not the raw Quote/QuoteItem entities.
 */
export interface QuotePdfData {
  quoteNumber: string;
  title: string;
  status: QuoteStatus;
  issuedAt: string;
  validFrom: string;
  validTo: string;
  isExpired: boolean;
  destination: QuotePdfDestinationSummary;
  travelerDetails: TravelerDetails;
  lineItems: QuotePdfLineItem[];
  pricing: {
    currency: string;
    itemsSubtotal: number;
    adjustmentLines: { label: string; amount: number }[];
    total: number;
  };
  internalNotes: string | null;
  customerNotes: string | null;
}
