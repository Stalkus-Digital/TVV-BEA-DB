/**
 * Breadcrumbs — derived from the materialised path, no joins, no recursion.
 *
 *  EXAMPLE
 *  -------
 *  For a row whose slug_path is "asia-pacific/india/andaman", we compute
 *  the prefix paths:
 *
 *    ['asia-pacific',
 *     'asia-pacific/india',
 *     'asia-pacific/india/andaman']
 *
 *  Then one indexed `WHERE slug_path IN (...)` returns the three ancestor
 *  rows in a single round-trip. Sort by depth ascending = root → leaf.
 *
 *  This beats a recursive CTE by being O(1) Postgres planning work and
 *  perfectly cacheable per slug_path.
 */

import { hierarchyDb } from "./db";
import type { BreadcrumbItem } from "./types";

const ROUTE_PREFIX = "/destinations";
// ^ Update once we swap the catch-all from /destinations-v2/* to /destinations/*.
//   Centralised here so we never grep the codebase for "/destinations-v2".

/** Decompose a slug_path into all its ancestor prefixes (including itself). */
function prefixesOf(slugPath: string): string[] {
  const parts = slugPath.split("/");
  return parts.map((_, i) => parts.slice(0, i + 1).join("/"));
}

/**
 * Build a breadcrumb trail for a node. Always prepends Home + Destinations
 * for consistent layout across pages.
 */
export async function buildBreadcrumbs(slugPath: string): Promise<BreadcrumbItem[]> {
  const ancestorPaths = prefixesOf(slugPath);

  const rows = await hierarchyDb.destination.findMany({
    where: { slugPath: { in: ancestorPaths }, status: "PUBLISHED" },
    select: { name: true, slugPath: true, depth: true },
    orderBy: { depth: "asc" },
  });

  return [
    { label: "Home", href: "/" },
    { label: "Destinations", href: ROUTE_PREFIX },
    ...rows.map((r) => ({
      label: r.name,
      href: `${ROUTE_PREFIX}/${r.slugPath}`,
    })),
  ];
}
