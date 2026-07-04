import type { PackageRule, RuleEvaluationRequest, RuleEvaluationResult } from "../types/package-rule";

function daysBetween(from: string, to: string): number {
  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.floor((new Date(to).getTime() - new Date(from).getTime()) / msPerDay);
}

/** Pure evaluation, no I/O — package-rule.service.ts is a thin repository wrapper around this. */
export function evaluateRule(rule: PackageRule, request: RuleEvaluationRequest): RuleEvaluationResult {
  const violations: string[] = [];

  if (request.paxCount < rule.minPax) {
    violations.push(`paxCount ${request.paxCount} is below the minimum of ${rule.minPax}`);
  }
  if (rule.maxPax !== null && request.paxCount > rule.maxPax) {
    violations.push(`paxCount ${request.paxCount} exceeds the maximum of ${rule.maxPax}`);
  }

  if (rule.bookingWindow) {
    const bookingDate = request.bookingDate ?? new Date().toISOString();
    const daysBeforeDeparture = daysBetween(bookingDate, request.travelDate);

    if (rule.bookingWindow.minDaysBeforeDeparture !== null && daysBeforeDeparture < rule.bookingWindow.minDaysBeforeDeparture) {
      violations.push(
        `Booking must be made at least ${rule.bookingWindow.minDaysBeforeDeparture} day(s) before departure (currently ${daysBeforeDeparture})`
      );
    }
    if (rule.bookingWindow.maxDaysBeforeDeparture !== null && daysBeforeDeparture > rule.bookingWindow.maxDaysBeforeDeparture) {
      violations.push(
        `Booking cannot be made more than ${rule.bookingWindow.maxDaysBeforeDeparture} day(s) before departure (currently ${daysBeforeDeparture})`
      );
    }
  }

  return { valid: violations.length === 0, violations };
}
