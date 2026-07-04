import { describe, expect, it } from "vitest";
import { api, expectSuccess } from "../helpers/api-client";
import { buildApprovedQuoteScenario, buildBaseScenario } from "../helpers/scenario-builder";
import { quotePayload, travellerPayload } from "../fixtures/payloads";

describe("Booking API — full lifecycle over real HTTP", () => {
  it("create from an APPROVED quote, confirm, pay in full, ticket, complete", async () => {
    const scenario = await buildApprovedQuoteScenario();

    const booking = expectSuccess<{ id: string; status: string; bookingNumber: string; totalAmount: number }>(
      (await api.post("/api/bookings").send({ quoteId: scenario.quoteId })).body
    );
    expect(booking.status).toBe("DRAFT");
    expect(booking.bookingNumber).toMatch(/^BK-\d{6}$/);

    const items = expectSuccess<unknown[]>((await api.get(`/api/bookings/${booking.id}/items`)).body);
    expect(items.length).toBeGreaterThan(0);

    const travellers = expectSuccess<{ isLeadTraveller: boolean }[]>((await api.get(`/api/bookings/${booking.id}/travellers`)).body);
    expect(travellers.some((t) => t.isLeadTraveller)).toBe(true);

    const confirmed = expectSuccess<{ status: string }>((await api.post(`/api/bookings/${booking.id}/confirm`).send({})).body);
    expect(confirmed.status).toBe("CONFIRMED");

    const paid = expectSuccess<{ bookingId: string; amount: number }>(
      (await api.post(`/api/bookings/${booking.id}/payments`).send({ amount: booking.totalAmount, method: "Bank Transfer", status: "PAID" })).body
    );
    expect(paid.amount).toBe(booking.totalAmount);

    const afterPayment = expectSuccess<{ status: string; paymentStatus: string }>((await api.get(`/api/bookings/${booking.id}`)).body);
    expect(afterPayment.status).toBe("PAID");
    expect(afterPayment.paymentStatus).toBe("PAID");

    const ticketed = expectSuccess<{ status: string }>((await api.post(`/api/bookings/${booking.id}/ticket`).send({})).body);
    expect(ticketed.status).toBe("TICKETED");

    const completed = expectSuccess<{ status: string }>((await api.post(`/api/bookings/${booking.id}/complete`).send({})).body);
    expect(completed.status).toBe("COMPLETED");
  });

  it("rejects creation from a SENT-but-not-APPROVED quote", async () => {
    const base = await buildBaseScenario();
    const quote = expectSuccess<{ id: string }>((await api.post("/api/quotes").send(quotePayload(base.destinationId))).body);
    await api.post(`/api/quotes/${quote.id}/send`).send({});

    const response = await api.post("/api/bookings").send({ quoteId: quote.id });
    expect(response.status).toBe(409);
  });

  it("double-booking prevention: converting the same quote twice is rejected", async () => {
    const scenario = await buildApprovedQuoteScenario();
    const first = await api.post("/api/bookings").send({ quoteId: scenario.quoteId });
    expect(first.status).toBe(201);

    const second = await api.post("/api/bookings").send({ quoteId: scenario.quoteId });
    expect(second.status).toBe(409);
  });

  it("rejects a payment before the booking is CONFIRMED", async () => {
    const scenario = await buildApprovedQuoteScenario();
    const booking = expectSuccess<{ id: string }>((await api.post("/api/bookings").send({ quoteId: scenario.quoteId })).body);

    const response = await api.post(`/api/bookings/${booking.id}/payments`).send({ amount: 1000 });
    expect(response.status).toBe(409);
  });

  it("duplicate-traveller prevention rejects a second traveller with the same passport number", async () => {
    const scenario = await buildApprovedQuoteScenario();
    const booking = expectSuccess<{ id: string }>((await api.post("/api/bookings").send({ quoteId: scenario.quoteId })).body);

    const payload = travellerPayload({ passportNumber: "Z9999999" });
    const first = await api.post(`/api/bookings/${booking.id}/travellers`).send(payload);
    expect(first.status).toBe(201);

    const duplicate = await api.post(`/api/bookings/${booking.id}/travellers`).send({ ...payload, fullName: "A Different Name" });
    expect(duplicate.status).toBe(409);
  });

  it("cancel() is rejected once the booking is COMPLETED", async () => {
    const scenario = await buildApprovedQuoteScenario();
    const booking = expectSuccess<{ id: string; totalAmount: number }>((await api.post("/api/bookings").send({ quoteId: scenario.quoteId })).body);
    await api.post(`/api/bookings/${booking.id}/confirm`).send({});
    await api.post(`/api/bookings/${booking.id}/payments`).send({ amount: booking.totalAmount, status: "PAID" });
    await api.post(`/api/bookings/${booking.id}/ticket`).send({});
    await api.post(`/api/bookings/${booking.id}/complete`).send({});

    const response = await api.post(`/api/bookings/${booking.id}/cancel`).send({ reason: "too late" });
    expect(response.status).toBe(409);
  });

  it("generates a voucher and an invoice for a fully paid booking", async () => {
    const scenario = await buildApprovedQuoteScenario();
    const booking = expectSuccess<{ id: string; totalAmount: number }>((await api.post("/api/bookings").send({ quoteId: scenario.quoteId })).body);
    await api.post(`/api/bookings/${booking.id}/confirm`).send({});
    await api.post(`/api/bookings/${booking.id}/payments`).send({ amount: booking.totalAmount, status: "PAID" });

    const voucher = expectSuccess<{ voucherNumber: string }>((await api.post(`/api/bookings/${booking.id}/voucher`).send({})).body);
    expect(voucher.voucherNumber).toMatch(/^VCH-\d{6}$/);

    const invoice = expectSuccess<{ invoiceNumber: string; amountDue: number }>((await api.post(`/api/bookings/${booking.id}/invoice`).send({})).body);
    expect(invoice.invoiceNumber).toMatch(/^INV-\d{6}$/);
    expect(invoice.amountDue).toBe(0);
  });
});
