import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { prisma } from "@/shared/database/prisma-client";
import { getPaymentService } from "@/modules/payments/module";
import { getPhonePeAdapter } from "@/modules/payments/adapters/phonepe";
import { enqueueBooking } from "@/shared/lib/queue";

/**
 * POST /api/webhooks/phonepe
 * PhonePe S2S callback — body typically `{ response: "<base64>" }` with `X-VERIFY`.
 */
export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const xVerify = req.headers.get("x-verify") || req.headers.get("X-VERIFY");
    const adapter = getPhonePeAdapter();

    let base64Response: string | null = null;
    try {
      const parsed = JSON.parse(rawBody) as { response?: string };
      base64Response = typeof parsed.response === "string" ? parsed.response : null;
    } catch {
      base64Response = null;
    }

    if (!base64Response) {
      return NextResponse.json({ error: "Missing PhonePe response payload" }, { status: 400 });
    }

    const valid = await adapter.verifyCallbackChecksum(base64Response, xVerify);
    if (!valid) {
      console.warn("PhonePe webhook checksum mismatch — request rejected");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const decoded = adapter.decodeCallback(base64Response);
    const eventId = decoded.transactionId || decoded.merchantTransactionId || `phonepe-${randomUUID()}`;

    try {
      await prisma.webhookEvent.create({
        data: { id: eventId, type: decoded.code || "PHONEPE_CALLBACK", status: "RECEIVED" },
      });
    } catch (error: unknown) {
      const code = (error as { code?: string })?.code;
      if (code === "P2002") {
        return NextResponse.json({ success: true, message: "Already processed" });
      }
      throw error;
    }

    if (decoded.code !== "PAYMENT_SUCCESS" && decoded.code !== "PAYMENT_SUCCESSFUL") {
      await prisma.webhookEvent.update({
        where: { id: eventId },
        data: { status: "IGNORED" },
      });
      return NextResponse.json({ success: true, message: "Non-success event acknowledged" });
    }

    if (!decoded.bookingId || !decoded.transactionId || decoded.amount == null) {
      await prisma.webhookEvent.update({
        where: { id: eventId },
        data: { status: "FAILED" },
      });
      return NextResponse.json({ error: "Incomplete PhonePe payload" }, { status: 400 });
    }

    const result = await getPaymentService().processPhonePePayment({
      bookingId: decoded.bookingId,
      transactionId: decoded.transactionId,
      amountPaise: decoded.amount,
      merchantTransactionId: decoded.merchantTransactionId,
    });

    if (!result.ok) {
      await prisma.webhookEvent.update({
        where: { id: eventId },
        data: { status: "FAILED" },
      });
      return NextResponse.json({ error: result.error.message }, { status: 422 });
    }

    await prisma.webhookEvent.update({
      where: { id: eventId },
      data: { status: "PROCESSED" },
    });

    try {
      await enqueueBooking(decoded.bookingId, { source: "phonepe_webhook", eventId });
    } catch {
      // Non-fatal — fulfillment may already have run in processPhonePePayment
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("PhonePe webhook error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
