/**
 * Reusable, valid request-body builders — shared across integration and e2e
 * tests so a validation-rule change (e.g. a new required field) only needs
 * updating here, not in every test file that creates a Country/Destination/
 * Package/Quote/Booking. Each accepts an `overrides` object so a test can
 * cheaply construct an otherwise-valid-but-one-field-different payload for
 * negative-path tests.
 */

let counter = 0;
/** Guarantees uniqueness across a whole test run for fields with uniqueness constraints (isoCode, slug, code, email). */
export function unique(prefix: string): string {
  counter += 1;
  return `${prefix}${Date.now().toString(36)}${counter}`;
}

export function countryPayload(overrides: Record<string, unknown> = {}) {
  return {
    name: `Test Country ${unique("c")}`,
    isoCode: unique("c").slice(0, 2).toUpperCase().padEnd(2, "X"),
    ...overrides,
  };
}

export function destinationPayload(countryId: string, overrides: Record<string, unknown> = {}) {
  return {
    name: `Test Destination ${unique("d")}`,
    countryId,
    ...overrides,
  };
}

export function hotelInventoryPayload(destinationId: string, overrides: Record<string, unknown> = {}) {
  return {
    kind: "HOTEL",
    title: `Test Hotel ${unique("h")}`,
    destinationId,
    details: { starRating: 4, address: "1 Test Road" },
    ...overrides,
  };
}

export function packagePayload(destinationId: string, overrides: Record<string, unknown> = {}) {
  return {
    title: `Test Package ${unique("p")}`,
    destinationId,
    durationDays: 4,
    durationNights: 3,
    ...overrides,
  };
}

export function quotePayload(destinationId: string, overrides: Record<string, unknown> = {}) {
  return {
    title: `Test Quote ${unique("q")}`,
    destinationId,
    travelerDetails: {
      leadTraveler: { name: "Test Traveler", email: `${unique("t")}@example.com` },
      adults: 2,
    },
    ...overrides,
  };
}

export function quoteItemPayload(overrides: Record<string, unknown> = {}) {
  return {
    title: `Test Line Item ${unique("li")}`,
    quantity: 1,
    unitPrice: 10_000,
    ...overrides,
  };
}

export function bookingPayload(quoteId: string, overrides: Record<string, unknown> = {}) {
  return { quoteId, ...overrides };
}

export function travellerPayload(overrides: Record<string, unknown> = {}) {
  return {
    type: "ADULT",
    fullName: `Test Traveller ${unique("tr")}`,
    ...overrides,
  };
}
