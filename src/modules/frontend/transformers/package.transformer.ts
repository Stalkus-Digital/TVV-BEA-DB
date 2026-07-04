import type { WebsitePackageDetailDTO, WebsitePackageSummaryDTO } from "@/modules/website";
import type { LegacyPackageDTO } from "../dto/legacy-package.dto";

/**
 * Travel OS has no "region" concept (domestic/international/andaman) on
 * any Package or Destination DTO — no country code, no region field
 * anywhere to derive one from. `"domestic"` is a deliberate, documented
 * placeholder (see docs/30), not an inference — every package will report
 * as domestic until Travel OS models region explicitly. Frontend region
 * filtering (`byRegion()`) will therefore not discriminate correctly
 * against live data yet; this is a known, flagged limitation, not a bug
 * in this transformer.
 */
const PLACEHOLDER_REGION = "domestic" as const;

/** Travel OS packages are curated/admin-authored, not vendor-dynamic — "manual" is the closer of the two allowed frontend values. */
const VENDOR_REF = { source: "manual" as const, vendorName: "travel-os" };

function toPricing(currency: string | null, amount: number | null): LegacyPackageDTO["pricing"] {
  return {
    currency: currency ?? "INR",
    perAdult: amount ?? 0,
    pricingModel: "per-adult",
  };
}

/** `WebsitePackageSummaryDTO` → `LegacyPackageDTO` — used for list/related-package rows. */
export function toLegacyPackageFromSummary(dto: WebsitePackageSummaryDTO): LegacyPackageDTO {
  return {
    slug: dto.slug,
    vendor: VENDOR_REF,
    title: dto.title,
    destination: dto.destinationName,
    region: PLACEHOLDER_REGION,
    durationDays: dto.durationDays,
    durationNights: dto.durationNights,
    pricing: toPricing(dto.currency, dto.fromPrice),
    hero: { image: dto.heroImage ?? "" },
    destinations: [{ days: dto.durationDays, city: dto.destinationName }],
  };
}

/** `WebsitePackageDetailDTO` → `LegacyPackageDTO` — used for the single-package detail response. */
export function toLegacyPackageFromDetail(dto: WebsitePackageDetailDTO): LegacyPackageDTO {
  const base = toLegacyPackageFromSummary(dto);
  return {
    ...base,
    pricing: dto.pricing ? toPricing(dto.pricing.currency, dto.pricing.fromPrice ?? dto.pricing.basePrice) : base.pricing,
    hero: { image: dto.heroImage ?? "", gallery: dto.gallery.map((url) => ({ url })) },
    itinerary: dto.itinerary.map((day) => ({
      day: day.dayNumber,
      title: day.title,
      city: dto.destinationSummary?.name ?? dto.destinationName,
      description: day.description ?? "",
    })),
    seo: {
      title: dto.seo.title,
      description: dto.seo.description,
      canonical: dto.seo.canonicalUrl,
      ogImage: dto.seo.ogImage ?? undefined,
    },
  };
}
