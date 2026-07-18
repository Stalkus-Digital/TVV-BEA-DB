import { randomUUID } from "crypto";
import { ValidationError } from "@/shared/errors";
import type { HeroBannerDTO, HomeSectionDTO, QuickLinkDTO } from "../dto/website-homepage.dto";

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

const TYPE_SET = new Set<string>(HOME_SECTION_TYPES);

export function isHomeSectionType(type: string): type is HomeSectionType {
  return TYPE_SET.has(type);
}

/** Default composition — mirrors frontend homepageMock so empty CMS looks identical. */
export function createDefaultHomeSections(): HomeSectionDTO[] {
  return [
    {
      id: randomUUID(),
      type: "hero",
      enabled: true,
      data: {
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
    { id: randomUUID(), type: "trustBar", enabled: true, data: {} },
    {
      id: randomUUID(),
      type: "andamanSpotlight",
      enabled: true,
      data: {
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
    {
      id: randomUUID(),
      type: "destinationTabs",
      enabled: true,
      data: {
        eyebrow: "Curated Global Destinations",
        title: "A globe, edited.",
        description:
          "Sixty-five destinations, each one walked by a specialist. Choose a region — we'll show you the journeys we actually recommend.",
      },
    },
    {
      id: randomUUID(),
      type: "experiences",
      enabled: true,
      data: {
        eyebrow: "Travel by experience",
        title: "The way you travel, not the place you go.",
        description: "Pick a thread — honeymoon, adventure, slow wellness, food — and we'll route a journey around it.",
        limit: 8,
      },
    },
    {
      id: randomUUID(),
      type: "featuredJourneys",
      enabled: true,
      data: {
        eyebrow: "Featured journeys",
        title: "Itineraries our specialists actually recommend.",
        description:
          "A live shelf, refreshed weekly. Every itinerary is a starting point — yours will be redrawn around how you travel.",
      },
    },
    {
      id: randomUUID(),
      type: "editorialGuides",
      enabled: true,
      data: {
        eyebrow: "Editorial travel guides",
        title: "Field notes from our specialists.",
        description:
          "Long-form writing for travellers who decide slowly — useful, opinionated, on-the-ground reporting.",
        limit: 12,
      },
    },
    {
      id: randomUUID(),
      type: "reels",
      enabled: true,
      data: {
        handle: "@thevacationvoice",
        title: "Reels from the road.",
        description: "Unedited moments from our specialists, our travellers, and the people who host them.",
        profileUrl: "https://instagram.com/thevacationvoice",
        ctaLabel: "Follow on Instagram",
      },
    },
    {
      id: randomUUID(),
      type: "testimonials",
      enabled: true,
      data: {
        eyebrow: "Travellers, on us",
        title: "A reputation built on the smallest details.",
        description: "What real travellers wrote when they came home. Verified reviews only.",
        limit: 3,
      },
    },
    {
      id: randomUUID(),
      type: "conciergeCta",
      enabled: true,
      data: {
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
  ];
}

export function defaultDataForType(type: HomeSectionType): Record<string, unknown> {
  const found = createDefaultHomeSections().find((s) => s.type === type);
  return found ? { ...(found.data ?? {}) } : {};
}

export function createSection(type: HomeSectionType): HomeSectionDTO {
  return {
    id: randomUUID(),
    type,
    enabled: true,
    data: defaultDataForType(type),
  };
}

function ensureId(id: unknown): string {
  return typeof id === "string" && id.length > 0 ? id : randomUUID();
}

function normalizeSection(raw: unknown): HomeSectionDTO | null {
  if (!raw || typeof raw !== "object") return null;
  const s = raw as Record<string, unknown>;
  const type = typeof s.type === "string" ? s.type : "";
  if (!isHomeSectionType(type)) return null;
  return {
    id: ensureId(s.id),
    type,
    enabled: s.enabled !== false,
    data: s.data && typeof s.data === "object" && !Array.isArray(s.data)
      ? (s.data as Record<string, unknown>)
      : {},
  };
}

/**
 * Resolve sections from stored HOME_SECTIONS JSON.
 * Migrates legacy { heroBanner, quickLinks } into a seeded sections list.
 */
export function resolveHomeSections(config: unknown): {
  sections: HomeSectionDTO[];
  heroBanner: HeroBannerDTO | null;
  quickLinks: QuickLinkDTO[] | null;
} {
  const defaults = createDefaultHomeSections();

  if (!config || typeof config !== "object") {
    return { sections: defaults, heroBanner: null, quickLinks: null };
  }

  const body = config as Record<string, unknown>;
  const quickLinks = Array.isArray(body.quickLinks) ? (body.quickLinks as QuickLinkDTO[]) : null;
  const heroBanner =
    body.heroBanner && typeof body.heroBanner === "object"
      ? (body.heroBanner as HeroBannerDTO)
      : null;

  if (Array.isArray(body.sections) && body.sections.length > 0) {
    const sections = body.sections
      .map(normalizeSection)
      .filter((s): s is HomeSectionDTO => s !== null);
    if (sections.length > 0) {
      return { sections, heroBanner, quickLinks };
    }
  }

  // Legacy: only heroBanner / quickLinks — seed defaults and merge heroBanner into hero
  let sections = defaults;
  if (heroBanner) {
    sections = sections.map((section) => {
      if (section.type !== "hero") return section;
      const images = Array.isArray(section.data.images) ? [...(section.data.images as string[])] : [];
      if (heroBanner.backgroundImage && images.length === 0) {
        images[0] = heroBanner.backgroundImage;
      } else if (heroBanner.backgroundImage && !images[0]) {
        images[0] = heroBanner.backgroundImage;
      }
      return {
        ...section,
        data: {
          ...section.data,
          headline: heroBanner.headline || section.data.headline,
          subheadline: heroBanner.subheadline || section.data.subheadline,
          images,
        },
      };
    });
  }

  return { sections, heroBanner, quickLinks };
}

/** Derive flat heroBanner from first enabled hero section (legacy clients). */
export function heroBannerFromSections(
  sections: HomeSectionDTO[],
  fallback: HeroBannerDTO
): HeroBannerDTO {
  const hero = sections.find((s) => s.type === "hero" && s.enabled);
  if (!hero) return fallback;
  const d = hero.data;
  const images = Array.isArray(d.images) ? (d.images as string[]) : [];
  return {
    headline: typeof d.headline === "string" ? d.headline : fallback.headline,
    subheadline: typeof d.subheadline === "string" ? d.subheadline : fallback.subheadline,
    backgroundImage: images[0] ?? fallback.backgroundImage,
    ctaLabel: fallback.ctaLabel,
    ctaUrl: fallback.ctaUrl,
  };
}

export function validateHomeSectionsConfig(value: unknown): {
  sections: HomeSectionDTO[];
  quickLinks?: QuickLinkDTO[];
  heroBanner?: HeroBannerDTO;
} {
  if (!value || typeof value !== "object") {
    throw new ValidationError("HOME_SECTIONS value must be an object");
  }

  const body = value as Record<string, unknown>;

  if (!Array.isArray(body.sections)) {
    throw new ValidationError("HOME_SECTIONS.sections must be an array");
  }

  const sections: HomeSectionDTO[] = [];
  for (let i = 0; i < body.sections.length; i++) {
    const raw = body.sections[i];
    if (!raw || typeof raw !== "object") {
      throw new ValidationError(`sections[${i}] must be an object`);
    }
    const s = raw as Record<string, unknown>;
    if (typeof s.type !== "string" || !isHomeSectionType(s.type)) {
      throw new ValidationError(
        `sections[${i}].type must be one of: ${HOME_SECTION_TYPES.join(", ")}`
      );
    }
    if (typeof s.enabled !== "boolean") {
      throw new ValidationError(`sections[${i}].enabled must be a boolean`);
    }
    const data =
      s.data === undefined
        ? {}
        : s.data && typeof s.data === "object" && !Array.isArray(s.data)
          ? (s.data as Record<string, unknown>)
          : null;
    if (data === null) {
      throw new ValidationError(`sections[${i}].data must be an object`);
    }
    sections.push({
      id: ensureId(s.id),
      type: s.type,
      enabled: s.enabled,
      data,
    });
  }

  const result: {
    sections: HomeSectionDTO[];
    quickLinks?: QuickLinkDTO[];
    heroBanner?: HeroBannerDTO;
  } = { sections };

  if (Array.isArray(body.quickLinks)) {
    result.quickLinks = body.quickLinks as QuickLinkDTO[];
  }
  if (body.heroBanner && typeof body.heroBanner === "object") {
    result.heroBanner = body.heroBanner as HeroBannerDTO;
  }

  return result;
}
