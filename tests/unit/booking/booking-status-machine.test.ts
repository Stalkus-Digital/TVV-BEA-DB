import { describe, expect, it } from "vitest";
import { BOOKING_STATUS_TRANSITIONS, canTransition, isTerminal } from "@/modules/booking/status/booking-status-machine";
import { BookingStatus } from "@/modules/booking/types/booking-status";

describe("canTransition", () => {
  it("allows the full happy path: DRAFT → CONFIRMED → PARTIALLY_PAID → PAID → TICKETED → COMPLETED", () => {
    expect(canTransition(BookingStatus.DRAFT, BookingStatus.CONFIRMED)).toBe(true);
    expect(canTransition(BookingStatus.CONFIRMED, BookingStatus.PARTIALLY_PAID)).toBe(true);
    expect(canTransition(BookingStatus.PARTIALLY_PAID, BookingStatus.PAID)).toBe(true);
    expect(canTransition(BookingStatus.PAID, BookingStatus.TICKETED)).toBe(true);
    expect(canTransition(BookingStatus.TICKETED, BookingStatus.COMPLETED)).toBe(true);
  });

  it("allows CONFIRMED to jump straight to PAID (skipping PARTIALLY_PAID for a single full payment)", () => {
    expect(canTransition(BookingStatus.CONFIRMED, BookingStatus.PAID)).toBe(true);
  });

  it.each([BookingStatus.DRAFT, BookingStatus.CONFIRMED, BookingStatus.PARTIALLY_PAID, BookingStatus.PAID, BookingStatus.TICKETED] as const)(
    "CANCELLED is reachable from every non-terminal status (%s)",
    (from) => {
      expect(canTransition(from, BookingStatus.CANCELLED)).toBe(true);
    }
  );

  it.each([BookingStatus.COMPLETED, BookingStatus.CANCELLED] as const)("no transition is allowed out of a terminal status (%s)", (from) => {
    for (const to of Object.values(BookingStatus)) {
      expect(canTransition(from, to)).toBe(false);
    }
  });

  it("does not allow skipping backward (e.g. PAID → CONFIRMED)", () => {
    expect(canTransition(BookingStatus.PAID, BookingStatus.CONFIRMED)).toBe(false);
    expect(canTransition(BookingStatus.TICKETED, BookingStatus.DRAFT)).toBe(false);
  });

  it("does not allow skipping forward past an adjacent step that was never reached (DRAFT → TICKETED)", () => {
    expect(canTransition(BookingStatus.DRAFT, BookingStatus.TICKETED)).toBe(false);
  });
});

describe("isTerminal", () => {
  it("COMPLETED and CANCELLED are terminal; every other status is not", () => {
    expect(isTerminal(BookingStatus.COMPLETED)).toBe(true);
    expect(isTerminal(BookingStatus.CANCELLED)).toBe(true);
    expect(isTerminal(BookingStatus.DRAFT)).toBe(false);
    expect(isTerminal(BookingStatus.PAID)).toBe(false);
  });
});

describe("BOOKING_STATUS_TRANSITIONS — structural completeness", () => {
  it("every BookingStatus value has an entry in the transition table", () => {
    for (const status of Object.values(BookingStatus)) {
      expect(BOOKING_STATUS_TRANSITIONS).toHaveProperty(status);
    }
  });
});
