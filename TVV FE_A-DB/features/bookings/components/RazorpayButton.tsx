"use client";

import { useState } from "react";
import Script from "next/script";
import { Button } from "@/components/ui/Button";

interface RazorpayButtonProps {
  bookingId: string;
  amount: number;
  onSuccess: () => void;
}

export function RazorpayButton({ bookingId, amount, onSuccess }: RazorpayButtonProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePayment = async () => {
    setIsProcessing(true);
    try {
      // 1. Create order on the backend
      const res = await fetch("/api/checkout/razorpay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId }),
      });
      
      const data = await res.json();
      
      if (!res.ok || data.error) {
        alert(data.error || "Failed to create payment order");
        setIsProcessing(false);
        return;
      }

      const { orderId, amount: orderAmount, currency } = data;

      // 2. Initialize Razorpay
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "",
        amount: orderAmount,
        currency,
        name: "TVV Travel OS",
        description: "Booking Payment",
        order_id: orderId,
        handler: function (response: any) {
          // Verify on backend
          fetch("/api/webhooks/razorpay", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-razorpay-signature": response.razorpay_signature,
            },
            body: JSON.stringify({
              payload: {
                payment: {
                  entity: {
                    id: response.razorpay_payment_id,
                    order_id: response.razorpay_order_id,
                  }
                }
              }
            }),
          }).then(() => {
            alert("Payment successful!");
            onSuccess();
          });
        },
        prefill: {
          name: "Customer Name",
          email: "customer@example.com",
          contact: "9999999999"
        },
        theme: {
          color: "#0f766e"
        }
      };

      const razorpay = new (window as any).Razorpay(options);
      razorpay.on("payment.failed", function () {
        alert("Payment failed");
        setIsProcessing(false);
      });
      
      razorpay.open();
    } catch (error) {
      console.error(error);
      alert("Payment initiation failed");
      setIsProcessing(false);
    }
  };

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      <Button
        onClick={handlePayment}
        disabled={isProcessing}
        className="bg-teal hover:bg-teal-hover text-white px-6 py-2 rounded-md"
      >
        {isProcessing ? "Processing..." : `Pay Now`}
      </Button>
    </>
  );
}
