import type { AppError } from "@/shared/errors";
import type { Result } from "@/shared/types";
import { getBookingItemService, getBookingService, getBookingStatusHistoryService, getBookingTimelineService } from "../module";
import type { BookingItem } from "../types/booking-item";
import type { BookingInvoice } from "../types/booking-invoice";
import type { BookingVoucher } from "../types/booking-voucher";
import type { BookingStatusHistory } from "../types/booking-status-history";
import type { BookingTimelineEntry } from "../types/booking-timeline";

export async function listBookingItemsHandler(bookingId: string): Promise<Result<BookingItem[], AppError>> {
  return getBookingItemService().listByBooking(bookingId);
}

export async function listStatusHistoryHandler(bookingId: string): Promise<Result<BookingStatusHistory[], AppError>> {
  return getBookingStatusHistoryService().listByBooking(bookingId);
}

export async function listTimelineHandler(bookingId: string): Promise<Result<BookingTimelineEntry[], AppError>> {
  return getBookingTimelineService().listByBooking(bookingId);
}

export async function generateVoucherHandler(bookingId: string): Promise<Result<BookingVoucher, AppError>> {
  return getBookingService().generateVoucher(bookingId);
}

export async function generateInvoiceHandler(bookingId: string): Promise<Result<BookingInvoice, AppError>> {
  return getBookingService().generateInvoice(bookingId);
}
