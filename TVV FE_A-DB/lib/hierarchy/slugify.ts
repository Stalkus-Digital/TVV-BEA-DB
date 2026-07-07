/**
 * Slug utilities — kept identical in shape to the regex enforced by the
 * `slug_format` CHECK constraint in the DB migration. If you change the
 * regex here, you MUST change the CHECK constraint too.
 *
 *   /^[a-z0-9]+(-[a-z0-9]+)*$/
 *
 *  Lowercase ASCII letters and digits, separated by single hyphens. No
 *  underscores, no diacritics, no leading/trailing hyphens. This is the
 *  conservative shape that survives every URL encoder, every CDN cache key
 *  rule, and every Postgres collation.
 */

const SLUG_REGEX = /^[a-z0-9]+(-[a-z0-9]+)*$/;

/** True if the input is already a valid slug. */
export function isValidSlug(input: string): boolean {
  return SLUG_REGEX.test(input);
}

/**
 * Convert any human-readable string to a URL-safe slug.
 * Best-effort: strips diacritics, collapses whitespace + non-word characters
 * to single hyphens, lowercases.
 */
export function slugify(input: string): string {
  return input
    .normalize("NFKD")
    // strip combining diacritics (é → e)
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    // any run of non-alphanumeric chars becomes a single hyphen
    .replace(/[^a-z0-9]+/g, "-")
    // trim leading/trailing hyphens
    .replace(/^-+|-+$/g, "")
    // hard cap so admins can't accidentally create URL bombs
    .slice(0, 80);
}

/**
 * Validate a URL path's individual segments. Used at the route boundary
 * BEFORE we ever hit the DB — invalid segments mean a malformed URL, not a
 * missing row, and we 404 fast without a query.
 */
export function isValidSlugPathSegments(segments: string[]): boolean {
  if (segments.length === 0 || segments.length > 4) return false;
  return segments.every(isValidSlug);
}
