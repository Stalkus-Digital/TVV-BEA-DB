import { NextResponse } from "next/server";
import { prisma } from "@/shared/database/prisma-client";
import { getRateLimiter, getClientIp } from "@/shared/lib/rate-limiter";
import { getIntegrationConfigResolver } from "@/modules/integrations";
import { getPhonePeAdapter } from "@/modules/payments/adapters/phonepe";

const orderLimiter = getRateLimiter("phonepe-order", { windowMs: 60 * 60_000, max: 20 });

/**
 * POST /api/checkout/phonepe
 * Creates a PhonePe pay-page session when PhonePe is the active gateway.
 */
export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);
    const limit = await orderLimiter.check(ip);
    if (!limit.allowed) {
      return NextResponse.json(
        { error: "Too many payment requests. Please try again later." },
        { status: 429, headers: { "Retry-After": String(Math.ceil(limit.retryAfterMs / 1000)) } }
      );
    }

    const resolver = getIntegrationConfigResolver();
    const active = await resolver.getActivePaymentProvider();
    if (active !== "phonepe") {
      return NextResponse.json(
        { error: "PhonePe is not the active payment gateway", activeProvider: active },
        { status: 409 }
      );
    }

    const body = await req.json();
    const { bookingId } = body as { bookingId?: string };
    if (!bookingId) {
      return NextResponse.json({ error: "Missing bookingId" }, { status: 400 });
    }

    const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    const amountDue = booking.totalAmount - booking.amountPaid;
    if (amountDue <= 0) {
      return NextResponse.json({ error: "Booking is already fully paid" }, { status: 400 });
    }

    const origin = new URL(req.url).origin;
    const frontendBase = process.env.FRONTEND_URL || origin;
    const result = await getPhonePeAdapter().createPayment({
      bookingId: booking.id,
      bookingNumber: booking.bookingNumber,
      amountInr: amountDue,
      redirectUrl: `${frontendBase}/checkout/success?bookingId=${booking.id}`,
      callbackUrl: `${origin}/api/webhooks/phonepe`,
    });

    return NextResponse.json({
      ...result,
      amountDue,
    });
  } catch (error) {
    console.error("PhonePe Order Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create PhonePe payment" },
      { status: 500 }
    );
  }
}
