import { NextResponse } from "next/server";
import { getPaymentService } from "@/modules/payments/module";

export async function POST(req: Request) {
  try {
    const payload = await req.json();
    const signature = req.headers.get("x-razorpay-signature");

    if (!signature) {
      return NextResponse.json({ error: "Missing signature" }, { status: 400 });
    }

    const razorpayOrderId = payload?.payload?.payment?.entity?.order_id;
    const razorpayPaymentId = payload?.payload?.payment?.entity?.id;

    if (!razorpayOrderId || !razorpayPaymentId) {
      return NextResponse.json({ error: "Invalid payload structure" }, { status: 400 });
    }

    const paymentService = getPaymentService();
    const result = await paymentService.verifyPayment(
      razorpayOrderId,
      razorpayPaymentId,
      signature
    );

    if (!result.ok) {
      return NextResponse.json({ error: result.error.message }, { status: 400 });
    }

    return NextResponse.json({ status: "ok" });
  } catch (error) {
    console.error("Razorpay Webhook Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
