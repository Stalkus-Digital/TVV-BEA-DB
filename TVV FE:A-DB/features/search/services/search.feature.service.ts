import { fetchUniversalSearch } from "@/lib/api/search";
import { searchService } from "@/lib/services/search.service";

export const searchFeatureService = {
  query(q: string) {
    return searchService.query(q);
  },

  /** Direct API access for TanStack Query hooks (live mode). */
  api: {
    fetchUniversalSearch,
  },
};
