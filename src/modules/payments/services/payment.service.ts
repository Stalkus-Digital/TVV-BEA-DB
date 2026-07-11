import { BaseService, type ServiceContext } from "@/shared/services";
import { ok, err, type Result } from "@/shared/types";
import { InternalError, NotFoundError, ValidationError, type AppError } from "@/shared/errors";
import { prisma } from "@/shared/database/prisma-client";
import Razorpay from "razorpay";
import crypto from "crypto";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "rzp_test_mock",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "mock_secret",
});

/** Minimum valid payment (₹1 = lowest Razorpay denomination) */
const MIN_PAYMENT_AMOUNT = 1;

/** Maximum tolerance between expected and received amount (2%) */
const AMOUNT_TOLERANCE_PERCENT = 0.02;

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
        return err(new ValidationError("Booking is already fully paid"));
      }

      const options = {
        amount: Math.round(amountDue * 100),
        currency: booking.currency.toUpperCase(),
        receipt: booking.bookingNumber,
        notes: { bookingId: booking.id },
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

  /**
   * Called by the frontend checkout flow. Verifies the order-based signature
   * before processing the payment.
   */
  async verifyPayment(razorpayOrderId: string, razorpayPaymentId: string, signature: string): Promise<Result<void, AppError>> {
    const secret = process.env.RAZORPAY_KEY_SECRET || "mock_secret";
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(razorpayOrderId + "|" + razorpayPaymentId)
      .digest("hex");

    if (expectedSignature !== signature) {
      this.logger.warn("Payment signature mismatch", { razorpayOrderId, razorpayPaymentId });
      return err(new ValidationError("Invalid payment signature"));
    }

    return this.processPayment(razorpayPaymentId);
  }

  /**
   * Fetches the payment from Razorpay and reconciles it with the booking.
   * Called directly by the webhook (which verifies the webhook signature)
   * or by verifyPayment (which verifies the frontend signature).
   */
  async processPayment(razorpayPaymentId: string): Promise<Result<void, AppError>> {
    try {
      const payment = await razorpay.payments.fetch(razorpayPaymentId);

      if (payment.status === "captured" || payment.status === "authorized") {
        const bookingId = payment.notes?.bookingId as string;
        if (!bookingId) {
          this.logger.error("Payment captured but no bookingId in notes", { razorpayPaymentId });
          return err(new InternalError("Payment notes missing bookingId — cannot reconcile"));
        }

        const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
        if (!booking) {
          return err(new NotFoundError(`Booking ${bookingId} not found for payment reconciliation`));
        }

        const paymentAmount = Number(payment.amount || 0) / 100;

        // ✅ HR-3 FIX: Validate that the received amount is >= expected minimum
        if (paymentAmount < MIN_PAYMENT_AMOUNT) {
          this.logger.error("Payment amount is below minimum threshold", {
            paymentAmount, razorpayPaymentId, bookingId,
          });
          return err(new ValidationError(`Payment amount ₹${paymentAmount} is below the minimum allowed`));
        }

        // ✅ HR-3 FIX: Cross-check amount against booking — allow at most 2% tolerance
        const expectedAmount = booking.totalAmount - booking.amountPaid;
        const tolerance = expectedAmount * AMOUNT_TOLERANCE_PERCENT;
        if (paymentAmount < expectedAmount - tolerance) {
          this.logger.error("Payment amount does not match booking expected amount", {
            paymentAmount, expectedAmount, bookingId, razorpayPaymentId,
          });
          return err(new ValidationError(
            `Payment ₹${paymentAmount} is less than the expected ₹${expectedAmount} for booking ${booking.bookingNumber}. Contact support.`
          ));
        }

        await prisma.$transaction(async (tx) => {
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

          const newAmountPaid = booking.amountPaid + paymentAmount;
          await tx.booking.update({
            where: { id: bookingId },
            data: {
              amountPaid: newAmountPaid,
              paymentStatus: newAmountPaid >= booking.totalAmount ? "PAID" : "PARTIAL",
              updatedAt: new Date(),
            }
          });
        });

        // Trigger fulfillment and email after payment confirmation
        const updatedBooking = await prisma.booking.findUnique({ where: { id: bookingId } });
        const travellers = await prisma.traveller.findMany({ where: { bookingId } });

        if (updatedBooking?.paymentStatus === "PAID") {
          // Trigger fulfillment
          const { getFulfillmentService } = await import("@/modules/booking/module");
          const fulfillmentService = getFulfillmentService();
          await fulfillmentService.fulfillBooking(bookingId);

          // ✅ HR-4 FIX: Email delivery — fail with explicit warning when SMTP not configured
          const leadTraveller = travellers?.find((t: any) => t.isLeadTraveller);
          if (leadTraveller?.email) {
            const { EmailService } = await import("@/modules/email/email.service");
            const { createLogger } = await import("@/shared/logger");
            const emailService = new EmailService({ logger: createLogger("email.service") });

            if (!process.env.SMTP_HOST) {
              this.logger.warn(
                "[SMTP NOT CONFIGURED] Booking confirmation email was NOT sent to " + leadTraveller.email +
                ". Set SMTP_HOST, SMTP_USER, and SMTP_PASS in production env to enable transactional emails."
              );
            } else {
              const emailResult = await emailService.sendBookingConfirmation(
                leadTraveller.email,
                updatedBooking.bookingNumber,
                paymentAmount,
                payment.currency?.toUpperCase() || "INR"
              );
              if (!emailResult.ok) {
                // Log the failure but don't fail the whole payment — payment is already recorded.
                this.logger.error("Failed to send booking confirmation email", {
                  to: leadTraveller.email,
                  bookingNumber: updatedBooking.bookingNumber,
                  error: emailResult.error.message,
                });
              }
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
