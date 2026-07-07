import { apiConfig, ok, fail, type ServiceResult } from "@/lib/api";
import { ApiError } from "@/lib/api/errors";
import type { AndamanTileItem, Guide, Reel } from "@/lib/models";
import { andamanSpotlightMock, guidesMock, reelsMock } from "@/lib/mock";

interface GuideQuery {
  category?: string;
  tag?: string;
  limit?: number;
}

function apply(list: Guide[], q: GuideQuery): Guide[] {
  let out = list;
  if (q.category) out = out.filter((g) => g.category.toLowerCase() === q.category!.toLowerCase());
  if (q.tag) out = out.filter((g) => g.tags?.includes(q.tag!.toLowerCase()));
  return q.limit ? out.slice(0, q.limit) : out;
}

export const guidesService = {
  async list(q: GuideQuery = {}): Promise<ServiceResult<Guide[]>> {
    if (apiConfig.useMock) return ok(apply(guidesMock, q), "mock");
    return fail<Guide[]>(ApiError.notImplemented("Guides"), "live");
  },

  async getBySlug(slug: string): Promise<ServiceResult<Guide | null>> {
    if (apiConfig.useMock) return ok(guidesMock.find((g) => g.slug === slug) ?? null, "mock");
    return fail<Guide | null>(ApiError.notImplemented("Guides"), "live");
  },

  async reels(limit?: number): Promise<ServiceResult<Reel[]>> {
    if (apiConfig.useMock) {
      const list = limit ? reelsMock.slice(0, limit) : reelsMock;
      return ok(list, "mock");
    }
    return fail<Reel[]>(ApiError.notImplemented("Reels"), "live");
  },

  async andamanSpotlight(): Promise<ServiceResult<AndamanTileItem[]>> {
    return ok(andamanSpotlightMock, apiConfig.useMock ? "mock" : "live");
  },
};

export type GuidesService = typeof guidesService;
