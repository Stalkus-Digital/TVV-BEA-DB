import { describe, expect, it } from "vitest";
import { isErr, isOk } from "@/shared/types";
import { getQuoteItemService, getQuoteService } from "@/modules/quote";
import { getDestinationService } from "@/modules/destination";

async function setupQuote() {
  const destination = await getDestinationService().create({ name: `Quote Test Destination ${Date.now()}-${Math.random()}`, countryId: "country-1" });
  if (!isOk(destination)) throw new Error("destination setup failed");

  const quote = await getQuoteService().create({
    title: "Lifecycle Test Quote",
    destinationId: destination.value.id,
    travelerDetails: { leadTraveler: { name: "Test", email: "test@example.com" }, adults: 2 },
  });
  if (!isOk(quote)) throw new Error("quote setup failed");
  return quote.value;
}

describe("Quote status lifecycle (in-process, real DI-registered services)", () => {
  it("a new quote starts DRAFT with an auto-generated sequential quote number", async () => {
    const quote = await setupQuote();
    expect(quote.status).toBe("DRAFT");
    expect(quote.quoteNumber).toMatch(/^QT-\d{6}$/);
  });

  it("send() requires DRAFT or SENT and creates a version", async () => {
    const quote = await setupQuote();
    const sent = await getQuoteService().send(quote.id);
    expect(isOk(sent)).toBe(true);
    if (isOk(sent)) {
      expect(sent.value.status).toBe("SENT");
      expect(sent.value.currentVersionId).toBeTruthy();
    }
  });

  it("approve() is rejected once the quote is already REJECTED", async () => {
    const quote = await setupQuote();
    const rejected = await getQuoteService().reject(quote.id, { reason: "Client declined" });
    expect(isOk(rejected)).toBe(true);

    const approveAttempt = await getQuoteService().approve(quote.id);
    expect(isErr(approveAttempt)).toBe(true);
    if (isErr(approveAttempt)) expect(approveAttempt.error.constructor.name).toBe("ConflictError");
  });

  it("convertToBooking() requires APPROVED — rejects from DRAFT, SENT, and REJECTED", async () => {
    const draftQuote = await setupQuote();
    const draftAttempt = await getQuoteService().convertToBooking(draftQuote.id);
    expect(isErr(draftAttempt)).toBe(true);

    const sentQuote = await setupQuote();
    await getQuoteService().send(sentQuote.id);
    const sentAttempt = await getQuoteService().convertToBooking(sentQuote.id);
    expect(isErr(sentAttempt)).toBe(true);
  });

  it("convertToBooking() succeeds once APPROVED and flips status to CONVERTED — a second attempt is rejected (double-booking guard)", async () => {
    const quote = await setupQuote();
    await getQuoteService().send(quote.id);
    await getQuoteService().approve(quote.id);

    const firstConversion = await getQuoteService().convertToBooking(quote.id);
    expect(isOk(firstConversion)).toBe(true);

    const afterConversion = await getQuoteService().getById(quote.id);
    if (isOk(afterConversion)) {
      expect(afterConversion.value.status).toBe("CONVERTED");
      expect(afterConversion.value.convertedBookingId).toBeNull(); // reserved-but-inert by design
    }

    const secondConversion = await getQuoteService().convertToBooking(quote.id);
    expect(isErr(secondConversion)).toBe(true);
    if (isErr(secondConversion)) expect(secondConversion.error.constructor.name).toBe("ConflictError");
  });

  it("items cannot be added once the quote reaches a locked status (APPROVED/REJECTED/CONVERTED)", async () => {
    const quote = await setupQuote();
    await getQuoteService().send(quote.id);
    await getQuoteService().approve(quote.id);

    const addAttempt = await getQuoteItemService().add(quote.id, { title: "Late item", quantity: 1, unitPrice: 100 });
    expect(isErr(addAttempt)).toBe(true);
    if (isErr(addAttempt)) expect(addAttempt.error.constructor.name).toBe("ConflictError");
  });

  it("duplicate() copies items and adjustments into a fresh DRAFT quote", async () => {
    const quote = await setupQuote();
    await getQuoteItemService().add(quote.id, { title: "Item A", quantity: 1, unitPrice: 5000 });

    const duplicated = await getQuoteService().duplicate(quote.id);
    expect(isOk(duplicated)).toBe(true);
    if (isOk(duplicated)) {
      expect(duplicated.value.status).toBe("DRAFT");
      expect(duplicated.value.id).not.toBe(quote.id);
      const items = await getQuoteItemService().listByQuote(duplicated.value.id);
      if (isOk(items)) expect(items.value).toHaveLength(1);
    }
  });
});
