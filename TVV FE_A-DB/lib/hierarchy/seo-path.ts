/**
 * SEO URL builders.
 *
 *  The CANONICAL URL shape is `/[country]/[destination]/[category]`. Every
 *  other surface (sitemap, internal links, breadcrumbs, JSON-LD) goes
 *  through this file so when we add a locale prefix later (`/en/...`,
 *  `/de/...`) there's one place to change.
 *
 *  We use names like "country slug" intentionally — even though the DB
 *  also has REGION above COUNTRY, the public URL skips region. The
 *  region is editorial taxonomy, not navigation.
 */

export interface CountryPathParts {
  country: string;
}
export interface DestinationPathParts extends CountryPathParts {
  destination: string;
}
export interface CategoryPathParts extends DestinationPathParts {
  category: string;
}

/** /[country] — the country landing page. */
export function buildCountryPath(parts: CountryPathParts): string {
  return `/${parts.country}`;
}

/** /[country]/[destination] — the destination landing page. */
export function buildDestinationPath(parts: DestinationPathParts): string {
  return `/${parts.country}/${parts.destination}`;
}

/** /[country]/[destination]/[category] — the category landing page. */
export function buildCategoryPath(parts: CategoryPathParts): string {
  return `/${parts.country}/${parts.destination}/${parts.category}`;
}

/**
 * Generic builder for an arbitrary depth, used by breadcrumbs and the
 * sitemap when iterating over chains of segments. `segments.length`
 * must be 1..3.
 */
export function buildHierarchyPath(segments: string[]): string {
  if (segments.length === 0 || segments.length > 3) {
    throw new Error(`Invalid hierarchy segments: ${segments.length}`);
  }
  return "/" + segments.join("/");
}
