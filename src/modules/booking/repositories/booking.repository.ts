import type { PaginatedResult, PaginationParams, Result } from "@/shared/types";
import type { BaseRepository } from "@/shared/repositories";
import type { AppError } from "@/shared/errors";
import type { Booking } from "../types/booking";
import type { BookingStatus } from "../types/booking-status";
import type { PaymentStatus } from "../types/booking-payment";

export type BookingSortField =
  | "createdAt"
  | "bookingNumber"
  | "status"
  | "paymentStatus"
  | "totalAmount"
  | "amountPaid";

export type BookingSortDir = "asc" | "desc";

export interface BookingListFilter extends PaginationParams {
  status?: BookingStatus;
  paymentStatus?: PaymentStatus;
  destinationId?: string;
  sourceQuoteId?: string;
  /** Sprint 13 — row-level ownership scoping, e.g. `getBookingService().list({ customerId })`. */
  customerId?: string;
  hasItemKind?: string;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: BookingSortField;
  sortDir?: BookingSortDir;
}

export interface BookingRepository extends BaseRepository<Booking, string> {
  findByFilter(filter: BookingListFilter): Promise<Result<PaginatedResult<Booking>, AppError>>;
  countAll(): Promise<Result<number, AppError>>;
}
