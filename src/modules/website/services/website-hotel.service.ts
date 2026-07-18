import { err, isErr, ok, type Result } from "@/shared/types";
import { BaseService, type ServiceContext } from "@/shared/services";
import { NotFoundError, type AppError } from "@/shared/errors";
import { getInventoryService, InventoryStatus, type InventoryItem } from "@/modules/inventory";
import type { HotelItem } from "@/modules/inventory/types/inventory-item";
import { getDestinationService, type Destination } from "@/modules/destination";
import { resolveHotelSlug, toHotelDetail, toHotelSummary } from "../transformers/hotel.transformer";
import type { WebsiteHotelDetailDTO, WebsiteHotelSummaryDTO } from "../dto/website-hotel.dto";

const HOTEL_SCAN_PAGE_SIZE = 500;

function isHotelItem(item: InventoryItem): item is HotelItem {
  return item.kind === "HOTEL";
}

/**
 * Public hotel catalog — ACTIVE inventory hotels only, with roomTypes
 * projected into website DTOs. Never returns DRAFT/ARCHIVED rows.
 */
export class WebsiteHotelService extends BaseService {
  constructor(context: ServiceContext) {
    super(context);
  }

  async listHotels(
    filter: {
      destinationId?: string;
      destinationSlug?: string;
      page?: number;
      pageSize?: number;
    } = {},
  ): Promise<Result<{ items: WebsiteHotelSummaryDTO[]; total: number; page: number; pageSize: number }, AppError>> {
    const page = filter.page ?? 1;
    const pageSize = filter.pageSize ?? 20;

    let destinationId = filter.destinationId;
    if (!destinationId && filter.destinationSlug) {
      const destination = await getDestinationService().getBySlug(filter.destinationSlug);
      if (isErr(destination)) return destination;
      destinationId = destination.value.id;
    }

    const result = await getInventoryService().list({
      kind: "HOTEL",
      page: 1,
      pageSize: HOTEL_SCAN_PAGE_SIZE,
    });
    if (isErr(result)) return result;

    const activeHotels = result.value.items
      .filter(isHotelItem)
      .filter((item) => item.status === InventoryStatus.ACTIVE)
      .filter((item) => (destinationId ? item.destinationId === destinationId : true));

    const start = (page - 1) * pageSize;
    const pageItems = activeHotels.slice(start, start + pageSize);
    const items = await Promise.all(pageItems.map((item) => this.toSummary(item)));
    return ok({ items, total: activeHotels.length, page, pageSize });
  }

  async getHotelBySlug(slug: string): Promise<Result<WebsiteHotelDetailDTO, AppError>> {
    const result = await getInventoryService().list({
      kind: "HOTEL",
      page: 1,
      pageSize: HOTEL_SCAN_PAGE_SIZE,
    });
    if (isErr(result)) return result;

    const match = result.value.items
      .filter(isHotelItem)
      .filter((item) => item.status === InventoryStatus.ACTIVE)
      .find((item) => resolveHotelSlug(item) === slug);

    if (!match) return err(new NotFoundError(`Hotel "${slug}" not found`));

    const destination = await this.tryGetDestination(match.destinationId);
    return ok(toHotelDetail(match, destination));
  }

  private async toSummary(item: HotelItem): Promise<WebsiteHotelSummaryDTO> {
    const destination = await this.tryGetDestination(item.destinationId);
    return toHotelSummary(item, destination);
  }

  private async tryGetDestination(destinationId: string | null): Promise<Destination | null> {
    if (!destinationId) return null;
    const result = await getDestinationService().getById(destinationId);
    return isErr(result) ? null : result.value;
  }
}
