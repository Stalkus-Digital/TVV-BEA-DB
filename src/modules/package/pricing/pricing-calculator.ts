import { AdjustmentType, type PackagePricing, type PriceAdjustment, type PriceComputeLineItem, type PriceComputeRequest } from "../types/package-pricing";

function applyAdjustment(amount: number, adjustment: PriceAdjustment): number {
  return adjustment.type === AdjustmentType.PERCENTAGE ? (amount * adjustment.value) / 100 : adjustment.value;
}

function resolveSeasonalAdjustment(pricing: PackagePricing, date: string | undefined): PriceAdjustment | null {
  if (!date) return null;
  const target = new Date(date).getTime();
  const arr = Array.isArray(pricing.seasonalPricing) ? pricing.seasonalPricing : [];
  const season = arr.find((s: any) => {
    const start = new Date(s.startDate).getTime();
    const end = new Date(s.endDate).getTime();
    return target >= start && target <= end;
  });
  return season?.adjustment ?? null;
}

function resolveChildTotal(pricing: PackagePricing, adultUnitPrice: number, children: { age: number }[]): number {
  const arr = Array.isArray(pricing.childPricing) ? pricing.childPricing : [];
  return children.reduce((sum, child) => {
    const rule = arr.find((r: any) => child.age >= r.minAge && child.age <= r.maxAge);
    if (!rule) return sum + adultUnitPrice; // no matching band — priced as an adult, not silently free
    const childPrice = rule.priceType === "PERCENTAGE_OF_ADULT" ? (adultUnitPrice * rule.value) / 100 : rule.value;
    return sum + childPrice;
  }, 0);
}

function resolveGroupUnitPrice(pricing: PackagePricing, paxCount: number, fallback: number): number {
  const arr = Array.isArray(pricing.groupPricing) ? pricing.groupPricing : [];
  const rule = arr.find((r: any) => paxCount >= r.minPax && (r.maxPax === null || paxCount <= r.maxPax));
  return rule?.pricePerPerson ?? fallback;
}

/**
 * Pure calculation, no I/O — this is the only place price math happens, so
 * package-pricing.service.ts stays a thin orchestrator over repositories +
 * this file. Order: base (per-occupancy or group-adjusted) → seasonal →
 * markup → discount → child/infant additions → tax last.
 */
export function computePrice(pricing: PackagePricing, request: PriceComputeRequest): PriceComputeLineItem[] {
  const lineItems: PriceComputeLineItem[] = [];
  const paxCount = request.paxCount ?? request.adults;

  // adultUnitPrice is an internal figure used to compute the lines below
  // (and shown separately via basePrice/currency on the result) — it must
  // NOT also be pushed into lineItems, since every entry in that array gets
  // summed into `total` and "Adults × N" below already incorporates it;
  // pushing both double-counted the base price.
  const occupancyPricing = Array.isArray(pricing.occupancyPricing) ? pricing.occupancyPricing : [];
  let adultUnitPrice =
    occupancyPricing.find((o: any) => o.occupancyType === request.occupancy)?.pricePerPerson ?? pricing.basePrice;
  adultUnitPrice = resolveGroupUnitPrice(pricing, paxCount, adultUnitPrice);

  const seasonal = resolveSeasonalAdjustment(pricing, request.date);
  if (seasonal) {
    const seasonalAmount = applyAdjustment(adultUnitPrice, seasonal);
    lineItems.push({ label: "Seasonal adjustment", amount: seasonalAmount });
    adultUnitPrice += seasonalAmount;
  }

  let adultsTotal = adultUnitPrice * request.adults;
  lineItems.push({ label: `Adults × ${request.adults}`, amount: adultsTotal });

  if (pricing.markup) {
    const markupAmount = applyAdjustment(adultsTotal, pricing.markup);
    lineItems.push({ label: "Markup", amount: markupAmount });
    adultsTotal += markupAmount;
  }

  if (pricing.discount) {
    const discountAmount = -applyAdjustment(adultsTotal, pricing.discount);
    lineItems.push({ label: "Discount", amount: discountAmount });
    adultsTotal += discountAmount;
  }

  let subtotal = adultsTotal;

  if (request.children && request.children.length > 0) {
    const childrenTotal = resolveChildTotal(pricing, adultUnitPrice, request.children);
    lineItems.push({ label: `Children × ${request.children.length}`, amount: childrenTotal });
    subtotal += childrenTotal;
  }

  if (request.infants && pricing.infantPricing) {
    const infantsTotal = pricing.infantPricing.price * request.infants;
    lineItems.push({ label: `Infants × ${request.infants}`, amount: infantsTotal });
    subtotal += infantsTotal;
  }

  if (pricing.tax) {
    const taxAmount = applyAdjustment(subtotal, pricing.tax);
    lineItems.push({ label: pricing.tax.label ?? "Tax", amount: taxAmount });
    subtotal += taxAmount;
  }

  return lineItems;
}
