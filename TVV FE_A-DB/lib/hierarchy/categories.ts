/**
 * DestinationCategory queries.
 *
 *  Categories are the third URL segment in /[country]/[destination]/[category].
 *  They're a separate table joined to destinations (see schema.prisma for
 *  the rationale). Three read paths the rest of the codebase needs:
 *
 *   • listCategoriesForDestination — feeds the category index page and the
 *     mega menu's third column.
 *   • resolveCategory — single-row lookup by (destinationId, slug) for the
 *     catch-all page.
 *   • collectAllPublishedCategories — flat dump for sitemap and search index.
 */

import { unstable_cache as cache } from "next/cache";
import { hierarchyDb } from "./db";
import type { DestinationCategoryDetail, DestinationCategoryNode } from "./types";

export const CATEGORIES_TAG = "destinations:categories";

/** Children of a given destination, published only, sorted for display. */
export async function listCategoriesForDestination(
  destinationId: bigint,
): Promise<DestinationCategoryNode[]> {
  const rows = await hierarchyDb.destinationCategory.findMany({
    where: { destinationId, status: "PUBLISHED" },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    select: {
      id: true,
      destinationId: true,
      name: true,
      slug: true,
      heroImageUrl: true,
      sortOrder: true,
      isFeatured: true,
    },
  });
  return rows.map((r) => ({
    id: r.id.toString(),
    destinationId: r.destinationId.toString(),
    name: r.name,
    slug: r.slug,
    heroImageUrl: r.heroImageUrl,
    sortOrder: r.sortOrder,
    isFeatured: r.isFeatured,
  }));
}

/** Single-row lookup by composite natural key. */
export async function resolveCategory(
  destinationId: bigint,
  slug: string,
  options: { includeDrafts?: boolean } = {},
): Promise<DestinationCategoryDetail | null> {
  const row = await hierarchyDb.destinationCategory.findUnique({
    where: { destinationId_slug: { destinationId, slug } },
  });
  if (!row) return null;
  if (!options.includeDrafts && row.status !== "PUBLISHED") return null;
  return {
    id: row.id.toString(),
    destinationId: row.destinationId.toString(),
    name: row.name,
    slug: row.slug,
    description: row.description,
    metaTitle: row.metaTitle,
    metaDescription: row.metaDescription,
    seoContent: row.seoContent,
    heroImageUrl: row.heroImageUrl,
    sortOrder: row.sortOrder,
    status: row.status,
    isFeatured: row.isFeatured,
    publishedAt: row.publishedAt?.toISOString() ?? null,
  };
}

/** Flat dump for sitemap generation and search indexing. */
export const collectAllPublishedCategories = cache(
  async () => {
    const rows = await hierarchyDb.destinationCategory.findMany({
      where: { status: "PUBLISHED", destination: { status: "PUBLISHED" } },
      orderBy: [{ destinationId: "asc" }, { sortOrder: "asc" }],
      select: {
        id: true,
        destinationId: true,
        name: true,
        slug: true,
        updatedAt: true,
        destination: { select: { slugPath: true } },
      },
    });
    return rows.map((r) => ({
      id: r.id.toString(),
      destinationId: r.destinationId.toString(),
      destinationSlugPath: r.destination.slugPath,
      name: r.name,
      slug: r.slug,
      updatedAt: r.updatedAt.toISOString(),
    }));
  },
  ["destination-categories-list"],
  { revalidate: 300, tags: [CATEGORIES_TAG] },
);
