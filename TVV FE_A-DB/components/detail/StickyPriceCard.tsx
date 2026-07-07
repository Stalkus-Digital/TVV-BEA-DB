"use client";

import { PackagePriceCard } from "@/features/packages/components/PackagePriceCard";

interface Props {
  tourSlug: string;
  tourTitle: string;
  priceCurrent: number;
  priceOriginal?: number;
}

/** @deprecated Use `PackagePriceCard` from `@/features/packages`. */
export function StickyPriceCard({ tourSlug, tourTitle, priceCurrent, priceOriginal }: Props) {
  return (
    <PackagePriceCard
      packageSlug={tourSlug}
      packageTitle={tourTitle}
      pricing={{ currency: "INR", perAdult: priceCurrent, originalPerAdult: priceOriginal, pricingModel: "per-adult" }}
    />
  );
}
