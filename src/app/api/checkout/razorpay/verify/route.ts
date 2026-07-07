import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/shared/database/prisma-client";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, bookingId } = body;

    const secret = process.env.RAZORPAY_KEY_SECRET || "";

    const generatedSignature = crypto
      .createHmac("sha256", secret)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      return NextResponse.json({ error: "Invalid payment signature" }, { status: 400 });
    }

    // Payment is valid, update the Booking and create a BookingPayment record
    const booking = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        paymentStatus: "PAID",
        status: "CONFIRMED", // Or leave as PENDING if manual review is needed
      }
    });

    await prisma.bookingPayment.create({
      data: {
        bookingId: bookingId,
        amount: booking.totalAmount,
        currency: booking.currency,
        method: "RAZORPAY",
        status: "COMPLETED",
        reference: razorpay_payment_id,
        paidAt: new Date(),
      }
    });

    return NextResponse.json({ success: true, message: "Payment verified successfully" });
  } catch (error) {
    console.error("Razorpay Verify Error:", error);
    return NextResponse.json({ error: "Failed to verify payment" }, { status: 500 });
  }
}
