import type { TravelerDetails } from "./quote";
import type { QuoteItem } from "./quote-item";
import type { QuotePriceResult } from "./quote-pricing";

/**
 * Handoff payload built by QuoteService.buildBookingHandoff() for
 * BookingService.createFromQuote(). Does not mutate quote status —
 * BookingService completes conversion via completeConversion(quoteId, bookingId).
 */
export interface BookingHandoffPayload {
  quoteId: string;
  quoteNumber: string;
  destinationId: string;
  packageId: string | null;
  travelerDetails: TravelerDetails;
  items: QuoteItem[];
  pricing: QuotePriceResult;
  /** ISO timestamp when the handoff was prepared (not necessarily quote.convertedAt). */
  preparedAt: string;
}
