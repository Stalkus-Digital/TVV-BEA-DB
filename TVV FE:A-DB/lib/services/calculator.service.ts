/**
 * Travel calculator — produces an *indicative* quote.
 *
 * The actual costing is built by a specialist. This service exists to feed
 * the on-site calculator widget and to route results into the enquiry flow.
 *
 * Pure function in mock mode; when backed by a real endpoint it can apply
 * destination-specific market data, seasonality, and dynamic-pricing inputs.
 */

import { apiConfig, ok, type ServiceResult } from "@/lib/api";
import type { CalculatorEstimate, CalculatorInput, Region } from "@/lib/models";

// Indicative per-night per-person baseline by style. (INR.)
const styleNightly = {
  essential: 5800,
  elevated: 11500,
  luxury: 22000,
  "ultra-luxury": 42000,
} as const;

// Regional multipliers.
const regionMultiplier: Record<Region, number> = {
  andaman: 1.0,
  domestic: 0.92,
  international: 1.6,
};

export const calculatorService = {
  async estimate(input: CalculatorInput): Promise<ServiceResult<CalculatorEstimate>> {
    // No Travel OS calculator endpoint — always computed client-side.
    return ok(this._compute(input), apiConfig.useMock ? "mock" : "live");
  },

  /** Exposed for direct/synchronous UI feedback (e.g. live preview). */
  _compute(input: CalculatorInput): CalculatorEstimate {
    const nights = Math.max(1, input.durationDays - 1);
    const heads = input.adults + Math.round(input.children * 0.6);
    const nightly = styleNightly[input.travelStyle];
    const regionMul = regionMultiplier[input.region];
    const themeMul = (input.themes ?? []).includes("honeymoon") ? 1.15 : 1.0;

    const accommodation = Math.round(nightly * nights * heads * regionMul * themeMul);
    const experiences = Math.round(accommodation * 0.22);
    const transport = Math.round(accommodation * 0.12);
    const flights = input.includeFlights
      ? Math.round((input.region === "international" ? 48000 : 12000) * (input.adults + input.children))
      : undefined;
    const subtotal = accommodation + experiences + transport + (flights ?? 0);
    const taxes = Math.round(subtotal * 0.05);
    const specialistFee = Math.round(subtotal * 0.04);
    const total = subtotal + taxes + specialistFee;
    const perPerson = Math.round(total / (input.adults + Math.max(1, input.children)));

    return {
      perPerson,
      total,
      currency: "INR",
      rangeLow: Math.round(total * 0.9),
      rangeHigh: Math.round(total * 1.18),
      breakdown: { accommodation, experiences, transport, flights, taxes, specialistFee },
      disclaimer:
        "Indicative range only — the actual proposal is built by a specialist using current rates and seasonality.",
    };
  },
};

export type CalculatorService = typeof calculatorService;
