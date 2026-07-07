"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Script from "next/script";

export default function CheckoutPage() {
  const { bookingId } = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handlePayment = async () => {
    setLoading(true);
    setError("");

    try {
      // 1. Create Order
      const res = await fetch("/api/checkout/razorpay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId }),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Failed to initiate payment");
      }

      // 2. Initialize Razorpay
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_TAkaz2OKIIaQaj",
        amount: data.amount,
        currency: data.currency,
        name: "The Vacation Voice",
        description: "Booking Payment",
        order_id: data.orderId,
        handler: async function (response: any) {
          // 3. Verify Payment
          const verifyRes = await fetch("/api/checkout/razorpay/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              bookingId,
            }),
          });

          const verifyData = await verifyRes.json();
          if (verifyRes.ok) {
            router.push(`/checkout/success?bookingId=${bookingId}`);
          } else {
            setError(verifyData.error || "Payment verification failed");
          }
        },
        prefill: {
          name: "Customer",
          email: "customer@example.com",
        },
        theme: {
          color: "#0f172a",
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on("payment.failed", function (response: any) {
        setError(response.error.description);
      });
      rzp.open();

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg border border-slate-100">
        <h1 className="text-2xl font-bold mb-2">Complete Your Booking</h1>
        <p className="text-slate-500 mb-6 text-sm">Secure your reservation by completing the payment below.</p>
        
        {error && <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-md border border-red-200">{error}</div>}
        
        <button
          onClick={handlePayment}
          disabled={loading}
          className="w-full bg-slate-900 text-white py-3 rounded-lg font-medium hover:bg-slate-800 disabled:opacity-50 transition-colors"
        >
          {loading ? "Processing..." : "Pay Now"}
        </button>
      </div>
    </div>
  );
}
