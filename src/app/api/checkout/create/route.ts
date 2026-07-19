import { NextResponse } from "next/server";
import { prisma } from "@/shared/database/prisma-client";
import { getRateLimiter, getClientIp } from "@/shared/lib/rate-limiter";
import { getIntegrationConfigResolver } from "@/modules/integrations";

const orderLimiter = getRateLimiter("checkout-create", { windowMs: 60 * 60_000, max: 20 });

/**
 * POST /api/checkout/create
 * Gateway-agnostic entrypoint — routes to the active payment provider.
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

    const body = await req.json();
    const { bookingId } = body as { bookingId?: string };
    if (!bookingId) {
      return NextResponse.json({ error: "Missing bookingId" }, { status: 400 });
    }

    const provider = await getIntegrationConfigResolver().getActivePaymentProvider();
    const origin = new URL(req.url).origin;
    const path = provider === "phonepe" ? "/api/checkout/phonepe" : "/api/checkout/razorpay";

    const upstream = await fetch(`${origin}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-forwarded-for": ip },
      body: JSON.stringify({ bookingId }),
    });

    const data = await upstream.json();
    return NextResponse.json(data, { status: upstream.status });
  } catch (error) {
    console.error("Checkout create error:", error);
    return NextResponse.json({ error: "Failed to create payment" }, { status: 500 });
  }
}
