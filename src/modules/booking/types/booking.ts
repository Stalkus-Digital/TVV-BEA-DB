import type { BookingStatus } from "./booking-status";
import type { PaymentStatus } from "./booking-payment";
import type { BookingItem } from "./booking-item";
import type { Traveller } from "./traveller";

/**
 * Created ONLY from an APPROVED Quote (see ../services/booking.service.ts's
 * createFromQuote()) — never assembled from a Package or built up
 * manually. `sourceQuoteVersionId` points at the immutable QuoteVersion
 * snapshot this booking was created from (the Quote's own currentVersionId
 * at the moment of conversion); `totalAmount`/`currency` are frozen from
 * that snapshot's computed pricing, not re-derived later. This module never
 * writes to Quote's or Package's repositories — the one touch on Quote is
 * a single call to Quote's own public `convertToBooking()` service method
 * (the sanctioned state transition Quote itself exposes), same
 * public-service-boundary discipline as every other module edge in this
 * project (Package → Inventory/Destination, Quote → Package/Destination/
 * Inventory).
 */
export interface Booking {
  id: string;
  bookingNumber: string;
  status: BookingStatus;
  sourceQuoteId: string;
  sourceQuoteNumber: string;
  sourceQuoteVersionId: string | null;
  destinationId: string;
  packageId: string | null;
  currency: string;
  totalAmount: number;
  amountPaid: number;
  paymentStatus: PaymentStatus;
  internalNotes: string | null;
  confirmedAt: string | null;
  ticketedAt: string | null;
  completedAt: string | null;
  cancelledAt: string | null;
  cancellationReason: string | null;
  /**
   * Owning customer (Sprint 13) — propagated automatically from the
   * source Quote's `customerId` at creation time in `createFromQuote()`,
   * never set independently.
   */
  customerId: string | null;
  createdAt: string;
  updatedAt: string;
  items?: BookingItem[];
  travellers?: Traveller[];
  /**
   * BOOK-002: derived server-side from each BookingItem's kind (and, for
   * INVENTORY items, the underlying InventoryItem's kind) — never stored,
   * never trusted from client input. Replaces the old approach of parsing
   * `internalNotes` as JSON for an `externalBookingType` tag, which no real
   * booking-creation path ever populated, so every booking silently landed
   * in the PACKAGE bucket regardless of what it actually was.
   */
  bookingCategory?: "PACKAGE" | "HOTEL" | "ACTIVITY";
  /**
   * CUSTOMER-001: display-only enrichment for the customer dashboard —
   * resolved from destinationId/packageId/items by CustomerBookingService,
   * never persisted. Optional and absent on Bookings returned by any other
   * path (e.g. the admin API), which continue to expose raw IDs only.
   */
  destinationName?: string | null;
  productLabel?: string | null;
}
