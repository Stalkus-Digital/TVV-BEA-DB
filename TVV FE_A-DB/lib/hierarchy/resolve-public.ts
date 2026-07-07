/**
 * Public-URL resolver — turns `/[country]/[destination]/[category]`
 * segments into a typed result the catch-all page can render.
 *
 *  This is DIFFERENT from `./resolve.ts`.
 *  `./resolve.ts` resolves the full DB `slug_path` (`region/country/dest`)
 *  using the unique materialised-path index. That's the right tool for the
 *  legacy `/destinations-v2/<full-path>` URL surface.
 *
 *  THIS file resolves the new public URL — which skips the REGION segment.
 *  That means we can't use the `slug_path` index for a single-step lookup
 *  (the DB still stores `asia-pacific/india/andaman`, not `india/andaman`).
 *  Instead we do a three-step walk:
 *
 *    1. find COUNTRY where slug = segments[0] and level = 'COUNTRY'
 *    2. find DESTINATION where slug = segments[1] and parentId = country.id
 *    3. find CATEGORY where (destinationId, slug) = (dest.id, segments[2])
 *
 *  Each step hits the partial UNIQUE index on (parent_id, slug) — three
 *  btree seeks, ~1ms total. We refuse to do this in a single SQL view
 *  because the URL parameters are user-supplied and a single SQL would
 *  need 3 LIKE clauses on slug_path; that defeats the unique index.
 *
 *  VALIDATION
 *  ----------
 *  "Honeymoon-packages belongs to andaman" is enforced by the FK + the
 *  (destination_id, slug) lookup. There's no way for resolveCategoryUrl
 *  to return a category that isn't actually attached to the destination
 *  it was looked up under.
 *
 *  STATUS FILTERING
 *  ----------------
 *  Any ancestor with `status != 'PUBLISHED'` short-circuits to null. A
 *  draft destination must not produce a working category URL — the user
 *  would land on a category page whose breadcrumb points to a 404.
 */

import { hierarchyDb } from "./db";
import { isValidSlug } from "./slugify";
import type {
  DestinationDetail,
  DestinationCategoryDetail,
} from "./types";

export type HierarchyResolution =
  | { kind: "country"; country: DestinationDetail }
  | { kind: "destination"; country: DestinationDetail; destination: DestinationDetail }
  | {
      kind: "category";
      country: DestinationDetail;
      destination: DestinationDetail;
      category: DestinationCategoryDetail;
    }
  | { kind: "not_found" };

const COUNTRY_LEVEL = "COUNTRY" as const;
const DESTINATION_LEVEL = "DESTINATION" as const;
const PUBLISHED = "PUBLISHED" as const;

/**
 * Resolve 1, 2, or 3 URL segments to a country/destination/category chain.
 * Returns kind:"not_found" for any invalid combination — including
 * structurally invalid segments, missing rows, draft ancestors, or
 * parent-child mismatches.
 *
 * The catch-all page should `notFound()` whenever this returns "not_found".
 */
export async function resolveHierarchyUrl(
  segments: string[],
  options: { includeDrafts?: boolean } = {},
): Promise<HierarchyResolution> {
  // ─── Segment shape gates ────────────────────────────────────────────────
  if (segments.length < 1 || segments.length > 3) return { kind: "not_found" };
  if (!segments.every(isValidSlug)) return { kind: "not_found" };

  const [countrySlug, destinationSlug, categorySlug] = segments;
  const allow = options.includeDrafts ?? false;

  // ─── 1. Country (level=COUNTRY) ─────────────────────────────────────────
  const country = await hierarchyDb.destination.findFirst({
    where: {
      slug: countrySlug,
      level: COUNTRY_LEVEL,
      ...(allow ? {} : { status: PUBLISHED }),
    },
  });
  if (!country) return { kind: "not_found" };
  const countryDetail = toDestinationDetail(country);

  if (segments.length === 1) {
    return { kind: "country", country: countryDetail };
  }

  // ─── 2. Destination (level=DESTINATION, parent=country.id) ──────────────
  const destination = await hierarchyDb.destination.findFirst({
    where: {
      slug: destinationSlug,
      level: DESTINATION_LEVEL,
      parentId: country.id,
      ...(allow ? {} : { status: PUBLISHED }),
    },
  });
  if (!destination) return { kind: "not_found" };
  const destinationDetail = toDestinationDetail(destination);

  if (segments.length === 2) {
    return { kind: "destination", country: countryDetail, destination: destinationDetail };
  }

  // ─── 3. Category (destinationId=dest.id, slug=cat) ──────────────────────
  const category = await hierarchyDb.destinationCategory.findUnique({
    where: { destinationId_slug: { destinationId: destination.id, slug: categorySlug } },
  });
  if (!category) return { kind: "not_found" };
  if (!allow && category.status !== "PUBLISHED") return { kind: "not_found" };

  return {
    kind: "category",
    country: countryDetail,
    destination: destinationDetail,
    category: {
      id: category.id.toString(),
      destinationId: category.destinationId.toString(),
      name: category.name,
      slug: category.slug,
      description: category.description,
      metaTitle: category.metaTitle,
      metaDescription: category.metaDescription,
      seoContent: category.seoContent,
      heroImageUrl: category.heroImageUrl,
      sortOrder: category.sortOrder,
      status: category.status,
      isFeatured: category.isFeatured,
      publishedAt: category.publishedAt?.toISOString() ?? null,
    },
  };
}

// Local mapper — full Prisma row → serialisable detail. Kept here (not in
// resolve.ts) so this file has zero coupling to the slugPath resolver.
function toDestinationDetail(
  // deliberately typed `any` to avoid pulling the Prisma row type into the
  // public surface; the input shape is fully controlled by callers above.
  row: {
    id: bigint;
    parentId: bigint | null;
    name: string;
    slug: string;
    slugPath: string;
    level: "REGION" | "COUNTRY" | "DESTINATION" | "SUB_DESTINATION";
    depth: number;
    imageUrl: string | null;
    sortOrder: number;
    metaTitle: string | null;
    metaDescription: string | null;
    seoContent: string | null;
    heroImageUrl: string | null;
    gallery: string[];
    status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
    isFeatured: boolean;
    publishedAt: Date | null;
  },
): DestinationDetail {
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
    metaTitle: row.metaTitle,
    metaDescription: row.metaDescription,
    seoContent: row.seoContent,
    heroImageUrl: row.heroImageUrl,
    gallery: row.gallery,
    status: row.status,
    isFeatured: row.isFeatured,
    publishedAt: row.publishedAt?.toISOString() ?? null,
  };
}
