import { createLogger } from "@/shared/logger";
import { prisma } from "@/shared/database/prisma-client";
import type { EnqueueBookingEmailInput } from "./booking-email.types";
import { getBookingEmailService } from "../module";

/**
 * Fire-and-forget booking email entry point.
 * Resolves lead traveller email from DB; never throws to callers.
 * Booking / payment flows must use this — not EmailService directly for transactional mail.
 */
export function enqueueBookingEmail(input: EnqueueBookingEmailInput): void {
  void (async () => {
    try {
      const booking = await prisma.booking.findUnique({ where: { id: input.bookingId } });
      if (!booking) {
        createLogger("email.booking.enqueue").warn("Booking not found for email", {
          bookingId: input.bookingId,
          event: input.event,
        });
        return;
      }

      const lead = await prisma.traveller.findFirst({
        where: { bookingId: input.bookingId, isLeadTraveller: true },
      });
      const contact =
        lead ??
        (await prisma.traveller.findFirst({ where: { bookingId: input.bookingId } }));

      await getBookingEmailService().sendForBooking({
        ...input,
        payload: {
          bookingId: booking.id,
          bookingNumber: booking.bookingNumber,
          recipientName: contact?.fullName ?? null,
          recipientEmail: contact?.email ?? null,
          currency: input.currency ?? booking.currency,
          amount: input.amount,
          invoiceNumber: input.invoiceNumber,
          voucherNumber: input.voucherNumber,
          reason: input.reason,
        },
      });
    } catch (error) {
      createLogger("email.booking.enqueue").error("Failed to enqueue booking email", {
        error,
        bookingId: input.bookingId,
        event: input.event,
      });
    }
  })();
}
