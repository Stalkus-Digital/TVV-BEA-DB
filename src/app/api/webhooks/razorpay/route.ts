import { NextResponse } from "next/server";
import { getPaymentService } from "@/modules/payments/module";
import { prisma } from "@/shared/database/prisma-client";
import { enqueueBooking } from "@/shared/lib/queue";
import { getIntegrationConfigResolver } from "@/modules/integrations";
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

    const webhookSecret = (await getIntegrationConfigResolver().getRazorpayCredentials()).webhookSecret;
    if (!webhookSecret) {
      console.error("Razorpay webhook secret is not set — webhook verification is disabled. Configure it in Integrations or RAZORPAY_WEBHOOK_SECRET.");
      return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 });
    }

    if (!verifyRazorpaySignature(rawBody, signature, webhookSecret)) {
      console.warn("Razorpay webhook signature mismatch — request rejected");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const payload = JSON.parse(rawBody);

    // PAY-001 FIX: Razorpay's own delivery id (payload.id, e.g. "evt_xxx")
    // is what idempotency must key on. The old fallback of
    // `payload?.id || crypto.randomUUID()` silently defeated duplicate
    // protection on any payload missing that field, since every retry
    // would then mint a fresh random id and reprocess from scratch. Fail
    // closed instead — Razorpay always sends this field in practice.
    const eventId: string | undefined = payload?.id;
    if (!eventId) {
      console.error("Razorpay webhook payload missing top-level id — cannot guarantee idempotency, rejecting", { event: payload?.event });
      return NextResponse.json({ error: "Missing event id" }, { status: 400 });
    }

    // PAY-001 FIX: claim the idempotency lock BEFORE processing, not after.
    // The old order (process → then create the lock row) left a window
    // where two near-simultaneous deliveries of the same event could both
    // pass the earlier findUnique check and both call processPayment(),
    // double-recording the payment. Creating the row first and relying on
    // its unique id constraint makes the claim atomic; a concurrent
    // duplicate fails here with P2002 and is treated as "already being/
    // been handled" rather than racing into payment processing.
    try {
      await prisma.webhookEvent.create({
        data: { id: eventId, type: payload.event || "unknown", status: "RECEIVED" },
      });
    } catch (error: any) {
      if (error?.code !== "P2002") throw error;

      // Row already exists. If it's a genuinely completed event, stop here
      // — this is Razorpay re-delivering something we've already handled.
      // If it's stuck at RECEIVED/FAILED (a prior attempt crashed or errored
      // before finishing), this delivery is the retry that's supposed to
      // fix that — re-claim it and fall through to processing rather than
      // silently swallowing a retry Razorpay is relying on to succeed.
      const existing = await prisma.webhookEvent.findUnique({ where: { id: eventId } });
      if (existing?.status === "PROCESSED") {
        return NextResponse.json({ status: "already processed" }, { status: 200 });
      }
      await prisma.webhookEvent.update({ where: { id: eventId }, data: { status: "RECEIVED" } });
    }

    const eventType: string = payload.event || "";
    const paymentEntity = payload?.payload?.payment?.entity;

    try {
      if (eventType === "payment.failed") {
        if (!paymentEntity?.id) {
          return NextResponse.json({ error: "Invalid payload structure" }, { status: 400 });
        }
        await getPaymentService().recordPaymentFailure(paymentEntity?.notes?.bookingId, paymentEntity.id);
      } else if (eventType === "payment.captured" || eventType === "payment.authorized" || !eventType) {
        const razorpayOrderId = paymentEntity?.order_id;
        const razorpayPaymentId = paymentEntity?.id;

        if (!razorpayOrderId || !razorpayPaymentId) {
          return NextResponse.json({ error: "Invalid payload structure" }, { status: 400 });
        }

        const result = await getPaymentService().processPayment(razorpayPaymentId);
        if (!result.ok) {
          // Mark the lock as failed so a genuine transient error (not a
          // duplicate) can be retried by Razorpay's own webhook retry policy.
          await prisma.webhookEvent.update({ where: { id: eventId }, data: { status: "FAILED" } });
          return NextResponse.json({ error: result.error.message }, { status: 400 });
        }

        if (paymentEntity?.notes?.bookingId) {
          await enqueueBooking(paymentEntity.notes.bookingId, payload);
        }
      }
      // Other event types (refund.processed, order.paid, etc.) are
      // acknowledged but not acted on here — refunds are admin-initiated
      // via PaymentService.refund(), not webhook-driven, this sprint.
    } catch (processingError) {
      await prisma.webhookEvent.update({ where: { id: eventId }, data: { status: "FAILED" } }).catch(() => undefined);
      throw processingError;
    }

    await prisma.webhookEvent.update({ where: { id: eventId }, data: { status: "PROCESSED" } });

    return NextResponse.json({ status: "ok" });
  } catch (error) {
    console.error("Razorpay Webhook Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
