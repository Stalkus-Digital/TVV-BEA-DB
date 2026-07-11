import { NextResponse } from "next/server";
import { getPaymentService } from "@/modules/payments/module";
import { prisma } from "@/shared/database/prisma-client";
import { enqueueBooking } from "@/shared/lib/queue";
import crypto from "crypto";

/**
 * Verifies the Razorpay webhook signature using HMAC-SHA256.
 * Razorpay signs the raw request body with the webhook secret and sends the
 * digest as the `x-razorpay-signature` header. We must verify this before
 * processing ANY payment event — failure to do so lets anyone POST a fake
 * payment.captured event and mark any booking PAID for free.
 */
function verifyRazorpaySignature(rawBody: string, signature: string, secret: string): boolean {
  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(rawBody)
    .digest("hex");
  // Constant-time comparison to prevent timing attacks
  try {
    return crypto.timingSafeEqual(
      Buffer.from(expectedSignature, "hex"),
      Buffer.from(signature, "hex")
    );
  } catch {
    // Buffer.from will throw if the strings are different lengths — that itself means invalid
    return false;
  }
}

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-razorpay-signature");

    if (!signature) {
      return NextResponse.json({ error: "Missing signature" }, { status: 400 });
    }

    // Verify HMAC-SHA256 signature before parsing or trusting the payload
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error("RAZORPAY_WEBHOOK_SECRET is not set — webhook verification is disabled. Set this env var immediately.");
      return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 });
    }

    if (!verifyRazorpaySignature(rawBody, signature, webhookSecret)) {
      console.warn("Razorpay webhook signature mismatch — request rejected");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const payload = JSON.parse(rawBody);

    const razorpayOrderId = payload?.payload?.payment?.entity?.order_id;
    const razorpayPaymentId = payload?.payload?.payment?.entity?.id;
    const eventId = payload?.id || crypto.randomUUID();

    if (!razorpayOrderId || !razorpayPaymentId) {
      return NextResponse.json({ error: "Invalid payload structure" }, { status: 400 });
    }

    // Idempotency check
    const existingEvent = await prisma.webhookEvent.findUnique({
      where: { id: eventId }
    });

    if (existingEvent) {
      return NextResponse.json({ status: "already processed" }, { status: 200 });
    }

    const paymentService = getPaymentService();
    const result = await paymentService.processPayment(razorpayPaymentId);

    if (!result.ok) {
      return NextResponse.json({ error: result.error.message }, { status: 400 });
    }

    // Save Idempotency lock
    await prisma.webhookEvent.create({
      data: { id: eventId, type: payload.event || "payment.captured", status: "PROCESSED" }
    });

    // Enqueue slow PNR operations instead of blocking
    if (payload?.payload?.payment?.entity?.notes?.bookingId) {
       await enqueueBooking(payload.payload.payment.entity.notes.bookingId, payload);
    }

    return NextResponse.json({ status: "ok" });
  } catch (error) {
    console.error("Razorpay Webhook Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
