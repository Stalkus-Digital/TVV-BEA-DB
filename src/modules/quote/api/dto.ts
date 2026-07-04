import type { QuoteStatus } from "../types/quote";

export interface ListQuotesQuery {
  status?: QuoteStatus;
  destinationId?: string;
  packageId?: string;
  page?: number;
  pageSize?: number;
}
