import type { MetadataRoute } from "next";
import { apiConfig } from "@/lib/api";
import { fetchDestinations } from "@/lib/api/destinations";
import { fetchPackages } from "@/lib/api/packages";
import { SITE } from "@/lib/seo";

/**
 * Sitemap — Travel OS slugs in live mode; mock catalog when
 * `NEXT_PUBLIC_USE_MOCK=true`.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const staticRoutes: { path: string; priority: number; freq: MetadataRoute.Sitemap[number]["changeFrequency"] }[] = [
    { path: "", priority: 1.0, freq: "daily" },
    { path: "/andaman", priority: 0.95, freq: "weekly" },
    { path: "/packages/domestic", priority: 0.85, freq: "weekly" },
    { path: "/packages/international", priority: 0.85, freq: "weekly" },
    { path: "/honeymoon", priority: 0.85, freq: "weekly" },
    { path: "/luxury", priority: 0.85, freq: "weekly" },
    { path: "/ferry", priority: 0.85, freq: "weekly" },
    { path: "/flights", priority: 0.8, freq: "weekly" },
    { path: "/calculator", priority: 0.7, freq: "weekly" },
    { path: "/experiences", priority: 0.85, freq: "weekly" },
    { path: "/guides", priority: 0.8, freq: "weekly" },
    { path: "/corporate", priority: 0.65, freq: "monthly" },
    { path: "/about", priority: 0.6, freq: "monthly" },
    { path: "/contact", priority: 0.65, freq: "monthly" },
    { path: "/faq", priority: 0.55, freq: "monthly" },
    { path: "/privacy", priority: 0.3, freq: "yearly" },
    { path: "/terms", priority: 0.3, freq: "yearly" },
  ];

  const items: MetadataRoute.Sitemap = staticRoutes.map((r) => ({
    url: `${SITE.url}${r.path}`,
    lastModified: now,
    changeFrequency: r.freq,
    priority: r.priority,
  }));

  const packageSlugs = new Set<string>();
  const destinationSlugs = new Set<string>();

  if (!apiConfig.useMock) {
    try {
      const packages = await fetchPackages({ limit: "500" });
      packages.forEach((p) => packageSlugs.add(p.slug));
    } catch {
      // Build without package URLs if Travel OS is down.
    }
    try {
      const destinations = await fetchDestinations();
      destinations.forEach((d) => {
        if (d.slug !== "andaman") destinationSlugs.add(d.slug);
      });
    } catch {
      // Same for destinations.
    }
  } else {
    const [
      { manualPackages, destinationsMock, experiencesMock, guidesMock, ferryRoutesMock },
      { fromManualList },
    ] = await Promise.all([import("@/lib/mock"), import("@/lib/adapters")]);

    fromManualList(manualPackages).forEach((p) => packageSlugs.add(p.slug));
    destinationsMock.filter((d) => d.slug !== "andaman").forEach((d) => destinationSlugs.add(d.slug));

    for (const e of experiencesMock) {
      items.push({
        url: `${SITE.url}/experiences/${e.slug}`,
        lastModified: now,
        changeFrequency: "weekly",
        priority: 0.7,
      });
    }

    for (const g of guidesMock) {
      items.push({
        url: `${SITE.url}/guides/${g.slug}`,
        lastModified: new Date(g.publishedAt),
        changeFrequency: "monthly",
        priority: 0.7,
      });
    }

    for (const r of ferryRoutesMock) {
      items.push({
        url: `${SITE.url}/ferry/${r.slug}`,
        lastModified: now,
        changeFrequency: "weekly",
        priority: r.popular ? 0.78 : 0.6,
      });
    }
  }

  for (const slug of packageSlugs) {
    items.push({
      url: `${SITE.url}/packages/${slug}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.85,
    });
  }

  for (const slug of destinationSlugs) {
    items.push({
      url: `${SITE.url}/destinations/${slug}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.75,
    });
  }

  return items;
}
