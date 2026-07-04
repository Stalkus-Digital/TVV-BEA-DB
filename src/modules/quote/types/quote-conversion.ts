import type { TravelerDetails } from "./quote";
import type { QuoteItem } from "./quote-item";
import type { QuotePriceResult } from "./quote-pricing";

/**
 * Handoff payload returned by QuoteService.convertToBooking() — the shape a
 * future Booking Engine (Sprint 8, not built here) would consume to create
 * a real booking. This module never imports a booking module (it doesn't
 * exist yet) and never fabricates a booking ID; Quote.convertedBookingId
 * stays null until that future module writes to it itself.
 */
export interface BookingHandoffPayload {
  quoteId: string;
  quoteNumber: string;
  destinationId: string;
  packageId: string | null;
  travelerDetails: TravelerDetails;
  items: QuoteItem[];
  pricing: QuotePriceResult;
  convertedAt: string;
}
