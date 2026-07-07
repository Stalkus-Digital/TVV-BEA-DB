/**
 * Content fetchers — the related-content surface that powers destination
 * pages, package pages, category landing pages, and the search/recommend
 * surfaces.
 *
 *  SCOPE
 *  -----
 *  Five domains hung off the destination tree:
 *    • Hotel        — 1:N to destination
 *    • Package      — M:N to destination, M:N to hotel, M:N to category
 *    • Guide        — 1:N to destination
 *    • FerryRoute   — 1:N to destination
 *    • FlightRoute  — 1:N to destination
 *
 *  FETCH SHAPES
 *  ------------
 *  Two flavours per domain:
 *    • `list*ForDestination(id)`  — the "related X for Y" feed
 *    • `resolve*BySlug(slug)`     — the detail page entry point
 *
 *  Detail-page calls eager-load join rows. List calls return slim node
 *  shapes (no body, no SEO content, no gallery) so a destination page
 *  rendering five rails costs five small queries, not five wide scans.
 *
 *  CACHING
 *  -------
 *  Lists are wrapped in `unstable_cache` with a per-destination cache
 *  key. Detail lookups are not cached because they're typically the
 *  single payload on a page (and ISR at the page level handles the rest).
 *  All cache tags are exported so the admin can bust them on write.
 */

import { unstable_cache as cache } from "next/cache";
import { hierarchyDb } from "./db";
import type {
  HotelNode,
  HotelDetail,
  PackageNode,
  PackageDetail,
  GuideNode,
  GuideDetail,
  FerryRouteNode,
  FlightRouteNode,
  DestinationNode,
} from "./types";

// ─── Cache tags ─────────────────────────────────────────────────────────────
export const HOTELS_TAG = "content:hotels";
export const PACKAGES_TAG = "content:packages";
export const GUIDES_TAG = "content:guides";
export const FERRIES_TAG = "content:ferries";
export const FLIGHTS_TAG = "content:flights";

// ═══════════════════════════════════════════════════════════════════════════
//  HOTELS
// ═══════════════════════════════════════════════════════════════════════════

export const listHotelsForDestination = cache(
  async (destinationId: string): Promise<HotelNode[]> => {
    const rows = await hierarchyDb.hotel.findMany({
      where: { destinationId: BigInt(destinationId), status: "PUBLISHED" },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      select: {
        id: true,
        destinationId: true,
        name: true,
        slug: true,
        starRating: true,
        shortDescription: true,
        heroImageUrl: true,
        isFeatured: true,
        sortOrder: true,
      },
    });
    return rows.map((r) => ({ ...r, id: r.id.toString(), destinationId: r.destinationId.toString() }));
  },
  ["content-hotels-by-dest"],
  { revalidate: 300, tags: [HOTELS_TAG] },
);

export async function resolveHotelBySlug(slug: string): Promise<HotelDetail | null> {
  const row = await hierarchyDb.hotel.findUnique({
    where: { slug },
    include: {
      destination: {
        select: {
          id: true, name: true, slug: true, slugPath: true, level: true, depth: true,
          imageUrl: true, sortOrder: true, parentId: true,
        },
      },
    },
  });
  if (!row || row.status !== "PUBLISHED") return null;
  return {
    id: row.id.toString(),
    destinationId: row.destinationId.toString(),
    name: row.name,
    slug: row.slug,
    starRating: row.starRating,
    shortDescription: row.shortDescription,
    heroImageUrl: row.heroImageUrl,
    gallery: row.gallery,
    metaTitle: row.metaTitle,
    metaDescription: row.metaDescription,
    seoContent: row.seoContent,
    status: row.status,
    isFeatured: row.isFeatured,
    sortOrder: row.sortOrder,
    publishedAt: row.publishedAt?.toISOString() ?? null,
    destination: toDestinationNode(row.destination),
  };
}

// ═══════════════════════════════════════════════════════════════════════════
//  PACKAGES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * "Packages that include this destination" — used on destination pages.
 * Pulls through the M2M join, deduplicated.
 */
export const listPackagesForDestination = cache(
  async (destinationId: string): Promise<PackageNode[]> => {
    const rows = await hierarchyDb.package.findMany({
      where: {
        status: "PUBLISHED",
        destinations: { some: { destinationId: BigInt(destinationId) } },
      },
      orderBy: [{ isFeatured: "desc" }, { sortOrder: "asc" }, { title: "asc" }],
      select: {
        id: true,
        title: true,
        slug: true,
        shortDescription: true,
        durationDays: true,
        durationNights: true,
        startingPrice: true,
        currency: true,
        heroImageUrl: true,
        isFeatured: true,
        sortOrder: true,
      },
    });
    return rows.map((r) => ({ ...r, id: r.id.toString() }));
  },
  ["content-packages-by-dest"],
  { revalidate: 300, tags: [PACKAGES_TAG] },
);

