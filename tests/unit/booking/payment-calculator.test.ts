import { describe, expect, it } from "vitest";
import { computePaymentAggregate } from "@/modules/booking/payments/payment-calculator";
import type { BookingPayment } from "@/modules/booking/types/booking-payment";

function payment(overrides: Partial<BookingPayment> = {}): BookingPayment {
  return {
    id: "p1",
    bookingId: "b1",
    amount: 1000,
    currency: "INR",
    method: null,
    status: "PAID",
    reference: null,
    paidAt: "2026-01-01T00:00:00.000Z",
    notes: null,
    createdAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("computePaymentAggregate", () => {
  it("no payments → PENDING, zero paid", () => {
    const result = computePaymentAggregate(65_000, []);
    expect(result).toEqual({ amountPaid: 0, paymentStatus: "PENDING" });
  });

  it("a partial PAID payment → PARTIAL", () => {
    const result = computePaymentAggregate(65_000, [payment({ amount: 20_000 })]);
    expect(result).toEqual({ amountPaid: 20_000, paymentStatus: "PARTIAL" });
  });

  it("payments summing to exactly the total → PAID", () => {
    const result = computePaymentAggregate(65_000, [payment({ amount: 20_000 }), payment({ id: "p2", amount: 45_000 })]);
    expect(result).toEqual({ amountPaid: 65_000, paymentStatus: "PAID" });
  });

  it("payments exceeding the total (overpayment) still resolve to PAID, not an error", () => {
    const result = computePaymentAggregate(65_000, [payment({ amount: 70_000 })]);
    expect(result.paymentStatus).toBe("PAID");
    expect(result.amountPaid).toBe(70_000);
  });

  it("a PENDING or FAILED payment record does not count toward amountPaid", () => {
    const result = computePaymentAggregate(65_000, [payment({ amount: 20_000, status: "PENDING" }), payment({ id: "p2", amount: 10_000, status: "FAILED" })]);
    expect(result).toEqual({ amountPaid: 0, paymentStatus: "PENDING" });
  });

  it("a REFUNDED payment is subtracted back out, dropping status from PAID back to PENDING/PARTIAL", () => {
    const result = computePaymentAggregate(65_000, [payment({ id: "p1", amount: 65_000, status: "PAID" }), payment({ id: "p2", amount: 65_000, status: "REFUNDED" })]);
    expect(result.amountPaid).toBe(0);
    expect(result.paymentStatus).toBe("PENDING");
  });

  it("a zero-total booking is never reported PAID even with a zero-amount payment sum", () => {
    const result = computePaymentAggregate(0, []);
    expect(result.paymentStatus).toBe("PENDING");
  });
});
