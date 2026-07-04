import { describe, expect, it } from "vitest";
import { isErr, isOk } from "@/shared/types";
import { validateCreateInventoryItem, validateUpdateInventoryItem } from "@/modules/inventory/validation/inventory-item.validation";

const validHotelDetails = { starRating: 4, address: "1 Beach Road" };

describe("validateCreateInventoryItem", () => {
  it("accepts a valid HOTEL payload and dispatches to the hotel detail validator", () => {
    const result = validateCreateInventoryItem({ kind: "HOTEL", title: "Test Hotel", details: validHotelDetails });
    expect(isOk(result)).toBe(true);
    if (isOk(result)) {
      expect(result.value.kind).toBe("HOTEL");
      expect(result.value.details).toMatchObject(validHotelDetails);
    }
  });

  it("rejects an unknown kind", () => {
    const result = validateCreateInventoryItem({ kind: "SPACESHIP", title: "x", details: {} });
    expect(isErr(result)).toBe(true);
    if (isErr(result)) expect(result.error.message).toMatch(/kind must be one of/);
  });

  it("rejects a missing/blank title", () => {
    const result = validateCreateInventoryItem({ kind: "HOTEL", title: "  ", details: validHotelDetails });
    expect(isErr(result)).toBe(true);
  });

  it("rejects a non-string destinationId", () => {
    const result = validateCreateInventoryItem({ kind: "HOTEL", title: "x", destinationId: 123, details: validHotelDetails });
    expect(isErr(result)).toBe(true);
  });

  it("defaults destinationId to null when omitted", () => {
    const result = validateCreateInventoryItem({ kind: "HOTEL", title: "x", details: validHotelDetails });
    expect(isOk(result)).toBe(true);
    if (isOk(result)) expect(result.value.destinationId).toBeNull();
  });

  it("propagates a kind-specific detail validation failure (hotel requires address)", () => {
    const result = validateCreateInventoryItem({ kind: "HOTEL", title: "x", details: { starRating: 4 } });
    expect(isErr(result)).toBe(true);
    if (isErr(result)) expect(result.error.message).toMatch(/address/);
  });

  it("rejects a non-object body", () => {
    expect(isErr(validateCreateInventoryItem(null))).toBe(true);
    expect(isErr(validateCreateInventoryItem("string"))).toBe(true);
  });
});

describe("validateUpdateInventoryItem", () => {
  it("allows a partial update with only title", () => {
    const result = validateUpdateInventoryItem({ title: "New Name" }, "HOTEL");
    expect(isOk(result)).toBe(true);
    if (isOk(result)) expect(result.value).toEqual({ title: "New Name" });
  });

  it("re-dispatches details through the existing kind's validator, not a kind passed in the body", () => {
    const result = validateUpdateInventoryItem({ details: { starRating: 5, address: "New Address" } }, "HOTEL");
    expect(isOk(result)).toBe(true);
  });

  it("rejects an empty-string title on update", () => {
    const result = validateUpdateInventoryItem({ title: "" }, "HOTEL");
    expect(isErr(result)).toBe(true);
  });

  it("allows destinationId to be explicitly set to null", () => {
    const result = validateUpdateInventoryItem({ destinationId: null }, "HOTEL");
    expect(isOk(result)).toBe(true);
    if (isOk(result)) expect(result.value.destinationId).toBeNull();
  });
});
