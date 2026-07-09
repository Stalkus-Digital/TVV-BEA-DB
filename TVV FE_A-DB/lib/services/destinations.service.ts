import { fromApiDestination } from "@/lib/adapters/publicApi";
import { apiConfig, ok, fail, type ServiceResult } from "@/lib/api";
import { fetchDestinationBySlug, fetchDestinations, fetchFeaturedDestinations } from "@/lib/api/destinations";
import { ApiError } from "@/lib/api/errors";
import type { Destination, Region } from "@/lib/models";


interface DestinationQuery {
  region?: Region;
  continent?: string;
  authorityOnly?: boolean;
  limit?: number;
}

function applyQuery(list: Destination[], q: DestinationQuery): Destination[] {
  let out = list;
  if (q.region) out = out.filter((d) => d.region === q.region);
  if (q.continent) out = out.filter((d) => d.continent === q.continent);
  if (q.authorityOnly) out = out.filter((d) => d.isAuthorityHub);
  return q.limit ? out.slice(0, q.limit) : out;
}

export const destinationsService = {
  async list(q: DestinationQuery = {}): Promise<ServiceResult<Destination[]>> {
    try {
      const rows = await fetchDestinations();
      const mapped = rows.map((row) => fromApiDestination(row));
      return ok(applyQuery(mapped, q), "live");
    } catch (err) {
      return fail<Destination[]>(ApiError.fromUnknown(err), "live");
    }
  },

  async getBySlug(slug: string): Promise<ServiceResult<Destination | null>> {
    try {
      const raw = await fetchDestinationBySlug(slug);
      return ok(raw ? fromApiDestination(raw) : null, "live");
    } catch (err) {
      return fail<Destination | null>(ApiError.fromUnknown(err), "live");
    }
  },

  /** Frequently used: render-ordered destinations for the homepage tabs. */
  async homepageShelf(): Promise<ServiceResult<Destination[]>> {
    try {
      const rows = await fetchFeaturedDestinations();
      const mapped = rows.map((row) => fromApiDestination(row));
      return ok(mapped.slice(0, 8), "live");
    } catch (err) {
      return fail<Destination[]>(ApiError.fromUnknown(err), "live");
    }
  },
};

export type DestinationsService = typeof destinationsService;
