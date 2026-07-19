export type SitePageKind = "content" | "catalog";

export interface SitePageRegistryEntry {
  id: string;
  label: string;
  kind: SitePageKind;
  /** Public website path */
  publicPath: string;
  /** CmsPage.slug — only for content pages */
  slug?: string;
  /** Admin deep-link — only for catalog pages */
  manageHref?: string;
  description: string;
}

/**
 * Fixed site-page registry for /cms/pages.
 * Content pages map to CmsPage rows; catalog rows deep-link to existing admin modules.
 */
export const SITE_PAGES_REGISTRY: SitePageRegistryEntry[] = [
  {
    id: "plan-my-journey",
    label: "Plan my journey",
    kind: "content",
    publicPath: "/contact",
    slug: "contact",
    description: "Contact / enquiry page (shared with Contact)",
  },
  {
    id: "contact",
    label: "Contact",
    kind: "content",
    publicPath: "/contact",
    slug: "contact",
    description: "Plan my journey / contact page content",
  },
  {
    id: "faq",
    label: "FAQs",
    kind: "content",
    publicPath: "/faq",
    slug: "faq",
    description: "FAQ page intro and SEO chrome",
  },
  {
    id: "visa-entry-notes",
    label: "Visa & entry notes",
    kind: "content",
    publicPath: "/visa",
    slug: "visa-entry-notes",
    description: "Visa and entry requirements notes",
  },
  {
    id: "privacy",
    label: "Privacy",
    kind: "content",
    publicPath: "/privacy",
    slug: "privacy",
    description: "Privacy policy",
  },
  {
    id: "terms",
    label: "Terms",
    kind: "content",
    publicPath: "/terms",
    slug: "terms",
    description: "Terms of service",
  },
  {
    id: "andaman-story",
    label: "The Andaman story",
    kind: "content",
    publicPath: "/andaman-story",
    slug: "andaman-story",
    description: "Andaman brand story page",
  },
  {
    id: "corporate",
    label: "Corporate & MICE",
    kind: "content",
    publicPath: "/corporate",
    slug: "corporate",
    description: "Corporate and MICE travel page",
  },
  {
    id: "careers",
    label: "Careers",
    kind: "content",
    publicPath: "/careers",
    slug: "careers",
    description: "Careers and openings",
  },
  {
    id: "press-media",
    label: "Press & media",
    kind: "content",
    publicPath: "/press",
    slug: "press-media",
    description: "Press and media kit",
  },
  {
    id: "travel-guides",
    label: "Travel guides",
    kind: "catalog",
    publicPath: "/guides",
    manageHref: "/cms/guides",
    description: "Editorial guides — manage in Guides (Blogs)",
  },
  {
    id: "holiday-packages",
    label: "Holiday Packages",
    kind: "catalog",
    publicPath: "/packages",
    manageHref: "/packages",
    description: "Package catalog — manage in Holiday Packages",
  },
  {
    id: "destinations",
    label: "Destinations",
    kind: "catalog",
    publicPath: "/destinations",
    manageHref: "/destinations",
    description: "Destination tree — manage in Destinations",
  },
  {
    id: "ferry-booking",
    label: "Ferry booking",
    kind: "catalog",
    publicPath: "/ferry",
    manageHref: "/itinerary/ferry-rates",
    description: "Ferry rates and routes — manage in Ferry Rate Charges",
  },
];

export function contentRegistryEntries(): SitePageRegistryEntry[] {
  return SITE_PAGES_REGISTRY.filter((e) => e.kind === "content" && e.slug);
}

/** Unique CmsPage slugs that must exist for content pages */
export function uniqueContentSlugs(): string[] {
  const seen = new Set<string>();
  const slugs: string[] = [];
  for (const entry of contentRegistryEntries()) {
    if (!entry.slug || seen.has(entry.slug)) continue;
    seen.add(entry.slug);
    slugs.push(entry.slug);
  }
  return slugs;
}
