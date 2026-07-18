import type { HomeSection } from "./types";

export const HOME_SECTION_TYPES = [
  "hero",
  "trustBar",
  "andamanSpotlight",
  "destinationTabs",
  "experiences",
  "featuredJourneys",
  "editorialGuides",
  "reels",
  "testimonials",
  "conciergeCta",
] as const;

export type HomeSectionType = (typeof HOME_SECTION_TYPES)[number];

export interface SectionTypeMeta {
  type: HomeSectionType;
  label: string;
  description: string;
  defaultData: Record<string, unknown>;
}

export const SECTION_TYPE_META: Record<HomeSectionType, SectionTypeMeta> = {
  hero: {
    type: "hero",
    label: "Hero",
    description: "Collage hero with headline, trending chips, and images",
    defaultData: {
      eyebrow: "Curated by Andaman & island experts",
      headline: "Find your next great escape",
      subheadline:
        "Handpicked stays, experiences and island journeys — planned precisely, priced honestly, and backed by a concierge who answers every mile of the way.",
      searchPlaceholder: "Search Andaman, Kerala, Japan, Maldives…",
      trending: [
        { label: "Andaman Islands", href: "/andaman" },
        { label: "Honeymoon", href: "/honeymoon" },
        { label: "Scuba Diving", href: "/experiences" },
        { label: "Ferry Booking", href: "/ferry" },
        { label: "Maldives", href: "/destinations" },
      ],
      stats: [
        { value: "65+", label: "Destinations" },
        { value: "12,400+", label: "Journeys crafted" },
        { value: "4.9", label: "Avg. rating" },
      ],
      images: [
        "https://images.unsplash.com/photo-1559128010-7c1ad6e1b6a5?auto=format&fit=crop&w=1200&q=85",
        "https://images.unsplash.com/photo-1540202404-1b927e27fa8b?auto=format&fit=crop&w=1000&q=85",
        "https://images.unsplash.com/photo-1583212292454-1fe6229603b7?auto=format&fit=crop&w=1000&q=85",
      ],
      ratingBadge: { value: "4.9 / 5", label: "3,200+ verified reviews" },
      locationBadge: { title: "Havelock Island", subtitle: "from ₹18,999" },
    },
  },
  trustBar: {
    type: "trustBar",
    label: "Trust bar",
    description: "Trust stats strip (optional override of live stats)",
    defaultData: {},
  },
  andamanSpotlight: {
    type: "andamanSpotlight",
    label: "Andaman spotlight",
    description: "Signature Andaman tiles and CTA strip",
    defaultData: {
      eyebrow: "Our signature — Andaman Islands",
      title: "Two decades on the islands. It shows in the details.",
      description:
        "The Andamans is not a destination we resell — it is where we run ground operations, train guides, and pour the foundation of every TVV journey. Begin here.",
      viewAllHref: "/andaman",
      viewAllLabel: "Open the Andaman Hub",
      stripEyebrow: "Andaman, designed around you",
      stripTitle: "Tell us how you travel — we'll send a private Andaman proposal within four hours.",
      primaryCtaLabel: "Plan my Andaman",
      primaryCtaHref: "/contact?destination=andaman",
      secondaryCtaLabel: "Book a ferry",
      secondaryCtaHref: "/ferry",
    },
  },
  destinationTabs: {
    type: "destinationTabs",
    label: "Destination tabs",
    description: "Regional destination shelf with header copy",
    defaultData: {
      eyebrow: "Curated Global Destinations",
      title: "A globe, edited.",
      description:
        "Sixty-five destinations, each one walked by a specialist. Choose a region — we'll show you the journeys we actually recommend.",
    },
  },
  experiences: {
    type: "experiences",
    label: "Experiences",
    description: "Travel-by-experience shelf",
    defaultData: {
      eyebrow: "Travel by experience",
      title: "The way you travel, not the place you go.",
      description: "Pick a thread — honeymoon, adventure, slow wellness, food — and we'll route a journey around it.",
      limit: 8,
    },
  },
  featuredJourneys: {
    type: "featuredJourneys",
    label: "Featured journeys",
    description: "Package shelf with header copy",
    defaultData: {
      eyebrow: "Featured journeys",
      title: "Itineraries our specialists actually recommend.",
      description:
        "A live shelf, refreshed weekly. Every itinerary is a starting point — yours will be redrawn around how you travel.",
    },
  },
  editorialGuides: {
    type: "editorialGuides",
    label: "Editorial guides",
    description: "Guides carousel with header copy",
    defaultData: {
      eyebrow: "Editorial travel guides",
      title: "Field notes from our specialists.",
      description:
        "Long-form writing for travellers who decide slowly — useful, opinionated, on-the-ground reporting.",
      limit: 12,
    },
  },
  reels: {
    type: "reels",
    label: "Reels",
    description: "Instagram-style reels strip",
    defaultData: {
      handle: "@thevacationvoice",
      title: "Reels from the road.",
      description: "Unedited moments from our specialists, our travellers, and the people who host them.",
      profileUrl: "https://instagram.com/thevacationvoice",
      ctaLabel: "Follow on Instagram",
    },
  },
  testimonials: {
    type: "testimonials",
    label: "Testimonials",
    description: "Review strip with header copy",
    defaultData: {
      eyebrow: "Travellers, on us",
      title: "A reputation built on the smallest details.",
      description: "What real travellers wrote when they came home. Verified reviews only.",
      limit: 3,
    },
  },
  conciergeCta: {
    type: "conciergeCta",
    label: "Concierge CTA",
    description: "Closing concierge call-to-action",
    defaultData: {
      eyebrow: "Concierge",
      title: "Can't find quite the journey you're imagining?",
      description:
        "Our specialists design private itineraries from scratch — dates, pace, party size, and whatever else makes the trip yours. Most proposals are sent within four working hours.",
      primaryLabel: "Talk to a Specialist",
      primaryHref: "/contact",
      secondaryLabel: "Request a private consultation",
      secondaryHref: "/contact?type=consultation",
    },
  },
};

export function sectionLabel(type: string): string {
  return SECTION_TYPE_META[type as HomeSectionType]?.label ?? type;
}

export function createLocalSection(type: HomeSectionType): HomeSection {
  return {
    id: crypto.randomUUID(),
    type,
    enabled: true,
    data: structuredClone(SECTION_TYPE_META[type].defaultData),
  };
}

export function ensureSections(raw: HomeSection[] | undefined): HomeSection[] {
  if (Array.isArray(raw) && raw.length > 0) {
    return raw.map((s) => ({
      id: s.id || crypto.randomUUID(),
      type: s.type,
      enabled: s.enabled !== false,
      data: s.data && typeof s.data === "object" ? { ...s.data } : {},
    }));
  }
  return HOME_SECTION_TYPES.map((type) => createLocalSection(type));
}
