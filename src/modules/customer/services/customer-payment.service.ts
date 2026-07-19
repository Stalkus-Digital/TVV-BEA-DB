import { isErr, ok, type Result } from "@/shared/types";
import { BaseService, type ServiceContext } from "@/shared/services";
import type { AppError } from "@/shared/errors";
import { getBookingPaymentService, getBookingService, type BookingPayment } from "@/modules/booking";

export interface CustomerPaymentItem {
  id: string;
  bookingId: string;
  bookingNumber: string;
  amount: number;
  currency: string;
  method: string | null;
  status: BookingPayment["status"];
  reference: string | null;
  paidAt: string | null;
  notes: string | null;
  createdAt: string;
}

/**
 * Aggregates BookingPayment rows across every booking owned by the
 * authenticated customer — used by GET /api/me/payments.
 */
export class CustomerPaymentService extends BaseService {
  constructor(context: ServiceContext) {
    super(context);
  }

  async list(customerId: string): Promise<Result<CustomerPaymentItem[], AppError>> {
    const bookingsResult = await getBookingService().list({ customerId, page: 1, pageSize: 500 });
    if (isErr(bookingsResult)) return bookingsResult;

    const items: CustomerPaymentItem[] = [];
    for (const booking of bookingsResult.value.items) {
      const paymentsResult = await getBookingPaymentService().listByBooking(booking.id);
      if (isErr(paymentsResult)) return paymentsResult;
      for (const payment of paymentsResult.value) {
        items.push({
          id: payment.id,
          bookingId: booking.id,
          bookingNumber: booking.bookingNumber,
          amount: payment.amount,
          currency: payment.currency,
          method: payment.method,
          status: payment.status,
          reference: payment.reference,
          paidAt: payment.paidAt,
          notes: payment.notes,
          createdAt: payment.createdAt,
        });
      }
    }

    items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return ok(items);
  }
}
