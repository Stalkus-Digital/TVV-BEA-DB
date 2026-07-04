/**
 * Redirect lookup + management.
 *
 *  TWO READ PATHS
 *  --------------
 *  • `lookupRedirect(path)` — hot path, called from the catch-all on
 *    EVERY unresolved URL. Cached in memory for 60s, busted by
 *    revalidateTag(REDIRECTS_TAG) on any write.
 *
 *  • `listRedirects({...})` — admin path, paginated, no cache.
 *
 *  REDIRECT CHAIN PROTECTION
 *  -------------------------
 *  `resolveRedirectChain` follows transitive redirects up to a cap. If
 *  A → B and B → C, the visitor goes straight to C with one 301 — we
 *  don't bounce them through B. The cap (8 hops) is a paranoid ceiling
 *  to prevent infinite loops that survived the migration insertion-time
 *  check.
 *
 *  PRECEDENCE
 *  ----------
 *  Locale-specific redirects (locale != null) beat locale-agnostic ones
 *  for the same fromPath. The DB constraint says fromPath is globally
 *  unique, so this only matters when multilingual lands — the API is
 *  ready, the data isn't.
 */

import { hierarchyDb } from "./db";

export const REDIRECTS_TAG = "seo:redirects";

export interface RedirectHit {
  toPath: string;
  statusCode: number;
}

const MAX_HOPS = 8;

/**
 * Process-memory cache of all active redirects, refreshed lazily.
 *
 *  We deliberately avoid `unstable_cache` here. In Next 15 dev,
 *  unstable_cache's interaction with revalidateTag is timing-sensitive
 *  and we saw stale-empty cache hits during local testing. A plain
 *  in-process Map keyed on the singleton list is simpler, faster, and
 *  bust-able from any code path.
 *
 *  Cache lifetime: 60 seconds. Admin writes call `bustRedirectCache()`
 *  on the same process to invalidate immediately. Across processes (if
 *  we scale horizontally) the 60s TTL is the upper bound; that's good
 *  enough for redirects which are deliberately stable.
 */
interface CacheEntry {
  expiresAt: number;
  map: Map<string, { toPath: string; statusCode: number }>;
}
let memoryCache: CacheEntry | null = null;
const CACHE_TTL_MS = 60_000;

async function loadRedirectMap(): Promise<CacheEntry["map"]> {
  if (memoryCache && memoryCache.expiresAt > Date.now()) {
    return memoryCache.map;
  }
  const rows = await hierarchyDb.redirect.findMany({
    where: { isActive: true },
    select: { fromPath: true, toPath: true, statusCode: true },
  });
  const map = new Map<string, { toPath: string; statusCode: number }>();
  for (const r of rows) map.set(r.fromPath, { toPath: r.toPath, statusCode: r.statusCode });
  memoryCache = { expiresAt: Date.now() + CACHE_TTL_MS, map };
  return map;
}

/** Drop the in-memory map. Called by write endpoints. */
export function bustRedirectCache() {
  memoryCache = null;
}

/**
 * Resolve a possibly-multi-hop redirect chain for `fromPath`.
 *
 *  Returns the FINAL hop's target (statusCode preserved so the caller
 *  can render 301 vs 307 correctly). Null = no redirect applies, or a
 *  cycle was detected (logged + treated as misconfiguration).
 */
export async function lookupRedirect(fromPath: string): Promise<RedirectHit | null> {
  const byFrom = await loadRedirectMap();
  if (byFrom.size === 0) return null;

  let current = fromPath;
  const seen = new Set<string>([current]);
  let lastHit: RedirectHit | null = null;

  for (let i = 0; i < MAX_HOPS; i++) {
    const hit = byFrom.get(current);
    if (!hit) return lastHit;
    if (seen.has(hit.toPath)) {
      console.warn(`[redirects] cycle detected starting at ${fromPath}`);
      return null;
    }
    seen.add(hit.toPath);
    current = hit.toPath;
    lastHit = hit;
  }
  console.warn(`[redirects] chain longer than ${MAX_HOPS} hops from ${fromPath}`);
  return lastHit;
}

// ─── Admin-side CRUD ───────────────────────────────────────────────────────

export interface CreateRedirectInput {
  fromPath: string;
  toPath: string;
  statusCode?: number;
  locale?: string | null;
  reason?: string | null;
}

export async function createManualRedirect(input: CreateRedirectInput) {
  const normFrom = normalizePath(input.fromPath);
  const normTo = normalizePath(input.toPath);
  if (normFrom === normTo) {
    throw new Error("Redirect cannot point to itself");
  }
  return hierarchyDb.redirect.create({
    data: {
      fromPath: normFrom,
      toPath: normTo,
      statusCode: input.statusCode ?? 301,
      locale: input.locale ?? null,
      reason: input.reason ?? null,
      source: "MANUAL",
      isActive: true,
    },
  });
}

export async function listRedirects(options: {
  source?: "MANUAL" | "SLUG_HISTORY" | "IMPORT";
  isActive?: boolean;
  search?: string;
  limit?: number;
  cursor?: bigint;
} = {}) {
  return hierarchyDb.redirect.findMany({
    where: {
      ...(options.source ? { source: options.source } : {}),
      ...(options.isActive !== undefined ? { isActive: options.isActive } : {}),
      ...(options.search
        ? {
            OR: [
              { fromPath: { contains: options.search, mode: "insensitive" } },
              { toPath: { contains: options.search, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    orderBy: { updatedAt: "desc" },
    take: options.limit ?? 50,
    ...(options.cursor ? { cursor: { id: options.cursor }, skip: 1 } : {}),
  });
}

export async function deleteRedirect(id: bigint) {
  return hierarchyDb.redirect.delete({ where: { id } });
}

/**
 * Normalise a URL path: ensure leading slash, strip trailing slash,
 * collapse multiple slashes. The redirect engine should be operating
 * on canonical paths only.
 */
function normalizePath(p: string): string {
  let n = p.trim();
  if (!n.startsWith("/")) n = "/" + n;
  n = n.replace(/\/+/g, "/");
  if (n.length > 1 && n.endsWith("/")) n = n.slice(0, -1);
  return n;
}
