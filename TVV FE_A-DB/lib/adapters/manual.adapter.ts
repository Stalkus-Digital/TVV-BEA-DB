/**
 * Manual package → unified Package.
 *
 * Most fields map 1:1; this adapter exists to keep the boundary symmetric with
 * the vendor adapter, and to guarantee that components ONLY ever see Package
 * (never the raw manual shape).
 */

import type { ManualPackage, Package } from "@/lib/models";
import { unifyThemes } from "./utils";

export function fromManual(input: ManualPackage): Package {
  return {
    slug: input.slug,
    vendor: { source: "manual" },
    title: input.title,
    subtitle: input.subtitle,
    description: input.description,
    destination: input.destination,
    region: input.region,
    durationDays: input.durationDays,
    durationNights: input.durationNights,
    rating: input.rating,
    ratingCount: input.ratingCount,
    pricing: {
      currency: input.currency ?? "INR",
      perAdult: input.priceCurrent,
      originalPerAdult: input.priceOriginal,
      pricingModel: "per-adult",
    },
    hero: {
      image: input.image,
      gallery: input.gallery?.map((url) => ({ url })),
    },
    destinations: input.destinations,
    badges: input.badges,
    themes: unifyThemes(input.themes),
    highlights: input.highlights,
    inclusions: input.inclusions,
    exclusions: input.exclusions,
    policy: input.cancellationPolicy ? { cancellation: input.cancellationPolicy } : undefined,
    audit: input.audit,
  };
}

export function fromManualList(inputs: ManualPackage[]): Package[] {
  return inputs.map(fromManual);
}
