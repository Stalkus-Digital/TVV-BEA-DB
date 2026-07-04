import type { Booking } from "../types/booking";
import type { BookingItem } from "../types/booking-item";
import type { BookingInvoice } from "../types/booking-invoice";
import type { Traveller } from "../types/traveller";

/** Pure data assembly, no I/O — mirrors quote/pdf/quote-pdf-builder.ts. billTo defaults to the lead traveller; a booking can have an invoice generated before any traveller is added, so the fallback is explicit rather than throwing. */
export function buildBookingInvoice(
  invoiceNumber: string,
  booking: Booking,
  items: BookingItem[],
  leadTraveller: Traveller | null
): Omit<BookingInvoice, "id"> {
  const lineItems = items.map((item) => ({
    title: item.title,
    quantity: item.quantity,
    unitPrice: item.unitPrice,
    lineTotal: item.unitPrice * item.quantity,
  }));
  const subtotal = lineItems.reduce((sum, line) => sum + line.lineTotal, 0);
  const now = new Date().toISOString();

  return {
    bookingId: booking.id,
    invoiceNumber,
    issuedAt: now,
    billTo: {
      name: leadTraveller?.fullName ?? "Lead traveller not yet added",
      email: leadTraveller?.email ?? "",
      phone: leadTraveller?.phone ?? null,
    },
    currency: booking.currency,
    lineItems,
    subtotal,
    total: booking.totalAmount,
    amountPaid: booking.amountPaid,
    amountDue: Math.max(0, booking.totalAmount - booking.amountPaid),
    createdAt: now,
  };
}
