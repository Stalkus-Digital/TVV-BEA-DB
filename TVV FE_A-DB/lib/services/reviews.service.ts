import { apiConfig, ok, fail, type ServiceResult } from "@/lib/api";
import { ApiError } from "@/lib/api/errors";
import type { Review } from "@/lib/models";
import { reviewsMock, trustStatsMock } from "@/lib/mock";

export const reviewsService = {
  async list(limit?: number): Promise<ServiceResult<Review[]>> {
    if (apiConfig.useMock) return ok(limit ? reviewsMock.slice(0, limit) : reviewsMock, "mock");
    return fail<Review[]>(ApiError.notImplemented("Reviews"), "live");
  },

  async forTour(_tourSlug: string, limit = 3): Promise<ServiceResult<Review[]>> {
    if (apiConfig.useMock) return ok(reviewsMock.slice(0, limit), "mock");
    return fail<Review[]>(ApiError.notImplemented("Reviews"), "live");
  },

  async trustStats() {
    return ok(trustStatsMock, apiConfig.useMock ? "mock" : "live");
  },
};

export type ReviewsService = typeof reviewsService;
