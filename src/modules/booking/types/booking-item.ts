import type { SupplierBookingReference } from "./supplier-reference";

export const BookingItemKind = {
  PACKAGE: "PACKAGE",
  INVENTORY: "INVENTORY",
  CUSTOM: "CUSTOM",
} as const;

export type BookingItemKind = (typeof BookingItemKind)[keyof typeof BookingItemKind];

/**
 * A frozen copy of the QuoteItem it was created from — same "commercial
 * document must stay stable" reasoning QuoteItem itself already applies to
 * Package/Inventory. Created only by BookingService.createFromQuote(); no
 * API path adds/edits a BookingItem directly (the source Quote already
 * decided the line items — Booking Engine must never modify Quotes, and
 * re-editing items post-conversion would silently diverge from what the
 * customer approved).
 */
export interface BookingItem {
  id: string;
  bookingId: string;
  kind: BookingItemKind;
  packageId: string | null;
  inventoryItemId: string | null;
  title: string;
  description: string | null;
  quantity: number;
  unitPrice: number;
  supplierBookingReference: SupplierBookingReference | null;
  createdAt: string;
  updatedAt: string;
}
