import type { QuoteRequestInput, QuoteSummary } from "@/lib/api/quotes";

export type { QuoteRequestInput, QuoteSummary };

export interface QuoteListItem extends QuoteSummary {
  label: string;
}
