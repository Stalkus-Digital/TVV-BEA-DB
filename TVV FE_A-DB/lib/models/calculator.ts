/**
 * Travel calculator models.
 *
 * The calculator is a lead-gen tool — it produces an indicative quote that
 * routes the traveller into the enquiry flow. The actual costing comes from
 * the backend (or a specialist) when a real proposal is built.
 */

import type { Region } from "./common";

export type TravelStyle = "essential" | "elevated" | "luxury" | "ultra-luxury";

export interface CalculatorInput {
  destination: string;
  region: Region;
  durationDays: number;
  adults: number;
  children: number;
  travelStyle: TravelStyle;
  includeFlights: boolean;
  themes?: string[];
}

export interface CalculatorBreakdown {
  accommodation: number;
  experiences: number;
  transport: number;
  flights?: number;
  taxes: number;
  specialistFee: number;
}

export interface CalculatorEstimate {
  perPerson: number;
  total: number;
  currency: "INR";
  rangeLow: number;
  rangeHigh: number;
  breakdown: CalculatorBreakdown;
  disclaimer: string;
}
