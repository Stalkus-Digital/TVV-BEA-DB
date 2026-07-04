import type { AppError } from "@/shared/errors";
import type { Result } from "@/shared/types";
import { getWebsiteDestinationService } from "../module";
import type { WebsiteDestinationDetailDTO, WebsiteDestinationSummaryDTO } from "../dto/website-destination.dto";

export async function listWebsiteDestinationsHandler(params: {
  page?: number;
  pageSize?: number;
}): Promise<Result<{ items: WebsiteDestinationSummaryDTO[]; total: number }, AppError>> {
  return getWebsiteDestinationService().listDestinations(params);
}

export async function getWebsiteDestinationDetailHandler(slug: string): Promise<Result<WebsiteDestinationDetailDTO, AppError>> {
  return getWebsiteDestinationService().getDestinationDetail(slug);
}
