import type { AppError } from "@/shared/errors";
import type { Result } from "@/shared/types";
import { getWebsiteSearchService } from "../module";
import type { WebsiteSearchResultDTO } from "../dto/website-search.dto";

export async function searchWebsitePackagesHandler(query: unknown): Promise<Result<WebsiteSearchResultDTO, AppError>> {
  return getWebsiteSearchService().search(query);
}