/**
 * "Packages on this category landing page" — used by category pages
 * like /india/andaman/honeymoon-packages.
 */
export const listPackagesForCategory = cache(
  async (categoryId: string): Promise<PackageNode[]> => {
    const rows = await hierarchyDb.package.findMany({
      where: {
        status: "PUBLISHED",
        categories: { some: { categoryId: BigInt(categoryId) } },
      },
      orderBy: [{ isFeatured: "desc" }, { sortOrder: "asc" }, { title: "asc" }],
      select: {
        id: true,
        title: true,
        slug: true,
        shortDescription: true,
        durationDays: true,
        durationNights: true,
        startingPrice: true,
        currency: true,
        heroImageUrl: true,
        isFeatured: true,
        sortOrder: true,
      },
    });
    return rows.map((r) => ({ ...r, id: r.id.toString() }));
  },
  ["content-packages-by-cat"],
  { revalidate: 300, tags: [PACKAGES_TAG] },
);

/**
 * Package detail — eager-loads every related row a package page renders.
 * Costs one query (Prisma flattens the joins). Not cached because pages
 * already ISR.
 */
export async function resolvePackageBySlug(slug: string): Promise<PackageDetail | null> {
  const row = await hierarchyDb.package.findUnique({
    where: { slug },
    include: {
      destinations: {
        orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }],
        include: {
          destination: {
            select: {
              id: true, name: true, slug: true, slugPath: true, level: true, depth: true,
              imageUrl: true, sortOrder: true, parentId: true,
            },
          },
        },
      },
      hotels: {
        orderBy: { sortOrder: "asc" },
        include: {
          hotel: {
            select: {
              id: true, destinationId: true, name: true, slug: true,
              starRating: true, shortDescription: true, heroImageUrl: true,
              isFeatured: true, sortOrder: true,
            },
          },
        },
      },
      categories: {
        orderBy: { sortOrder: "asc" },
        include: {
          category: {
            select: {
              id: true, destinationId: true, name: true, slug: true,
              heroImageUrl: true, isFeatured: true, sortOrder: true,
            },
          },
        },
      },
    },
  });

  if (!row || row.status !== "PUBLISHED") return null;

  return {
    id: row.id.toString(),
    title: row.title,
    slug: row.slug,
    shortDescription: row.shortDescription,
    durationDays: row.durationDays,
    durationNights: row.durationNights,
    startingPrice: row.startingPrice,
    currency: row.currency,
    heroImageUrl: row.heroImageUrl,
    gallery: row.gallery,
    metaTitle: row.metaTitle,
    metaDescription: row.metaDescription,
    seoContent: row.seoContent,
    status: row.status,
    isFeatured: row.isFeatured,
    sortOrder: row.sortOrder,
    publishedAt: row.publishedAt?.toISOString() ?? null,
    destinations: row.destinations.map((link) => ({
      isPrimary: link.isPrimary,
      sortOrder: link.sortOrder,
      nights: link.nights,
      destination: toDestinationNode(link.destination),
    })),
    hotels: row.hotels.map((link) => ({
      nights: link.nights,
      sortOrder: link.sortOrder,
      hotel: {
        id: link.hotel.id.toString(),
        destinationId: link.hotel.destinationId.toString(),
        name: link.hotel.name,
        slug: link.hotel.slug,
        starRating: link.hotel.starRating,
        shortDescription: link.hotel.shortDescription,
        heroImageUrl: link.hotel.heroImageUrl,
        isFeatured: link.hotel.isFeatured,
        sortOrder: link.hotel.sortOrder,
      },
    })),
    categories: row.categories.map((link) => ({
      sortOrder: link.sortOrder,
      category: {
        id: link.category.id.toString(),
        destinationId: link.category.destinationId.toString(),
        name: link.category.name,
        slug: link.category.slug,
        heroImageUrl: link.category.heroImageUrl,
        isFeatured: link.category.isFeatured,
        sortOrder: link.category.sortOrder,
      },
    })),
  };
}

// ═══════════════════════════════════════════════════════════════════════════
//  GUIDES
// ═══════════════════════════════════════════════════════════════════════════

export const listGuidesForDestination = cache(
  async (destinationId: string): Promise<GuideNode[]> => {
    const rows = await hierarchyDb.guide.findMany({
      where: { destinationId: BigInt(destinationId), status: "PUBLISHED" },
      orderBy: [{ isFeatured: "desc" }, { sortOrder: "asc" }, { title: "asc" }],
      select: {
        id: true,
        destinationId: true,
        title: true,
        slug: true,
        excerpt: true,
        readingMinutes: true,
        heroImageUrl: true,
        isFeatured: true,
        sortOrder: true,
      },
    });
    return rows.map((r) => ({ ...r, id: r.id.toString(), destinationId: r.destinationId.toString() }));
  },
  ["content-guides-by-dest"],
  { revalidate: 300, tags: [GUIDES_TAG] },
);

