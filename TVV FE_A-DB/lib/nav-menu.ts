/**
 * Server-side builder for the primary nav mega menu.
 *
 * Runs at request time on the Layout (no client component should import this).
 * Merges the static skeleton in `nav-data.ts` with live data:
 *
 *   • Andaman → curated picks from Travel OS packages (client-filtered by region)
 *   • Andaman → "By duration" links honour ?duration=… buckets
 *   • Andaman → "By experience" links honour ?theme=… filters
 *   • Domestic / International → destination columns from `/api/website/destinations`
 *
 * Falls back to the static nav-data shape if the API is unreachable so the
 * site never goes down because of a broken endpoint.
 */
import { destinationsService } from "@/lib/services/destinations.service";
import { packagesService } from "@/lib/services/packages.service";
import { formatINR } from "@/lib/utils";
import { navGroups, type NavGroup, type MegaPick } from "@/components/layout/nav-data";

export async function buildNavGroups(): Promise<NavGroup[]> {
  const [destsRes, andamanPkgsRes] = await Promise.all([
    destinationsService.list({ limit: 200 }),
    packagesService.list({ region: "andaman", sort: "relevant", limit: 6 }),
  ]);

  const dests = destsRes.ok ? destsRes.data : [];
  const andamanPkgs = andamanPkgsRes.ok ? andamanPkgsRes.data : [];

  // ─── Andaman curated picks: 3 most recent published Andaman packages ──────
  const picks: MegaPick[] = andamanPkgs.slice(0, 3).map((p) => ({
    label: p.title,
    href: `/packages/${p.slug}`,
    priceFrom: p.pricing.perAdult > 0 ? formatINR(p.pricing.perAdult) : "On request",
    image: p.hero.image || "",
  }));

  // ─── Group destinations by region for Domestic / International columns ────
  const byRegion = {
    andaman: dests.filter((d) => d.region === "andaman"),
    domestic: dests.filter((d) => d.region === "domestic"),
    international: dests.filter((d) => d.region === "international"),
  };

  // Static skeleton: clone so we don't mutate the module-level constant.
  const groups: NavGroup[] = JSON.parse(JSON.stringify(navGroups));

  for (const g of groups) {
    if (g.label === "Andaman" && g.mega) {
      if (picks.length > 0) g.mega.picks = picks;
      // "By experience" — link to filtered Andaman package listing.
      const byExperienceCol = g.mega.columns.find((c) => c.title === "By experience");
      if (byExperienceCol) {
        byExperienceCol.links = [
          { label: "Honeymoon escapes", href: "/packages/domestic/andaman?theme=honeymoon" },
          { label: "Scuba & diving", href: "/packages/domestic/andaman?theme=scuba" },
          { label: "Island hopping", href: "/packages/domestic/andaman?theme=island-hopping" },
          { label: "Family journeys", href: "/packages/domestic/andaman?theme=family" },
        ];
      }
      // Strip the "Makruzz · Green Ocean" sub-line from the Ferry booking link.
      const planCol = g.mega.columns.find((c) => c.title === "Plan your islands");
      if (planCol) {
        const ferry = planCol.links.find((l) => l.label === "Ferry booking");
        if (ferry) delete ferry.meta;
      }
    }

    if (g.label === "Domestic" && g.mega) {
      const col = g.mega.columns.find((c) => c.title === "Popular destinations");
      if (col && byRegion.domestic.length > 0) {
        const links = byRegion.domestic
          .slice(0, 8)
          .map((d) => ({ label: d.name, href: `/destinations/${d.slug}` }));
        // Keep Andaman as a special pin at the end (links to the authority hub).
        links.push({ label: "Andaman", href: "/andaman" });
        col.links = links;
      }
    }

    if (g.label === "International" && g.mega) {
      const col = g.mega.columns.find((c) => c.title === "Popular destinations");
      if (col && byRegion.international.length > 0) {
        col.links = byRegion.international
          .slice(0, 8)
          .map((d) => ({ label: d.name, href: `/destinations/${d.slug}` }));
      }
    }
  }

  return groups;
}
