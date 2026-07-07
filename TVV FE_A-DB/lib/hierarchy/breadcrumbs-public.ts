/**
 * Root-rooted breadcrumb builder.
 *
 *  Given a resolved hierarchy, produce a breadcrumb trail whose hrefs use
 *  the public URL shape `/[country]/[destination]/[category]`.
 *
 *  Why a separate file from `./breadcrumbs.ts`?
 *  --------------------------------------------
 *  `./breadcrumbs.ts` is keyed off the materialised `slug_path` (which
 *  starts with REGION) and emits `/destinations-v2/...` hrefs. That file
 *  still serves the legacy surface during the transition.
 *
 *  THIS file works off the resolver result and emits root-rooted hrefs.
 *  It needs zero extra DB calls because the resolver has already loaded
 *  every parent in the chain.
 */

import type { HierarchyResolution } from "./resolve-public";
import {
  buildCountryPath,
  buildDestinationPath,
  buildCategoryPath,
} from "./seo-path";
import type { BreadcrumbItem } from "./types";

/**
 * Build the breadcrumb trail for whatever level the resolver landed on.
 * Always begins with Home so renderers don't have to special-case the first
 * crumb.
 */
export function buildPublicBreadcrumbs(
  resolution: HierarchyResolution,
): BreadcrumbItem[] {
  const trail: BreadcrumbItem[] = [{ label: "Home", href: "/" }];

  if (resolution.kind === "not_found") return trail;

  trail.push({
    label: resolution.country.name,
    href: buildCountryPath({ country: resolution.country.slug }),
  });

  if (resolution.kind === "country") return trail;

  trail.push({
    label: resolution.destination.name,
    href: buildDestinationPath({
      country: resolution.country.slug,
      destination: resolution.destination.slug,
    }),
  });

  if (resolution.kind === "destination") return trail;

  trail.push({
    label: resolution.category.name,
    href: buildCategoryPath({
      country: resolution.country.slug,
      destination: resolution.destination.slug,
      category: resolution.category.slug,
    }),
  });

  return trail;
}
