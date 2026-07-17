export const MARKET_ROOT_SLUGS = ["andaman", "domestic", "international"] as const;

export type MarketRootSlug = (typeof MARKET_ROOT_SLUGS)[number];

export const MARKET_ROOT_DEFINITIONS: ReadonlyArray<{ slug: MarketRootSlug; name: string; description: string }> = [
  { slug: "andaman", name: "Andaman", description: "Andaman Islands destinations" },
  { slug: "domestic", name: "Domestic", description: "India destinations outside Andaman" },
  { slug: "international", name: "International", description: "Overseas destinations" },
];

export function isMarketRootSlug(slug: string): slug is MarketRootSlug {
  return (MARKET_ROOT_SLUGS as readonly string[]).includes(slug);
}
