import type { BookingStatus } from "../types/booking-status";
import type { PaymentStatus } from "../types/booking-payment";
import type { BookingSortDir, BookingSortField } from "../repositories/booking.repository";

export interface ListBookingsQuery {
  status?: BookingStatus;
  paymentStatus?: PaymentStatus;
  destinationId?: string;
  sourceQuoteId?: string;
  customerId?: string;
  hasItemKind?: string;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: BookingSortField;
  sortDir?: BookingSortDir;
  page?: number;
  pageSize?: number;
}
