import type { Booking } from "../types/booking";
import type { BookingItem } from "../types/booking-item";
import type { BookingVoucher } from "../types/booking-voucher";
import type { SupplierBookingReference } from "../types/supplier-reference";
import type { Traveller } from "../types/traveller";

/** Pure data assembly, no I/O — same "no PDF library yet" discipline as Quote's PDF data model. */
export function buildBookingVoucher(
  voucherNumber: string,
  booking: Booking,
  items: BookingItem[],
  leadTraveller: Traveller | null,
  destinationName: string
): Omit<BookingVoucher, "id"> {
  const now = new Date().toISOString();
  return {
    bookingId: booking.id,
    voucherNumber,
    issuedAt: now,
    leadTravellerName: leadTraveller?.fullName ?? "Lead traveller not yet added",
    destinationName,
    validity: null,
    items: items.map((item) => ({ title: item.title, description: item.description, quantity: item.quantity })),
    supplierReferences: items
      .map((item) => item.supplierBookingReference)
      .filter((ref): ref is SupplierBookingReference => ref !== null),
    notes: booking.internalNotes,
    createdAt: now,
  };
}
