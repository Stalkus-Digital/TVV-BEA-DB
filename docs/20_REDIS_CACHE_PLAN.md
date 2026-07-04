# 20 — Redis Cache Plan

**Status:** Phase 2 — architecture plan only, no code implemented. This document turns Website's already-reserved-but-unimplemented `WebsiteCache` port into a concrete plan. Confirmed this session: `cache/` exists in exactly one module (Website); the port (`get`/`set`/`invalidate`/`invalidateByTag`) has zero concrete implementation and zero consumer — every `HomepageService`/`WebsiteSearchService`/`WebsitePackageService` call resolves fresh on every request today.

## Provider: Not Vercel KV

Vercel KV has been retired — Vercel now offers databases (including Redis-compatible options) through its Marketplace rather than as a first-party product. Recommend **Upstash Redis** via the Vercel Marketplace: it is Vercel-native (one-click provisioning, env vars auto-injected the same way `validateEnv` already expects for every other config value in this project), REST-based (works cleanly from Fluid Compute without a persistent TCP connection pool, unlike a traditional Redis client), and priced per-request rather than requiring a dedicated always-on instance — appropriate for a system whose actual read volume is still unknown.

## What to Cache — Per `docs/02`'s Own Caching Strategy, Already Decided

`docs/02_SYSTEM_ARCHITECTURE.md`'s Caching Strategy section already drew this line, before any code existed:

**Cache**: Airport List, Destination List, Hotel Metadata, Static Inventory.
**Never cache**: Flight Prices, Hotel Prices, Availability, Seat Maps.

Mapped onto the actual modules built since then:

| Cache candidate | Source | Suggested TTL |
|---|---|---|
| `GET /api/website/home` (homepage response) | Website | 5 minutes |
| `GET /api/website/destinations` (list) | Website | 15 minutes |
| `GET /api/website/destination/:slug` (detail) | Website | 15 minutes |
| `GET /api/website/packages` / `/package/:slug` | Website | 5 minutes (published packages change more often than destinations) |
| `GET /api/geography/airports` / `/countries` / `/states` / `/cities` | Destination | 1 hour — genuinely static reference data |
| `GET /api/website/navigation` | Website | 15 minutes |

**Never cache** (consistent with `docs/02`, and with this project's own repeated documentation of these as intentionally-live reads): any `PackagePricing.compute()` result, any `QuotePriceResult`/computed Booking totals, `GET /api/suppliers/*/health`, anything under `/api/bookings/*` or `/api/quotes/*` (admin, low-traffic, correctness-critical — caching would risk showing stale payment/status state to ops staff, with no corresponding performance benefit given the low request volume that surface will ever see).

## Design: Implement the Existing Port, Don't Redesign It

`src/modules/website/cache/website-cache.port.ts` already defines the shape this plan builds against:
```ts
interface WebsiteCache {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttlSeconds: number): Promise<void>;
  invalidate(key: string): Promise<void>;
  invalidateByTag(tag: string): Promise<void>;
}
```
A concrete `UpstashWebsiteCache implements WebsiteCache` is the only new class needed at the Website-module level — registered in `website/module.ts` alongside the existing service tokens, exactly like every other module registers a concrete implementation behind an interface.

### Where the Cache Actually Gets Called

The port existing with zero consumers is itself a gap this plan closes: `HomepageService.getHomepage()`, `WebsiteDestinationService.listDestinations()`/`getDestinationDetail()`, `WebsitePackageService.listPackages()`/`getPackageDetail()`, and `NavigationService.getNavigation()` each wrap their existing logic in a `cache.get(key) ?? (compute and cache.set(...))` check — an additive change to each method's first and last lines, not a redesign of any of them.

### Key Naming and Tagging

`website:home`, `website:destinations:list`, `website:destination:{slug}`, `website:package:{slug}`, `website:navigation`. Tags: every destination-scoped key gets tag `destination:{id}`; every package-scoped key gets tag `package:{id}`.

### Invalidation Strategy

Tag-based, triggered from the **owning module**, not from Website itself (Website has no write path to Destination/Package data — it only reads via their public services, so it cannot know when to invalidate on its own). Two options:

1. **Time-based only (TTL, no active invalidation)** — simplest, matches the "5–15 minute staleness is acceptable for a marketing site" reality of a travel package listing. Recommended starting point.
2. **Active invalidation via a lightweight event** — `DestinationService.update()`/`PackageService.publish()` would need to call something like `getWebsiteCache().invalidateByTag(...)`, which would require Website to export its cache accessor for Destination/Package to call — a new, narrow exception to "modules don't reach into each other's internals," similar in spirit to how Inventory's (still-inert) supplier bridge was built as an explicit, narrow, documented exception rather than a general rule change.

Recommend starting with option 1 (TTL-only) given current traffic is entirely unverified/unmeasured (per `docs/15`'s Performance finding) — active invalidation adds real complexity and should only be built once TTL-only caching is live and staleness is observed to actually matter in practice.

## Rollout

1. Provision Upstash Redis via Vercel Marketplace, add `REDIS_URL`/`REDIS_TOKEN` to `validateEnv`'s schema (following the exact pattern every other module's config already uses — no new pattern needed).
2. Implement `UpstashWebsiteCache`, register it in `website/module.ts`.
3. Wire TTL-based caching into the four Website services listed above, starting with `GET /api/website/home` (highest-traffic, per `docs/15`'s note that Website is "the highest-read-traffic module by design").
4. Add cache-hit/miss metrics to the existing structured logger (`this.logger.info("cache hit", { key })`) — no new observability infrastructure needed, the logger's JSON shape already supports this.
5. Revisit active invalidation (option 2 above) only if measured staleness becomes a real complaint, not preemptively.

## What This Plan Does Not Cover

- Caching for any non-Website module — per `docs/02`'s own strategy and this session's audit, no other module has a caching need that doesn't directly conflict with "never cache live pricing/availability."
- CDN-level caching of the HTTP responses themselves (Vercel's edge network already does this for static assets; API route caching via `Cache-Control` headers is a separate, smaller decision that can layer on top of this plan without conflicting with it).
