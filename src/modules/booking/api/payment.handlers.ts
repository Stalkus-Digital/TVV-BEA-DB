import type { AppError } from "@/shared/errors";
import type { Result } from "@/shared/types";
import { getBookingPaymentService, getBookingService } from "../module";
import type { BookingPayment } from "../types/booking-payment";

export async function listPaymentsHandler(bookingId: string): Promise<Result<BookingPayment[], AppError>> {
  return getBookingPaymentService().listByBooking(bookingId);
}

export async function recordPaymentHandler(bookingId: string, body: unknown): Promise<Result<BookingPayment, AppError>> {
  return getBookingService().recordPayment(bookingId, body);
}
