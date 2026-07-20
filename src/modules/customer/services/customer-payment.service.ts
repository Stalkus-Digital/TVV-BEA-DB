import { ok, type Result } from "@/shared/types";
import { BaseService, type ServiceContext } from "@/shared/services";
import type { AppError } from "@/shared/errors";
import { prisma } from "@/shared/database/prisma-client";
import type { BookingPayment } from "@/modules/booking";

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
 * Single batched query (no N+1 per booking).
 */
export class CustomerPaymentService extends BaseService {
  constructor(context: ServiceContext) {
    super(context);
  }

  async list(customerId: string): Promise<Result<CustomerPaymentItem[], AppError>> {
    const bookings = await prisma.booking.findMany({
      where: { customerId },
      select: { id: true, bookingNumber: true },
    });
    if (bookings.length === 0) return ok([]);

    const bookingMap = new Map(bookings.map((b) => [b.id, b.bookingNumber]));
    const payments = await prisma.bookingPayment.findMany({
      where: { bookingId: { in: bookings.map((b) => b.id) } },
      orderBy: { createdAt: "desc" },
    });

    return ok(
      payments.map((payment) => ({
        id: payment.id,
        bookingId: payment.bookingId,
        bookingNumber: bookingMap.get(payment.bookingId) ?? payment.bookingId,
        amount: payment.amount,
        currency: payment.currency,
        method: payment.method,
        status: payment.status as BookingPayment["status"],
        reference: payment.reference,
        paidAt: payment.paidAt ? payment.paidAt.toISOString() : null,
        notes: payment.notes,
        createdAt: payment.createdAt.toISOString(),
      }))
    );
  }
}
