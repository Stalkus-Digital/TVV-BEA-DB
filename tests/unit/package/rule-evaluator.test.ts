import { describe, expect, it } from "vitest";
import { evaluateRule } from "@/modules/package/rules/rule-evaluator";
import type { PackageRule } from "@/modules/package/types/package-rule";

function buildRule(overrides: Partial<PackageRule> = {}): PackageRule {
  return {
    id: "rule-1",
    packageId: "package-1",
    cancellationTiers: [],
    paymentTerms: null,
    refundPolicy: null,
    minPax: 2,
    maxPax: 10,
    bookingWindow: null,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("evaluateRule — pax count", () => {
  it("is valid when paxCount is within [minPax, maxPax]", () => {
    const result = evaluateRule(buildRule(), { paxCount: 4, travelDate: "2026-12-01" });
    expect(result).toEqual({ valid: true, violations: [] });
  });

  it("flags a violation when paxCount is below minPax", () => {
    const result = evaluateRule(buildRule({ minPax: 2 }), { paxCount: 1, travelDate: "2026-12-01" });
    expect(result.valid).toBe(false);
    expect(result.violations[0]).toMatch(/below the minimum/);
  });

  it("flags a violation when paxCount exceeds maxPax", () => {
    const result = evaluateRule(buildRule({ maxPax: 10 }), { paxCount: 11, travelDate: "2026-12-01" });
    expect(result.valid).toBe(false);
    expect(result.violations[0]).toMatch(/exceeds the maximum/);
  });

  it("a null maxPax means unlimited — never flags an upper-bound violation", () => {
    const result = evaluateRule(buildRule({ maxPax: null }), { paxCount: 9999, travelDate: "2026-12-01" });
    expect(result.valid).toBe(true);
  });

  it("can report multiple violations at once", () => {
    const rule = buildRule({
      minPax: 5,
      bookingWindow: { minDaysBeforeDeparture: 30, maxDaysBeforeDeparture: null },
    });
    const result = evaluateRule(rule, { paxCount: 1, bookingDate: "2026-11-25", travelDate: "2026-12-01" });
    expect(result.violations).toHaveLength(2);
  });
});

describe("evaluateRule — booking window", () => {
  it("rejects a booking made after the minimum lead time", () => {
    const rule = buildRule({ bookingWindow: { minDaysBeforeDeparture: 30, maxDaysBeforeDeparture: null } });
    const result = evaluateRule(rule, { paxCount: 2, bookingDate: "2026-11-25", travelDate: "2026-12-01" }); // 6 days out
    expect(result.valid).toBe(false);
    expect(result.violations[0]).toMatch(/at least 30 day/);
  });

  it("accepts a booking made within the required lead time", () => {
    const rule = buildRule({ bookingWindow: { minDaysBeforeDeparture: 5, maxDaysBeforeDeparture: null } });
    const result = evaluateRule(rule, { paxCount: 2, bookingDate: "2026-11-01", travelDate: "2026-12-01" }); // 30 days out
    expect(result.valid).toBe(true);
  });

  it("rejects a booking made too far in advance when a maximum window is set", () => {
    const rule = buildRule({ bookingWindow: { minDaysBeforeDeparture: null, maxDaysBeforeDeparture: 60 } });
    const result = evaluateRule(rule, { paxCount: 2, bookingDate: "2026-01-01", travelDate: "2026-12-01" }); // far more than 60 days out
    expect(result.valid).toBe(false);
    expect(result.violations[0]).toMatch(/cannot be made more than 60 day/);
  });

  it("defaults bookingDate to now when omitted", () => {
    const rule = buildRule({ bookingWindow: { minDaysBeforeDeparture: 1, maxDaysBeforeDeparture: null } });
    const farFutureTravel = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();
    const result = evaluateRule(rule, { paxCount: 2, travelDate: farFutureTravel });
    expect(result.valid).toBe(true);
  });
});