export async function resolveGuideBySlug(slug: string): Promise<GuideDetail | null> {
  const row = await hierarchyDb.guide.findUnique({
    where: { slug },
    include: {
      destination: {
        select: {
          id: true, name: true, slug: true, slugPath: true, level: true, depth: true,
          imageUrl: true, sortOrder: true, parentId: true,
        },
      },
    },
  });
  if (!row || row.status !== "PUBLISHED") return null;
  return {
    id: row.id.toString(),
    destinationId: row.destinationId.toString(),
    title: row.title,
    slug: row.slug,
    excerpt: row.excerpt,
    body: row.body,
    readingMinutes: row.readingMinutes,
    heroImageUrl: row.heroImageUrl,
    metaTitle: row.metaTitle,
    metaDescription: row.metaDescription,
    status: row.status,
    isFeatured: row.isFeatured,
    sortOrder: row.sortOrder,
    publishedAt: row.publishedAt?.toISOString() ?? null,
    destination: toDestinationNode(row.destination),
  };
}

// ═══════════════════════════════════════════════════════════════════════════
//  FERRY + FLIGHT ROUTES
// ═══════════════════════════════════════════════════════════════════════════

export const listFerryRoutesForDestination = cache(
  async (destinationId: string): Promise<FerryRouteNode[]> => {
    const rows = await hierarchyDb.ferryRoute.findMany({
      where: { destinationId: BigInt(destinationId), status: "PUBLISHED" },
      orderBy: [{ isFeatured: "desc" }, { sortOrder: "asc" }, { name: "asc" }],
      select: {
        id: true,
        destinationId: true,
        name: true,
        slug: true,
        originName: true,
        destinationName: true,
        operatorName: true,
        durationMinutes: true,
        startingPrice: true,
        currency: true,
        isFeatured: true,
        sortOrder: true,
      },
    });
    return rows.map((r) => ({ ...r, id: r.id.toString(), destinationId: r.destinationId.toString() }));
  },
  ["content-ferries-by-dest"],
  { revalidate: 300, tags: [FERRIES_TAG] },
);

export const listFlightRoutesForDestination = cache(
  async (destinationId: string): Promise<FlightRouteNode[]> => {
    const rows = await hierarchyDb.flightRoute.findMany({
      where: { destinationId: BigInt(destinationId), status: "PUBLISHED" },
      orderBy: [{ isFeatured: "desc" }, { sortOrder: "asc" }, { name: "asc" }],
      select: {
        id: true,
        destinationId: true,
        name: true,
        slug: true,
        originIATA: true,
        destIATA: true,
        originCity: true,
        destCity: true,
        approxDurationMinutes: true,
        startingPrice: true,
        currency: true,
        isFeatured: true,
        sortOrder: true,
      },
    });
    return rows.map((r) => ({ ...r, id: r.id.toString(), destinationId: r.destinationId.toString() }));
  },
  ["content-flights-by-dest"],
  { revalidate: 300, tags: [FLIGHTS_TAG] },
);

// ═══════════════════════════════════════════════════════════════════════════
//  Bundled fetch for the destination page
// ═══════════════════════════════════════════════════════════════════════════
/**
 * Single helper for destination pages: kicks off every related-content
 * query in parallel and returns a flat bag. Keeps the page component
 * thin and ensures a single `Promise.all` wait, not N sequential ones.
 */
export async function fetchDestinationRelatedContent(destinationId: string) {
  const [hotels, packages, guides, ferries, flights] = await Promise.all([
    listHotelsForDestination(destinationId),
    listPackagesForDestination(destinationId),
    listGuidesForDestination(destinationId),
    listFerryRoutesForDestination(destinationId),
    listFlightRoutesForDestination(destinationId),
  ]);
  return { hotels, packages, guides, ferries, flights };
}

// ─── Internal helpers ───────────────────────────────────────────────────────
function toDestinationNode(row: {
  id: bigint; parentId: bigint | null; name: string; slug: string;
  slugPath: string; level: "REGION" | "COUNTRY" | "DESTINATION" | "SUB_DESTINATION";
  depth: number; imageUrl: string | null; sortOrder: number;
}): DestinationNode {
  return {
    id: row.id.toString(),
    parentId: row.parentId?.toString() ?? null,
    name: row.name,
    slug: row.slug,
    slugPath: row.slugPath,
    level: row.level,
    depth: row.depth,
    imageUrl: row.imageUrl,
    sortOrder: row.sortOrder,
  };
}
