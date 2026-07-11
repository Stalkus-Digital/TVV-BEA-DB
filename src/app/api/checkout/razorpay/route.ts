import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import { prisma } from "@/shared/database/prisma-client";
import { getRateLimiter, getClientIp } from "@/shared/lib/rate-limiter";

// CF-7: Rate limit Razorpay order creation — 20 orders per IP per hour
// Prevents order-spamming which wastes Razorpay order quota.
const orderLimiter = getRateLimiter("razorpay-order", { windowMs: 60 * 60_000, max: 20 });

/**
 * POST /api/checkout/razorpay
 *
 * ✅ HR-1 FIX: This is now the ONLY order-creation endpoint.
 * The duplicate path in payment.service.ts createOrder() has been removed in favour of this handler.
 *
 * Creates a Razorpay order for the REMAINING balance (totalAmount - amountPaid),
 * not the full total, to correctly support partial payments.
 */
export async function POST(req: Request) {
  try {
    // Rate limit
    const ip = getClientIp(req);
    const limit = orderLimiter.check(ip);
    if (!limit.allowed) {
      return NextResponse.json(
        { error: "Too many payment requests. Please try again later." },
        { status: 429, headers: { "Retry-After": String(Math.ceil(limit.retryAfterMs / 1000)) } }
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

    // ✅ HR-1 FIX: Use remaining balance, not full amount
    const amountDue = booking.totalAmount - booking.amountPaid;
    if (amountDue <= 0) {
      return NextResponse.json({ error: "Booking is already fully paid" }, { status: 400 });
    }

    const instance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID || "",
      key_secret: process.env.RAZORPAY_KEY_SECRET || "",
    });

    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      console.error("[checkout/razorpay] RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET is not set");
      return NextResponse.json({ error: "Payment gateway not configured" }, { status: 503 });
    }

    const options = {
      amount: Math.round(amountDue * 100), // Razorpay expects paise
      currency: booking.currency?.toUpperCase() ?? "INR",
      receipt: booking.bookingNumber,
      notes: { bookingId: booking.id },
    };

    const order = await instance.orders.create(options);

    return NextResponse.json({
      orderId: order.id,
      amount: options.amount,
      currency: options.currency,
      amountDue,
    });
  } catch (error) {
    console.error("Razorpay Order Error:", error);
    return NextResponse.json({ error: "Failed to create payment order" }, { status: 500 });
  }
}
