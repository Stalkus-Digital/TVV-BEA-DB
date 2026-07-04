export const AdjustmentType = {
  PERCENTAGE: "PERCENTAGE",
  FLAT: "FLAT",
} as const;

export type AdjustmentType = (typeof AdjustmentType)[keyof typeof AdjustmentType];

export interface PriceAdjustment {
  type: AdjustmentType;
  value: number;
}

export const OccupancyType = {
  SINGLE: "SINGLE",
  DOUBLE: "DOUBLE",
  TRIPLE: "TRIPLE",
  QUAD: "QUAD",
} as const;

export type OccupancyType = (typeof OccupancyType)[keyof typeof OccupancyType];

export interface OccupancyPriceRule {
  occupancyType: OccupancyType;
  pricePerPerson: number;
}

export const ChildPriceType = {
  FLAT: "FLAT",
  PERCENTAGE_OF_ADULT: "PERCENTAGE_OF_ADULT",
} as const;

export type ChildPriceType = (typeof ChildPriceType)[keyof typeof ChildPriceType];

export interface ChildPriceRule {
  minAge: number;
  maxAge: number;
  priceType: ChildPriceType;
  value: number;
}

export interface InfantPriceRule {
  maxAge: number;
  price: number;
}

export interface GroupPriceRule {
  minPax: number;
  maxPax: number | null;
  pricePerPerson: number;
}

export interface SeasonalPriceRule {
  id: string;
  seasonName: string;
  startDate: string;
  endDate: string;
  adjustment: PriceAdjustment;
}

/**
 * One PackagePricing record per Package (1:1). Every rule type the sprint
 * asked for is here; the actual computation logic lives in
 * pricing/pricing-calculator.ts, kept separate from this plain data shape.
 */
export interface PackagePricing {
  id: string;
  packageId: string;
  basePrice: number;
  currency: string;
  markup: PriceAdjustment | null;
  discount: (PriceAdjustment & { validFrom?: string; validTo?: string }) | null;
  tax: (PriceAdjustment & { label?: string }) | null;
  occupancyPricing: OccupancyPriceRule[];
  childPricing: ChildPriceRule[];
  infantPricing: InfantPriceRule | null;
  groupPricing: GroupPriceRule[];
  seasonalPricing: SeasonalPriceRule[];
  createdAt: string;
  updatedAt: string;
}

export interface PriceComputeRequest {
  date?: string;
  occupancy?: OccupancyType;
  adults: number;
  children?: { age: number }[];
  infants?: number;
  paxCount?: number;
}

export interface PriceComputeLineItem {
  label: string;
  amount: number;
}

export interface PriceComputeResult {
  currency: string;
  basePrice: number;
  lineItems: PriceComputeLineItem[];
  total: number;
}
