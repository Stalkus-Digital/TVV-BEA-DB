/**
 * Resolves absolute URLs for same-origin Next.js route handlers (e.g. hierarchy tree).
 */
export function siteApiUrl(path: string): string {
  if (path.startsWith("http")) return path;
  const normalized = path.startsWith("/") ? path : `/${path}`;

  if (typeof window !== "undefined") {
    return `${window.location.origin}${normalized}`;
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  if (siteUrl) return `${siteUrl}${normalized}`;

  const vercel = process.env.VERCEL_URL?.replace(/\/$/, "");
  if (vercel) return `https://${vercel}${normalized}`;

  const port = process.env.PORT ?? "3001";
  return `http://localhost:${port}${normalized}`;
}
