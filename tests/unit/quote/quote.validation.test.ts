import { describe, expect, it } from "vitest";
import { isErr, isOk } from "@/shared/types";
import { validateAdjustments, validateCreateQuote, validateRejectQuote, validateTravelerDetails, validateUpdateQuote } from "@/modules/quote/validation/quote.validation";

const validTravelerDetails = { leadTraveler: { name: "Asha Rao", email: "asha@example.com" }, adults: 2 };

describe("validateTravelerDetails", () => {
  it("accepts a valid lead traveler + adults, defaulting children/infants to 0", () => {
    const result = validateTravelerDetails(validTravelerDetails);
    expect(isOk(result)).toBe(true);
    if (isOk(result)) expect(result.value).toEqual({ leadTraveler: { name: "Asha Rao", email: "asha@example.com", phone: null }, adults: 2, children: 0, infants: 0 });
  });

  it("rejects a missing leadTraveler.email", () => {
    const result = validateTravelerDetails({ leadTraveler: { name: "Asha" }, adults: 1 });
    expect(isErr(result)).toBe(true);
  });

  it("rejects a non-positive adults count", () => {
    const result = validateTravelerDetails({ ...validTravelerDetails, adults: 0 });
    expect(isErr(result)).toBe(true);
  });

  it("rejects a negative children count", () => {
    const result = validateTravelerDetails({ ...validTravelerDetails, children: -1 });
    expect(isErr(result)).toBe(true);
  });
});

describe("validateAdjustments", () => {
  it("defaults to an empty array when omitted", () => {
    const result = validateAdjustments(undefined);
    expect(isOk(result)).toBe(true);
    if (isOk(result)) expect(result.value).toEqual([]);
  });

  it("assigns a generated id to each adjustment", () => {
    const result = validateAdjustments([{ kind: "MARKUP", type: "PERCENTAGE", label: "Fee", value: 5 }]);
    expect(isOk(result)).toBe(true);
    if (isOk(result)) expect(result.value[0].id).toBeTruthy();
  });

  it("rejects an invalid kind", () => {
    const result = validateAdjustments([{ kind: "TAX", type: "FLAT", label: "x", value: 1 }]);
    expect(isErr(result)).toBe(true);
  });

  it("rejects a negative value", () => {
    const result = validateAdjustments([{ kind: "MARKUP", type: "FLAT", label: "x", value: -1 }]);
    expect(isErr(result)).toBe(true);
  });

  it("rejects a non-array input", () => {
    expect(isErr(validateAdjustments({ kind: "MARKUP" }))).toBe(true);
  });
});

describe("validateCreateQuote", () => {
  it("defaults currency to INR when omitted", () => {
    const result = validateCreateQuote({ title: "Q", destinationId: "d1", travelerDetails: validTravelerDetails });
    expect(isOk(result)).toBe(true);
    if (isOk(result)) expect(result.value.currency).toBe("INR");
  });

  it("uppercases and validates a 3-letter currency code", () => {
    const result = validateCreateQuote({ title: "Q", destinationId: "d1", travelerDetails: validTravelerDetails, currency: "usd" });
    expect(isOk(result)).toBe(true);
    if (isOk(result)) expect(result.value.currency).toBe("USD");
  });

  it("rejects a currency code that isn't 3 letters", () => {
    const result = validateCreateQuote({ title: "Q", destinationId: "d1", travelerDetails: validTravelerDetails, currency: "US" });
    expect(isErr(result)).toBe(true);
  });

  it("rejects a missing destinationId", () => {
    const result = validateCreateQuote({ title: "Q", travelerDetails: validTravelerDetails });
    expect(isErr(result)).toBe(true);
  });

  it("rejects an invalid validFrom date string", () => {
    const result = validateCreateQuote({ title: "Q", destinationId: "d1", travelerDetails: validTravelerDetails, validFrom: "not-a-date" });
    expect(isErr(result)).toBe(true);
  });

  it("packageId defaults to null when omitted", () => {
    const result = validateCreateQuote({ title: "Q", destinationId: "d1", travelerDetails: validTravelerDetails });
    expect(isOk(result)).toBe(true);
    if (isOk(result)) expect(result.value.packageId).toBeNull();
  });
});

describe("validateUpdateQuote", () => {
  it("returns an empty object for an empty input — nothing required on update", () => {
    const result = validateUpdateQuote({});
    expect(isOk(result)).toBe(true);
    if (isOk(result)) expect(result.value).toEqual({});
  });

  it("only includes fields that were actually present in the input", () => {
    const result = validateUpdateQuote({ title: "New Title" });
    expect(isOk(result)).toBe(true);
    if (isOk(result)) expect(Object.keys(result.value)).toEqual(["title"]);
  });
});

describe("validateRejectQuote", () => {
  it("requires a non-empty reason", () => {
    expect(isErr(validateRejectQuote({}))).toBe(true);
    expect(isErr(validateRejectQuote({ reason: "" }))).toBe(true);
    expect(isOk(validateRejectQuote({ reason: "Client declined" }))).toBe(true);
  });
});
