import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import { prisma } from "@/shared/database/prisma-client";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { bookingId } = body;

    if (!bookingId) {
      return NextResponse.json({ error: "Missing bookingId" }, { status: 400 });
    }

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId }
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    const instance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID || "",
      key_secret: process.env.RAZORPAY_KEY_SECRET || "",
    });

    // Razorpay requires amount in smallest currency unit (paise/cents)
    const options = {
      amount: Math.round(booking.totalAmount * 100),
      currency: booking.currency || "INR",
      receipt: `receipt_order_${booking.id}`,
    };

    const order = await instance.orders.create(options);

    return NextResponse.json({ orderId: order.id, amount: options.amount, currency: options.currency });
  } catch (error) {
    console.error("Razorpay Order Error:", error);
    return NextResponse.json({ error: "Failed to create payment order" }, { status: 500 });
  }
}
