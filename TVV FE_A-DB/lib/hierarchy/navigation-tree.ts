/**
 * Public navigation tree.
 *
 *  Shape returned (matches the spec for /api/navigation/tree):
 *
 *    [
 *      {
 *        "name": "India", "slug": "india", "href": "/india",
 *        "children": [
 *          {
 *            "name": "Andaman", "slug": "andaman", "href": "/india/andaman",
 *            "children": [
 *              { "name": "Honeymoon Packages", "slug": "honeymoon-packages",
 *                "href": "/india/andaman/honeymoon-packages" }
 *            ]
 *          }
 *        ]
 *      }
 *    ]
 *
 *  KEY DIFFERENCES FROM `./tree.ts`
 *  --------------------------------
 *  `./tree.ts` returns the *geographic* tree starting at REGION rows.
 *  That's the right shape for the admin's hierarchy explorer and for the
 *  legacy `/destinations-v2` surface.
 *
 *  THIS file returns the *public navigation* tree, rooted at COUNTRY and
 *  with categories appended as the leaf layer. It's what the mega menu,
 *  sitemap and JSON-LD breadcrumbs consume.
 *
 *  STRATEGY
 *  --------
 *  Two flat queries:
 *
 *    1. SELECT all published destinations where level IN (COUNTRY, DESTINATION)
 *    2. SELECT all published categories whose destination is published
 *
 *  Then assemble in memory. At our scale (< 5k geo rows, < 50k categories)
 *  this is the cheapest correct approach. Cached via `unstable_cache` with
 *  the same tag as the geo tree so a single admin write busts both.
 */

import { unstable_cache as cache } from "next/cache";
import { isHierarchyEnabled } from "./enabled";
import { hierarchyDb } from "./db";
import { buildCountryPath, buildDestinationPath, buildCategoryPath } from "./seo-path";
import { DESTINATION_TREE_TAG } from "./tree";
import { CATEGORIES_TAG } from "./categories";
import type { NavigationCountryNode } from "./types";

export const getNavigationTree = cache(
  async (): Promise<NavigationCountryNode[]> => {
    if (!isHierarchyEnabled()) return [];

    // Pull just the geographic rows the public URL exposes. REGION rows are
    // intentionally excluded — they don't appear in URLs and they're not a
    // menu column.
    const geoRows = await hierarchyDb.destination.findMany({
      where: { status: "PUBLISHED", level: { in: ["COUNTRY", "DESTINATION"] } },
      orderBy: [{ depth: "asc" }, { sortOrder: "asc" }, { name: "asc" }],
      select: {
        id: true,
        parentId: true,
        name: true,
        slug: true,
        level: true,
        imageUrl: true,
        heroImageUrl: true,
        isFeatured: true,
      },
    });

    const catRows = await hierarchyDb.destinationCategory.findMany({
      where: {
        status: "PUBLISHED",
        destination: { status: "PUBLISHED" },
      },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      select: {
        destinationId: true,
        name: true,
        slug: true,
        isFeatured: true,
      },
    });

    // ─── Assembly ──────────────────────────────────────────────────────────
    const countries = new Map<string, NavigationCountryNode>();
    const destBySlugUnderCountry = new Map<string, { destId: string; countrySlug: string; destSlug: string }>();

    // Pass 1: countries
    for (const r of geoRows) {
      if (r.level !== "COUNTRY") continue;
      countries.set(r.id.toString(), {
        name: r.name,
        slug: r.slug,
        href: buildCountryPath({ country: r.slug }),
        isFeatured: r.isFeatured,
        imageUrl: r.heroImageUrl ?? r.imageUrl ?? null,
        children: [],
      });
    }

    // Pass 2: destinations under their country
    for (const r of geoRows) {
      if (r.level !== "DESTINATION") continue;
      const country = r.parentId ? countries.get(r.parentId.toString()) : undefined;
      // Orphans (destinations whose country is unpublished/missing) are
      // dropped silently — surfacing them in the menu would imply a
      // working /unknown-country/<dest> URL, which would 404.
      if (!country) continue;
      country.children.push({
        name: r.name,
        slug: r.slug,
        href: buildDestinationPath({ country: country.slug, destination: r.slug }),
        isFeatured: r.isFeatured,
        imageUrl: r.heroImageUrl ?? r.imageUrl ?? null,
        children: [],
      });
      destBySlugUnderCountry.set(r.id.toString(), {
        destId: r.id.toString(),
        countrySlug: country.slug,
        destSlug: r.slug,
      });
    }

    // Pass 3: categories under their destination
    for (const c of catRows) {
      const meta = destBySlugUnderCountry.get(c.destinationId.toString());
      if (!meta) continue;
      const country = countries.get(
        // find the country that owns this destination by walking back through geoRows…
        // easier: re-find via a second pass — but we already cached it as countrySlug.
        // Look it up directly from the existing Map by scanning is overkill;
        // we kept slugs on `meta`, so use them to index the country.
        [...countries.entries()].find(([, n]) => n.slug === meta.countrySlug)?.[0] ?? "",
      );
      if (!country) continue;
      const dest = country.children.find((d) => d.slug === meta.destSlug);
      if (!dest) continue;
      dest.children.push({
        name: c.name,
        slug: c.slug,
        href: buildCategoryPath({
          country: country.slug,
          destination: dest.slug,
          category: c.slug,
        }),
        isFeatured: c.isFeatured,
      });
    }

    // Sort root by sortOrder we already applied via the SQL ORDER BY; the
    // Map preserves insertion order, so just convert.
    return [...countries.values()];
  },
  ["navigation-tree"],
  // Busted whenever either destinations or categories change.
  { revalidate: 300, tags: [DESTINATION_TREE_TAG, CATEGORIES_TAG] },
);
