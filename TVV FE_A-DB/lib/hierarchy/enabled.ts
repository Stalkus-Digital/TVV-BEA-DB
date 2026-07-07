/**
 * Postgres hierarchy is optional.
 * Disabled when unset, or when Vercel build would hit a developer-only localhost URL
 * (often from a committed `.env` — use `.env.local` for local Postgres instead).
 */
export function isHierarchyEnabled(): boolean {
  const url = process.env.HIERARCHY_DATABASE_URL?.trim();
  if (!url) return false;
  if (/localhost|127\.0\.0\.1/i.test(url)) {
    if (process.env.VERCEL === "1" || process.env.CI === "true") return false;
  }
  return true;
}
