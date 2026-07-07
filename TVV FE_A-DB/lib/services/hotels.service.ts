/**
 * Hotels — read-only client for the public frontend.
 *
 * Backed by the existing `/api/hotels` endpoint (no v1 alias yet — that path
 * is shared with the admin GET handler which is open to anonymous reads).
 */
import { apiClient, ok, fail, paginatedRows, type ServiceResult } from "@/lib/api";
import { ApiError } from "@/lib/api/errors";

export interface PublicHotel {
  id: string;
  name: string;
  shortDescription: string | null;
  longDescription: string | null;
  bannerImage: string | null;
  hotelImages: string[];
  category: "STANDARD" | "DELUXE" | "SUPER_DELUXE" | "PREMIUM" | "LUXURY";
  locationId: string;
  rating: number | null;
  location?: { id: string; name: string; slug: string | null } | null;
}

interface BackendPaginated<T> {
  meta: { total: number; page: number; limit: number };
  data: T[];
}

export interface HotelQuery {
  category?: PublicHotel["category"];
  locationId?: string;
  limit?: number;
}

function buildQs(q: HotelQuery): string {
  const params = new URLSearchParams();
  if (q.category) params.set("category", q.category);
  if (q.locationId) params.set("locationId", q.locationId);
  if (q.limit) params.set("limit", String(q.limit));
  const s = params.toString();
  return s ? `?${s}` : "";
}

export const hotelsService = {
  async list(q: HotelQuery = {}): Promise<ServiceResult<PublicHotel[]>> {
    try {
      const body = await apiClient.get<unknown>(`/hotels${buildQs(q)}`);
      return ok(paginatedRows<PublicHotel>(body), "live");
    } catch (err) {
      return fail<PublicHotel[]>(ApiError.fromUnknown(err), "live");
    }
  },
};

export type HotelsService = typeof hotelsService;
