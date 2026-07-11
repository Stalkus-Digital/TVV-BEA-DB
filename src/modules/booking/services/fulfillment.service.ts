import { BaseService, type ServiceContext } from "@/shared/services";
import { ok, err, type Result } from "@/shared/types";
import { InternalError, NotFoundError, type AppError } from "@/shared/errors";
import { prisma } from "@/shared/database/prisma-client";
import { getSupplierService } from "@/modules/supplier";
import type { SupplierBookingRequest } from "@/modules/supplier/types";

export class FulfillmentService extends BaseService {
  constructor(context: ServiceContext) {
    super(context);
  }

  async fulfillBooking(bookingId: string): Promise<Result<void, AppError>> {
    try {
      const booking = await prisma.booking.findUnique({
        where: { id: bookingId }
      });

      if (!booking) return err(new InternalError(`Booking ${bookingId} not found`));

      const items = await prisma.bookingItem.findMany({ where: { bookingId } });
      const travellers = await prisma.traveller.findMany({ where: { bookingId } });

      const supplierEngine = getSupplierService();

      for (const item of items) {
        const referenceId = item.inventoryItemId;
        const isFlightItem = referenceId?.startsWith("FLIGHT::");
        const isHotelItem = referenceId?.startsWith("HOTEL::");

        if (!referenceId || (!isFlightItem && !isHotelItem)) {
          this.logger.info(`Skipping item ${item.id} — not a TripJack supplier reference`);
          continue;
        }

        // Skip items already fulfilled (have a real supplier reference stored)
        const existing = item.supplierBookingReference as any;
        if (existing?.id && !existing.id.startsWith("MOCK_")) {
          this.logger.info(`Item ${item.id} already has supplier reference ${existing.id} — skipping`);
          continue;
        }

        const leadTraveller = travellers.find(t => t.isLeadTraveller);
        const supplierBookingRequest: SupplierBookingRequest = {
          referenceId,
          passengers: travellers.map(t => ({
            title: t.gender === "M" ? "Mr" : "Ms",
            firstName: t.fullName.split(" ")[0] || "Guest",
            lastName: t.fullName.split(" ").slice(1).join(" ") || "Traveller",
            dateOfBirth: t.dateOfBirth ? t.dateOfBirth.toISOString().split("T")[0] : "1990-01-01",
            passportNumber: t.passportNumber ?? undefined,
          })),
          contactEmail: leadTraveller?.email ?? booking.id + "@thevacationvoice.com",
          contactPhone: leadTraveller?.phone ?? "9999999999",
          // For flight bookings — TripJack requires Review to have been called first.
          // The FulfillmentService calls reviewThenBook to enforce this.
          isHotel: isHotelItem,
        };

        this.logger.info(`Fulfilling ${isFlightItem ? "flight" : "hotel"} item ${item.id} via TripJack`, {
          bookingId,
          referenceId,
        });

        let bookingResult;
        if (isFlightItem) {
          // ✅ CF-3 FIX: For flights, call Review first (required by TripJack OMS)
          // then Book with the bookingId returned by Review.
          bookingResult = await supplierEngine.reviewAndBook("tripjack", supplierBookingRequest);
        } else {
          // Hotels: Review step is separate (called during cart/checkout), Book directly
          bookingResult = await supplierEngine.book("tripjack", supplierBookingRequest);
        }

        if (bookingResult.ok) {
          const confirmRef = bookingResult.value.confirmationReference;
          this.logger.info(`Item ${item.id} fulfilled — TripJack ref: ${confirmRef}`);

          await prisma.bookingItem.update({
            where: { id: item.id },
            data: {
              supplierBookingReference: {
                id: confirmRef,
                status: "CONFIRMED",
                raw: bookingResult.value as any,
                fulfilledAt: new Date().toISOString(),
              }
            }
          });
        } else {
          // ✅ CF-3b FIX: Fail loudly — do NOT generate a mock booking reference.
          // Log error and mark item as FAILED so ops can see and retry.
          this.logger.error(`FULFILLMENT FAILED for item ${item.id}`, {
            error: bookingResult.error.message,
            bookingId,
            referenceId,
          });

          await prisma.bookingItem.update({
            where: { id: item.id },
            data: {
              supplierBookingReference: {
                id: null,
                status: "FAILED",
                error: bookingResult.error.message,
                failedAt: new Date().toISOString(),
              }
            }
          });

          // Alert ops — in production this would trigger a Slack/email alert
          this.logger.error(`[OPS ALERT] Supplier fulfillment failed for booking ${bookingId} item ${item.id}. Manual intervention required.`);
        }
      }

      return ok(undefined);
    } catch (error) {
      this.logger.error("Failed to fulfill booking", { error });
      return err(new InternalError("Failed to fulfill booking"));
    }
  }
}
