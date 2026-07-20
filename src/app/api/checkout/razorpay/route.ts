import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import { prisma } from "@/shared/database/prisma-client";
import { getRateLimiter, getClientIp } from "@/shared/lib/rate-limiter";
import { getIntegrationConfigResolver } from "@/modules/integrations";

const orderLimiter = getRateLimiter("razorpay-order", { windowMs: 60 * 60_000, max: 20 });

/**
 * POST /api/checkout/razorpay
 * Creates a Razorpay order when Razorpay is the active payment gateway.
 */
export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);
    const limit = orderLimiter.check(ip);
    if (!limit.allowed) {
      return NextResponse.json(
        { error: "Too many payment requests. Please try again later." },
        { status: 429, headers: { "Retry-After": String(Math.ceil(limit.retryAfterMs / 1000)) } }
      );
    }

    const resolver = getIntegrationConfigResolver();
    const active = await resolver.getActivePaymentProvider();
    if (active !== "razorpay") {
      return NextResponse.json(
        { error: "Razorpay is not the active payment gateway", activeProvider: active },
        { status: 409 }
      );
    }

    const body = await req.json();
    const { bookingId } = body;

    if (!bookingId) {
      return NextResponse.json({ error: "Missing bookingId" }, { status: 400 });
    }

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    const amountDue = booking.totalAmount - booking.amountPaid;
    if (amountDue <= 0) {
      return NextResponse.json({ error: "Booking is already fully paid" }, { status: 400 });
    }

    const creds = await resolver.getRazorpayCredentials();
    if (!creds.keyId || !creds.keySecret) {
      console.error("[checkout/razorpay] Razorpay credentials are not configured");
      return NextResponse.json({ error: "Payment gateway not configured" }, { status: 503 });
    }

    const instance = new Razorpay({
      key_id: creds.keyId,
      key_secret: creds.keySecret,
    });

    const options = {
      amount: Math.round(amountDue * 100),
      currency: booking.currency?.toUpperCase() ?? "INR",
      receipt: booking.bookingNumber,
      notes: { bookingId: booking.id },
    };

    const order = await instance.orders.create(options);

    return NextResponse.json({
      provider: "razorpay",
      orderId: order.id,
      amount: options.amount,
      currency: options.currency,
      amountDue,
      keyId: creds.keyId,
      // PAYMENT-UI-001: lets an anonymous payment-link visitor (no session,
      // no /api/me/* access) see what they're paying for before/while paying.
      bookingNumber: booking.bookingNumber,
      status: booking.status,
    });
  } catch (error) {
    console.error("Razorpay Order Error:", error);
    return NextResponse.json({ error: "Failed to create payment order" }, { status: 500 });
  }
}
