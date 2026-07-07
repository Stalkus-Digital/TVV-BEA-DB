/**
 * Tree fetcher — the only function that builds the full mega-menu payload.
 *
 *  STRATEGY
 *  --------
 *  At our scale (< 5k destinations) the cheapest approach is:
 *
 *    1. SELECT every published row in ONE flat query (one round-trip)
 *    2. Assemble parent/child links in memory using a Map<id, node>
 *    3. Cache the result with Next.js `unstable_cache` keyed on a tag
 *
 *  Why not a recursive CTE returning the tree shape? Postgres CTEs are
 *  excellent for ancestor lookups but generating nested JSON in SQL is
 *  cumbersome and the savings are negligible at this scale. We swap to a
 *  CTE only when row count crosses ~50k.
 *
 *  CACHE INVALIDATION
 *  ------------------
 *  Admin writes call `revalidateTag("destinations")`. The next read rebuilds
 *  the tree from Postgres in one query and re-caches. Until then, every
 *  page-load reads from the in-memory cache — sub-millisecond.
 *
 *  WHAT WE DON'T INCLUDE
 *  ---------------------
 *  No `seo_content`, no `gallery`, no `metaDescription` — those belong to
 *  the detail page, not the navigation. Keep the tree response < 50KB even
 *  with thousands of nodes.
 */

import { unstable_cache as cache } from "next/cache";
import { isHierarchyEnabled } from "./enabled";
import { hierarchyDb } from "./db";
import type { DestinationTreeNode } from "./types";

// Single source of truth for the cache tag. Admin writes import this same
// constant when they call revalidateTag().
export const DESTINATION_TREE_TAG = "destinations:tree";

export const getDestinationTree = cache(
  async (): Promise<DestinationTreeNode[]> => {
    if (!isHierarchyEnabled()) return [];
    const rows = await hierarchyDb.destination.findMany({
      where: { status: "PUBLISHED" },
      // Order matters: parents must be inserted into the map before children
      // so the assemble step can attach without a second pass.
      orderBy: [{ depth: "asc" }, { sortOrder: "asc" }, { name: "asc" }],
      select: {
        id: true,
        parentId: true,
        name: true,
        slug: true,
        slugPath: true,
        level: true,
        depth: true,
        imageUrl: true,
        sortOrder: true,
      },
    });

    const byId = new Map<string, DestinationTreeNode>();
    const roots: DestinationTreeNode[] = [];

    for (const r of rows) {
      const id = r.id.toString();
      byId.set(id, {
        id,
        parentId: r.parentId?.toString() ?? null,
        name: r.name,
        slug: r.slug,
        slugPath: r.slugPath,
        level: r.level,
        depth: r.depth,
        imageUrl: r.imageUrl,
        sortOrder: r.sortOrder,
        children: [],
      });
    }

    for (const node of byId.values()) {
      if (node.parentId === null) {
        roots.push(node);
      } else {
        const parent = byId.get(node.parentId);
        // If a parent is unpublished but the child is published, the child
        // is "orphaned" from the tree. We drop it from the menu silently —
        // showing it would imply a non-existent parent URL.
        parent?.children.push(node);
      }
    }

    return roots;
  },
  ["destination-tree"],
  { revalidate: 300, tags: [DESTINATION_TREE_TAG] },
);

/**
 * Flat list, no hierarchy — useful for the admin table, sitemap generation,
 * and search indexing. Cached separately because the consumer set is small
 * and a stale list hurts admins less than a stale public menu.
 */
export const getAllPublishedDestinations = cache(
  async () => {
    const rows = await hierarchyDb.destination.findMany({
      where: { status: "PUBLISHED" },
      orderBy: [{ depth: "asc" }, { name: "asc" }],
      select: {
        id: true,
        name: true,
        slug: true,
        slugPath: true,
        level: true,
        depth: true,
        updatedAt: true,
      },
    });
    return rows.map((r) => ({
      ...r,
      id: r.id.toString(),
      updatedAt: r.updatedAt.toISOString(),
    }));
  },
  ["destination-list"],
  { revalidate: 300, tags: [DESTINATION_TREE_TAG] },
);
