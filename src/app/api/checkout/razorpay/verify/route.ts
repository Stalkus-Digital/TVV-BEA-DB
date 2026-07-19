import { jsonError, jsonSuccess } from "@/api";
import { getPaymentService } from "@/modules/payments/module";
import { isErr } from "@/shared/types";
import { ValidationError } from "@/shared/errors";

/**
 * PAY-001: this route used to reimplement signature verification and
 * payment recording inline — no amount validation against the booking, no
 * amountPaid update at all, no booking.status transition, an invalid
 * BookingPayment.status value ("SUCCESS", not part of the PaymentStatus
 * enum), and no protection against being called twice for the same
 * payment. Delegating to PaymentService.verifyPayment() (the same method
 * the webhook calls) fixes all of the above by construction — there is now
 * exactly one place that verifies a Razorpay payment and writes its result.
 */
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return jsonError(new ValidationError("Invalid request body"));
  }

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body as Record<string, unknown>;
  if (
    typeof razorpay_order_id !== "string" ||
    typeof razorpay_payment_id !== "string" ||
    typeof razorpay_signature !== "string"
  ) {
    return jsonError(new ValidationError("razorpay_order_id, razorpay_payment_id, and razorpay_signature are required"));
  }

  const result = await getPaymentService().verifyPayment(razorpay_order_id, razorpay_payment_id, razorpay_signature);
  if (isErr(result)) return jsonError(result.error);
  return jsonSuccess({ verified: true });
}
