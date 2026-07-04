import { describe, expect, it } from "vitest";
import { isErr, isOk } from "@/shared/types";
import { getBookingService, getTravellerService } from "@/modules/booking";
import { getQuoteItemService, getQuoteService } from "@/modules/quote";
import { getDestinationService } from "@/modules/destination";

async function setupApprovedQuote() {
  const destination = await getDestinationService().create({ name: `Booking Test Destination ${Date.now()}-${Math.random()}`, countryId: "country-1" });
  if (!isOk(destination)) throw new Error("destination setup failed");

  const quote = await getQuoteService().create({
    title: "Booking Lifecycle Quote",
    destinationId: destination.value.id,
    travelerDetails: { leadTraveler: { name: "Priya Nair", email: "priya@example.com" }, adults: 2 },
  });
  if (!isOk(quote)) throw new Error("quote setup failed");

  await getQuoteItemService().add(quote.value.id, { title: "Package", quantity: 2, unitPrice: 30_000 });
  await getQuoteService().send(quote.value.id);
  await getQuoteService().approve(quote.value.id);

  return quote.value;
}

describe("BookingService.createFromQuote — the only entry point", () => {
  it("rejects creation from a non-APPROVED quote, reusing Quote's own guard", async () => {
    const destination = await getDestinationService().create({ name: `Draft Quote Destination ${Date.now()}`, countryId: "country-1" });
    if (!isOk(destination)) throw new Error("setup failed");
    const draftQuote = await getQuoteService().create({
      title: "Still Draft",
      destinationId: destination.value.id,
      travelerDetails: { leadTraveler: { name: "X", email: "x@example.com" }, adults: 1 },
    });
    if (!isOk(draftQuote)) throw new Error("setup failed");

    const result = await getBookingService().createFromQuote({ quoteId: draftQuote.value.id });
    expect(isErr(result)).toBe(true);
    if (isErr(result)) expect(result.error.constructor.name).toBe("ConflictError");
  });

  it("succeeds from an APPROVED quote, freezing items and seeding the lead traveller", async () => {
    const quote = await setupApprovedQuote();
    const result = await getBookingService().createFromQuote({ quoteId: quote.id });

    expect(isOk(result)).toBe(true);
    if (isOk(result)) {
      expect(result.value.status).toBe("DRAFT");
      expect(result.value.sourceQuoteId).toBe(quote.id);
      expect(result.value.totalAmount).toBe(60_000);
      expect(result.value.bookingNumber).toMatch(/^BK-\d{6}$/);

      const travellers = await getTravellerService().listByBooking(result.value.id);
      if (isOk(travellers)) {
        expect(travellers.value).toHaveLength(1);
        expect(travellers.value[0].isLeadTraveller).toBe(true);
        expect(travellers.value[0].fullName).toBe("Priya Nair");
      }
    }
  });

  it("converts the source Quote to CONVERTED as a side effect — never leaves it APPROVED after a successful booking", async () => {
    const quote = await setupApprovedQuote();
    await getBookingService().createFromQuote({ quoteId: quote.id });

    const afterBooking = await getQuoteService().getById(quote.id);
    if (isOk(afterBooking)) expect(afterBooking.value.status).toBe("CONVERTED");
  });

  it("double-booking prevention: a second attempt against the same (now CONVERTED) quote is rejected", async () => {
    const quote = await setupApprovedQuote();
    const first = await getBookingService().createFromQuote({ quoteId: quote.id });
    expect(isOk(first)).toBe(true);

    const second = await getBookingService().createFromQuote({ quoteId: quote.id });
    expect(isErr(second)).toBe(true);
  });
});

describe("Traveller duplicate prevention", () => {
  it("rejects a second traveller with the same passport number", async () => {
    const quote = await setupApprovedQuote();
    const booking = await getBookingService().createFromQuote({ quoteId: quote.id });
    if (!isOk(booking)) throw new Error("setup failed");

    const first = await getTravellerService().add(booking.value.id, { fullName: "Rohan Nair", passportNumber: "K1234567" });
    expect(isOk(first)).toBe(true);

    const duplicate = await getTravellerService().add(booking.value.id, { fullName: "Different Name", passportNumber: "K1234567" });
    expect(isErr(duplicate)).toBe(true);
    if (isErr(duplicate)) expect(duplicate.error.constructor.name).toBe("ConflictError");
  });

  it("rejects a second traveller with the same (fullName, dateOfBirth) pair", async () => {
    const quote = await setupApprovedQuote();
    const booking = await getBookingService().createFromQuote({ quoteId: quote.id });
    if (!isOk(booking)) throw new Error("setup failed");

    await getTravellerService().add(booking.value.id, { fullName: "Rohan Nair", dateOfBirth: "1990-05-01" });
    const duplicate = await getTravellerService().add(booking.value.id, { fullName: "Rohan Nair", dateOfBirth: "1990-05-01" });
    expect(isErr(duplicate)).toBe(true);
  });
});

describe("Payment-gated status transitions", () => {
  it("rejects recording a payment before the booking is CONFIRMED", async () => {
    const quote = await setupApprovedQuote();
    const booking = await getBookingService().createFromQuote({ quoteId: quote.id });
    if (!isOk(booking)) throw new Error("setup failed");

    const result = await getBookingService().recordPayment(booking.value.id, { amount: 10_000 });
    expect(isErr(result)).toBe(true);
    if (isErr(result)) expect(result.error.constructor.name).toBe("ConflictError");
  });

  it("a full payment after CONFIRMED bumps status straight to PAID and unlocks ticket()", async () => {
    const quote = await setupApprovedQuote();
    const booking = await getBookingService().createFromQuote({ quoteId: quote.id });
    if (!isOk(booking)) throw new Error("setup failed");

    await getBookingService().confirm(booking.value.id);
    await getBookingService().recordPayment(booking.value.id, { amount: 60_000, status: "PAID" });

    const afterPayment = await getBookingService().getById(booking.value.id);
    if (isOk(afterPayment)) {
      expect(afterPayment.value.status).toBe("PAID");
      expect(afterPayment.value.paymentStatus).toBe("PAID");
    }

    const ticketed = await getBookingService().ticket(booking.value.id);
    expect(isOk(ticketed)).toBe(true);
  });

  it("cancel() is rejected once the booking is COMPLETED", async () => {
    const quote = await setupApprovedQuote();
    const booking = await getBookingService().createFromQuote({ quoteId: quote.id });
    if (!isOk(booking)) throw new Error("setup failed");

    await getBookingService().confirm(booking.value.id);
    await getBookingService().recordPayment(booking.value.id, { amount: 60_000, status: "PAID" });
    await getBookingService().ticket(booking.value.id);
    await getBookingService().complete(booking.value.id);

    const cancelAttempt = await getBookingService().cancel(booking.value.id, { reason: "too late" });
    expect(isErr(cancelAttempt)).toBe(true);
  });
});
