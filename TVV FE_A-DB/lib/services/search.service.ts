/**
 * Universal search service.
 *
 * Mock mode filters local catalog data. Live mode delegates to `lib/api/search`.
 */

import { apiConfig, ok, type ServiceResult } from "@/lib/api";
import { fetchUniversalSearch } from "@/lib/api/search";
import { ApiError } from "@/lib/api/errors";
import type { Destination, Guide, Package } from "@/lib/models";
import { destinationsService } from "./destinations.service";
import { guidesService } from "./guides.service";
import { packagesService } from "./packages.service";

export interface SearchResults {
  query: string;
  packages: Package[];
  destinations: Destination[];
  guides: Guide[];
  totalCount: number;
}

function matches(haystack: string, needle: string): boolean {
  return haystack.toLowerCase().includes(needle);
}

export const searchService = {
  async query(q: string): Promise<ServiceResult<SearchResults>> {
    const trimmed = q.trim();
    if (!trimmed) {
      return ok({ query: trimmed, packages: [], destinations: [], guides: [], totalCount: 0 }, "mock");
    }

    if (!apiConfig.useMock) {
      try {
        const results = await fetchUniversalSearch({ q: trimmed });
        return ok(results, "live");
      } catch (err) {
        return { ok: false, error: ApiError.fromUnknown(err), meta: { source: "live", fetchedAt: new Date().toISOString() } };
      }
    }

    const needle = trimmed.toLowerCase();

    const [pkgs, dests, guides] = await Promise.all([
      packagesService.list(),
      destinationsService.list(),
      guidesService.list(),
    ]);

    const packages = pkgs.ok
      ? pkgs.data.filter((p) =>
          matches(
            `${p.title} ${p.subtitle ?? ""} ${p.destination} ${(p.themes ?? []).join(" ")}`,
            needle,
          ),
        ).slice(0, 6)
      : [];

    const destinations = dests.ok
      ? dests.data.filter((d) => matches(`${d.name} ${d.tagline} ${d.continent ?? ""}`, needle)).slice(0, 4)
      : [];

    const guideMatches = guides.ok
      ? guides.data.filter((g) => matches(`${g.title} ${g.excerpt} ${g.category} ${(g.tags ?? []).join(" ")}`, needle)).slice(0, 3)
      : [];

    return ok(
      {
        query: trimmed,
        packages,
        destinations,
        guides: guideMatches,
        totalCount: packages.length + destinations.length + guideMatches.length,
      },
      "mock",
    );
  },
};

export type SearchService = typeof searchService;
