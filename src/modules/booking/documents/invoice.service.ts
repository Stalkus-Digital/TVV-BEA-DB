import { isErr, ok, type Result } from "@/shared/types";
import { BaseService, type ServiceContext } from "@/shared/services";
import type { AppError } from "@/shared/errors";
import type { Booking } from "../types/booking";
import type { BookingInvoice } from "../types/booking-invoice";
import type { InvoiceRepository } from "../repositories/invoice.repository";
import type { BookingItemRepository } from "../repositories/booking-item.repository";
import type { TravellerRepository } from "../repositories/traveller.repository";
import { buildBookingInvoice } from "./invoice-builder";

function generateInvoiceNumber(sequence: number): string {
  return `INV-${String(sequence).padStart(6, "0")}`;
}

export class InvoiceService extends BaseService {
  constructor(
    context: ServiceContext,
    private readonly invoices: InvoiceRepository,
    private readonly items: BookingItemRepository,
    private readonly travellers: TravellerRepository
  ) {
    super(context);
  }

  async listByBooking(bookingId: string): Promise<Result<BookingInvoice[], AppError>> {
    return this.invoices.findByBooking(bookingId);
  }

  async generate(booking: Booking): Promise<Result<BookingInvoice, AppError>> {
    const itemsResult = await this.items.findByBooking(booking.id);
    if (isErr(itemsResult)) return itemsResult;

    const travellersResult = await this.travellers.findByBooking(booking.id);
    if (isErr(travellersResult)) return travellersResult;
    const leadTraveller = travellersResult.value.find((t) => t.isLeadTraveller) ?? null;

    const countResult = await this.invoices.countAll();
    if (isErr(countResult)) return countResult;
    const invoiceNumber = generateInvoiceNumber(countResult.value + 1);

    this.logger.info("Generating booking invoice", { bookingId: booking.id, invoiceNumber });
    const created = await this.invoices.create(buildBookingInvoice(invoiceNumber, booking, itemsResult.value, leadTraveller));
    if (isErr(created)) return created;
    return ok(created.value);
  }
}

