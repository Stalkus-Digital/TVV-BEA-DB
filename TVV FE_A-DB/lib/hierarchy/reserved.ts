/**
 * Reserved top-level URL segments.
 *
 *  The new SEO surface lives at `/[country]/...` via a root catch-all route
 *  (`app/[...slugs]/page.tsx`). Next.js prefers static segments over catch-
 *  alls, so `/about`, `/contact`, `/tours` etc. continue to be served by
 *  their existing files — the catch-all only fires when no other file
 *  matches.
 *
 *  This list is the OPERATIONAL safety net for two cases the routing layer
 *  alone can't catch:
 *
 *   1. Admin write-time: an editor creates a country with slug = "about".
 *      The URL `/about/india/...` would technically work (it's a 3-segment
 *      catch-all match), but `/about` alone would still be served by the
 *      `about/page.tsx` static file, leaving the country hidden. We reject
 *      reserved slugs at the admin layer to prevent that confusion.
 *
 *   2. Future-proofing: when someone adds `app/blog/page.tsx`, they'll
 *      register the slug here too so we never accidentally allow a country
 *      named "blog" that gets shadowed.
 *
 *  KEEP THIS IN SYNC with the top-level entries in `app/`. Easiest way:
 *  grep `ls tvv\ 2/app | grep -v -E '\.(tsx|ts|css)$|^\(.*\)$'` and add
 *  any new directory here.
 */

export const RESERVED_TOP_LEVEL_SLUGS = new Set<string>([
  // existing static routes
  "about",
  "andaman",
  "api",
  "calculator",
  "contact",
  "corporate",
  "destinations",
  "destinations-v2",
  "experiences",
  "faq",
  "ferry",
  "flights",
  "guides",
  "honeymoon",
  "luxury",
  "packages",
  "privacy",
  "search",
  "terms",
  "tours",

  // Next.js / framework conventions
  "_next",
  "favicon.ico",
  "robots.txt",
  "sitemap.xml",
]);

/**
 * True if a slug would collide with an existing top-level route. Use at
 * the admin write layer to reject the proposed country slug before it
 * hits the DB. The public reader doesn't need this check — Next.js's
 * routing precedence makes the collision invisible anyway, but the row
 * would be unreachable, which is worse.
 */
export function isReservedTopLevelSlug(slug: string): boolean {
  return RESERVED_TOP_LEVEL_SLUGS.has(slug);
}
