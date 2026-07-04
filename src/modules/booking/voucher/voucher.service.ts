import { isErr, ok, type Result } from "@/shared/types";
import { BaseService, type ServiceContext } from "@/shared/services";
import type { AppError } from "@/shared/errors";
import { getDestinationService } from "@/modules/destination";
import type { Booking } from "../types/booking";
import type { BookingVoucher } from "../types/booking-voucher";
import type { VoucherRepository } from "../repositories/voucher.repository";
import type { BookingItemRepository } from "../repositories/booking-item.repository";
import type { TravellerRepository } from "../repositories/traveller.repository";
import { buildBookingVoucher } from "./voucher-builder";

function generateVoucherNumber(sequence: number): string {
  return `VCH-${String(sequence).padStart(6, "0")}`;
}

export class VoucherService extends BaseService {
  constructor(
    context: ServiceContext,
    private readonly vouchers: VoucherRepository,
    private readonly items: BookingItemRepository,
    private readonly travellers: TravellerRepository
  ) {
    super(context);
  }

  async listByBooking(bookingId: string): Promise<Result<BookingVoucher[], AppError>> {
    return this.vouchers.findByBooking(bookingId);
  }

  async generate(booking: Booking): Promise<Result<BookingVoucher, AppError>> {
    const itemsResult = await this.items.findByBooking(booking.id);
    if (isErr(itemsResult)) return itemsResult;

    const travellersResult = await this.travellers.findByBooking(booking.id);
    if (isErr(travellersResult)) return travellersResult;
    const leadTraveller = travellersResult.value.find((t) => t.isLeadTraveller) ?? null;

    const destination = await getDestinationService().getById(booking.destinationId);
    if (isErr(destination)) return destination;

    const countResult = await this.vouchers.countAll();
    if (isErr(countResult)) return countResult;
    const voucherNumber = generateVoucherNumber(countResult.value + 1);

    this.logger.info("Generating booking voucher", { bookingId: booking.id, voucherNumber });
    const created = await this.vouchers.create(
      buildBookingVoucher(voucherNumber, booking, itemsResult.value, leadTraveller, destination.value.name)
    );
    if (isErr(created)) return created;
    return ok(created.value);
  }
}
