import { createLogger } from "@/shared/logger/create-logger";

const logger = createLogger("website-revalidate");

const DEFAULT_PATHS = ["/", "/packages/domestic", "/packages/international"] as const;

/**
 * Fire-and-forget ISR bust on the public marketing site after package
 * publish/archive. Never throws — publish must succeed even if revalidate fails.
 */
export async function notifyWebsitePackageChange(slug?: string | null): Promise<void> {
  const baseUrl = process.env.WEBSITE_REVALIDATE_URL?.replace(/\/$/, "");
  const secret = process.env.REVALIDATE_SECRET;

  if (!baseUrl || !secret) {
    logger.debug("Skipping website revalidate — WEBSITE_REVALIDATE_URL or REVALIDATE_SECRET unset");
    return;
  }

  const paths = [...DEFAULT_PATHS];
  const body: { paths: string[]; slug?: string } = { paths };
  if (slug?.trim()) {
    body.slug = slug.trim();
  }

  try {
    const res = await fetch(`${baseUrl}/api/revalidate`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-revalidate-secret": secret,
      },
      body: JSON.stringify(body),
      // Don't hang admin save on a slow/unreachable frontend
      signal: AbortSignal.timeout(8_000),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      logger.warn("Website revalidate failed", { status: res.status, text: text.slice(0, 200), slug });
      return;
    }

    logger.info("Website revalidated after package change", { slug: slug ?? null });
  } catch (err) {
    logger.warn("Website revalidate error", {
      slug: slug ?? null,
      message: err instanceof Error ? err.message : String(err),
    });
  }
}
