import { apiConfig, ok, fail, type ServiceResult } from "@/lib/api";
import { ApiError } from "@/lib/api/errors";
import type { FAQ } from "@/lib/models";
import { faqsMock } from "@/lib/mock";

interface FaqQuery {
  category?: string;
  tag?: string;
  limit?: number;
}

function apply(list: FAQ[], q: FaqQuery): FAQ[] {
  let out = list;
  if (q.category) out = out.filter((f) => f.category === q.category);
  if (q.tag) out = out.filter((f) => f.tags?.includes(q.tag!));
  return q.limit ? out.slice(0, q.limit) : out;
}

export const faqsService = {
  async list(q: FaqQuery = {}): Promise<ServiceResult<FAQ[]>> {
    if (apiConfig.useMock) return ok(apply(faqsMock, q), "mock");
    return fail<FAQ[]>(ApiError.notImplemented("FAQs"), "live");
  },
};

export type FaqsService = typeof faqsService;
