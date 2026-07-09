import { BaseService, type ServiceContext } from "@/shared/services";
import { ok, err, type Result } from "@/shared/types";
import { InternalError, NotFoundError, type AppError } from "@/shared/errors";
import { prisma } from "@/shared/database/prisma-client";
import Razorpay from "razorpay";
import crypto from "crypto";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "rzp_test_mock",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "mock_secret",
});

export interface CreateOrderDto {
  bookingId: string;
}

export class PaymentService extends BaseService {
  constructor(context: ServiceContext) {
    super(context);
  }

  async createOrder(data: CreateOrderDto): Promise<Result<{ orderId: string, amount: number, currency: string }, AppError>> {
    try {
      
      
      const booking = await prisma.booking.findUnique({
        where: { id: data.bookingId },
      });

      if (!booking) {
        return err(new NotFoundError("Booking not found"));
      }

      const amountDue = booking.totalAmount - booking.amountPaid;
      if (amountDue <= 0) {
        return err(new InternalError("Booking is already fully paid"));
      }

      const options = {
        amount: Math.round(amountDue * 100),
        currency: booking.currency.toUpperCase(),
        receipt: booking.bookingNumber,
        notes: {
          bookingId: booking.id,
        },
      };

      const order = await razorpay.orders.create(options);

      return ok({
        orderId: order.id,
        amount: options.amount,
        currency: options.currency,
      });
    } catch (error) {
      this.logger.error("Failed to create razorpay order", { error });
      return err(new InternalError("Failed to create checkout order"));
    }
  }

  async verifyPayment(razorpayOrderId: string, razorpayPaymentId: string, signature: string): Promise<Result<void, AppError>> {
    try {
      const secret = process.env.RAZORPAY_KEY_SECRET || "mock_secret";
      const expectedSignature = crypto
        .createHmac("sha256", secret)
        .update(razorpayOrderId + "|" + razorpayPaymentId)
        .digest("hex");

      if (expectedSignature !== signature) {
        return err(new InternalError("Invalid payment signature"));
      }
      
      const payment = await razorpay.payments.fetch(razorpayPaymentId);
      
      if (payment.status === "captured" || payment.status === "authorized") {
        const bookingId = payment.notes?.bookingId as string;
        
        if (bookingId) {
          
          
          const paymentAmount = Number(payment.amount || 0) / 100;

          await prisma.$transaction(async (tx) => {
            const booking = await tx.booking.findUnique({ where: { id: bookingId } });
            if (!booking) return;

            await tx.bookingPayment.create({
              data: {
                bookingId,
                amount: paymentAmount,
                currency: payment.currency?.toUpperCase() || "INR",
                method: "RAZORPAY",
                status: "COMPLETED",
                reference: razorpayPaymentId,
                paidAt: new Date(),
                createdAt: new Date(),
              }
            });

            await tx.booking.update({
              where: { id: bookingId },
              data: {
                amountPaid: {
                  increment: paymentAmount,
                },
                paymentStatus: (booking.amountPaid + paymentAmount) >= booking.totalAmount ? "PAID" : "PARTIAL",
                updatedAt: new Date(),
              }
            });
          });

          // Trigger automated fulfillment (e.g. TripJack final bookings) and email if paid fully
          const updatedBooking = await prisma.booking.findUnique({ 
            where: { id: bookingId }
          });
          const travellers = await prisma.traveller.findMany({ where: { bookingId } });

          if (updatedBooking?.paymentStatus === "PAID") {
            const { getFulfillmentService } = await import("@/modules/booking/module");
            const fulfillmentService = getFulfillmentService();
            await fulfillmentService.fulfillBooking(bookingId);

            // Send confirmation email
            const leadTraveller = travellers?.find((t: any) => t.isLeadTraveller);
            if (leadTraveller?.email) {
              const { EmailService } = await import("@/modules/email/email.service");
              const { createLogger } = await import("@/shared/logger");
              const emailService = new EmailService({ logger: createLogger("email.service") });
              await emailService.sendBookingConfirmation(
                leadTraveller.email, 
                updatedBooking.bookingNumber, 
                paymentAmount, 
                payment.currency?.toUpperCase() || "INR"
              );
            }
          }
        }
      }

      return ok(undefined);
    } catch (error) {
      this.logger.error("Failed to verify razorpay payment", { error });
      return err(new InternalError("Failed to process payment"));
    }
  }
}
