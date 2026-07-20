import type { AppError } from "@/shared/errors";
import type { PaginatedResult, Result } from "@/shared/types";
import type { AuthContext } from "@/modules/auth";
import {
  getBookingActivityService,
  getBookingItemService,
  getBookingService,
  getBookingStatusHistoryService,
  getBookingTimelineService,
  getInvoiceService,
  getVoucherService,
} from "../module";
import type { BookingItem } from "../types/booking-item";
import type { BookingInvoice } from "../types/booking-invoice";
import type { BookingVoucher } from "../types/booking-voucher";
import type { BookingStatusHistory } from "../types/booking-status-history";
import type { BookingTimelineEntry } from "../types/booking-timeline";
import type { BookingActivityCategory, BookingActivityEvent } from "../types/booking-activity";

export async function listBookingItemsHandler(bookingId: string): Promise<Result<BookingItem[], AppError>> {
  return getBookingItemService().listByBooking(bookingId);
}

export async function listStatusHistoryHandler(bookingId: string): Promise<Result<BookingStatusHistory[], AppError>> {
  return getBookingStatusHistoryService().listByBooking(bookingId);
}

export async function listTimelineHandler(bookingId: string): Promise<Result<BookingTimelineEntry[], AppError>> {
  return getBookingTimelineService().listByBooking(bookingId);
}

export async function listBookingActivityHandler(
  bookingId: string,
  query: { category?: BookingActivityCategory | "all"; page?: number; pageSize?: number } = {}
): Promise<Result<PaginatedResult<BookingActivityEvent>, AppError>> {
  return getBookingActivityService().listByBooking(bookingId, query);
}

export async function generateVoucherHandler(
  bookingId: string,
  context: AuthContext | null = null
): Promise<Result<BookingVoucher, AppError>> {
  return getBookingService().generateVoucher(bookingId, context?.userId ?? null);
}

export async function generateInvoiceHandler(
  bookingId: string,
  context: AuthContext | null = null
): Promise<Result<BookingInvoice, AppError>> {
  return getBookingService().generateInvoice(bookingId, context?.userId ?? null);
}

export async function listInvoicesHandler(bookingId: string): Promise<Result<BookingInvoice[], AppError>> {
  return getInvoiceService().listByBooking(bookingId);
}

export async function listVouchersHandler(bookingId: string): Promise<Result<BookingVoucher[], AppError>> {
  return getVoucherService().listByBooking(bookingId);
}
