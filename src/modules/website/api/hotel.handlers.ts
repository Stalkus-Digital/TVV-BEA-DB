import type { AppError } from "@/shared/errors";
import type { Result } from "@/shared/types";
import { getWebsiteHotelService } from "../module";
import type { WebsiteHotelDetailDTO, WebsiteHotelSummaryDTO } from "../dto/website-hotel.dto";

export async function listWebsiteHotelsHandler(filter: {
  destinationId?: string;
  destinationSlug?: string;
  page?: number;
  pageSize?: number;
}): Promise<Result<{ items: WebsiteHotelSummaryDTO[]; total: number; page: number; pageSize: number }, AppError>> {
  return getWebsiteHotelService().listHotels(filter);
}

export async function getWebsiteHotelDetailHandler(slug: string): Promise<Result<WebsiteHotelDetailDTO, AppError>> {
  return getWebsiteHotelService().getHotelBySlug(slug);
}
