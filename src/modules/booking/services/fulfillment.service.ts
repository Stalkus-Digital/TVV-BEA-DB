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

      // Currently, we only fulfill TripJack Flight and Hotel bookings.
      // Those items have a supplierReference or inventoryItemId starting with "FLIGHT::" or "HOTEL::"
      
      const supplierEngine = getSupplierService();
      
      for (const item of items) {
        // We only attempt to book items that have a supplier reference
        const referenceId = item.inventoryItemId; 
        if (referenceId && (referenceId.startsWith("FLIGHT::") || referenceId.startsWith("HOTEL::"))) {
          const supplierBookingRequest: SupplierBookingRequest = {
            referenceId,
            passengers: travellers.map(t => ({
              title: t.gender === "M" ? "Mr" : "Ms",
              firstName: t.fullName.split(" ")[0] || "Test",
              lastName: t.fullName.split(" ").slice(1).join(" ") || "User",
              dateOfBirth: t.dateOfBirth ? t.dateOfBirth.toISOString().split("T")[0] : "1990-01-01",
              passportNumber: t.passportNumber,
            })),
            contactEmail: travellers.find(t => t.isLeadTraveller)?.email || "info@thevacationvoice.com",
            contactPhone: travellers.find(t => t.isLeadTraveller)?.phone || "9999999999",
          };

          const bookingResult = await supplierEngine.book("tripjack", supplierBookingRequest);
          
          if (bookingResult.ok) {
            // Store the supplier confirmation
            await prisma.bookingItem.update({
              where: { id: item.id },
              data: {
                supplierBookingReference: {
                  id: bookingResult.value.confirmationReference,
                  status: "CONFIRMED",
                  raw: bookingResult.value as any,
                }
              }
            });
          } else {
            this.logger.error(`Failed to fulfill item ${item.id}`, { error: bookingResult.error });
            // In a real system, we'd notify ops and queue for retry.
          }
        }
      }

      return ok(undefined);
    } catch (error) {
      this.logger.error("Failed to fulfill booking", { error });
      return err(new InternalError("Failed to fulfill booking"));
    }
  }
}
