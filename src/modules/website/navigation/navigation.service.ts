import { isErr, ok, type Result } from "@/shared/types";
import { BaseService, type ServiceContext } from "@/shared/services";
import type { AppError } from "@/shared/errors";
import { getDestinationService } from "@/modules/destination";
import { toDestinationSummary } from "../transformers/destination.transformer";
import type { FooterColumnDTO, MenuItemDTO, NavigationResponseDTO } from "../dto/website-navigation.dto";
import type { QuickLinkDTO } from "../dto/website-homepage.dto";

const POPULAR_DESTINATIONS_LIMIT = 8;

/** Static menu/footer shell — no CMS (Sprint 9) to author them from yet; popularDestinations is the one dynamic piece. */
const STATIC_MENU: MenuItemDTO[] = [
  { label: "Home", url: "/" },
  { label: "Packages", url: "/packages" },
  { label: "Destinations", url: "/destinations" },
  { label: "Contact", url: "/contact" },
];

const STATIC_FOOTER_COLUMNS: FooterColumnDTO[] = [
  {
    title: "Company",
    links: [
      { label: "About Us", url: "/about" },
      { label: "Contact", url: "/contact" },
    ],
  },
  {
    title: "Explore",
    links: [
      { label: "Holiday Packages", url: "/packages" },
      { label: "Destinations", url: "/destinations" },
    ],
  },
];

const STATIC_QUICK_LINKS: QuickLinkDTO[] = [
  { label: "Holiday Packages", url: "/packages" },
  { label: "Destinations", url: "/destinations" },
];

export class NavigationService extends BaseService {
  constructor(context: ServiceContext) {
    super(context);
  }

  async getNavigation(): Promise<Result<NavigationResponseDTO, AppError>> {
    const result = await getDestinationService().list({ pageSize: POPULAR_DESTINATIONS_LIMIT });
    if (isErr(result)) return result;

    return ok({
      menu: STATIC_MENU,
      footer: { columns: STATIC_FOOTER_COLUMNS },
      quickLinks: STATIC_QUICK_LINKS,
      popularDestinations: result.value.items.map(toDestinationSummary),
    });
  }
}
