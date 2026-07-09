import { isErr, ok, type Result } from "@/shared/types";
import { BaseService, type ServiceContext } from "@/shared/services";
import type { AppError } from "@/shared/errors";
import { getDestinationService } from "@/modules/destination";
import { toDestinationSummary } from "../transformers/destination.transformer";
import type { FooterColumnDTO, MenuItemDTO, NavigationResponseDTO } from "../dto/website-navigation.dto";
import type { QuickLinkDTO } from "../dto/website-homepage.dto";
import { CmsConfigService } from "../services/cms-config.service";

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

    let menu = STATIC_MENU;
    let footerColumns = STATIC_FOOTER_COLUMNS;
    let quickLinks = STATIC_QUICK_LINKS;

    const [navConfigRes, footerConfigRes] = await Promise.all([
      CmsConfigService.getInstance().getConfig("NAVIGATION"),
      CmsConfigService.getInstance().getConfig("FOOTER")
    ]);

    if (!isErr(navConfigRes) && navConfigRes.value && Array.isArray(navConfigRes.value)) {
      menu = navConfigRes.value;
    }

    if (!isErr(footerConfigRes) && footerConfigRes.value && footerConfigRes.value.columns) {
      footerColumns = footerConfigRes.value.columns;
    }
    if (!isErr(footerConfigRes) && footerConfigRes.value && footerConfigRes.value.quickLinks) {
      quickLinks = footerConfigRes.value.quickLinks;
    }

    return ok({
      menu,
      footer: { columns: footerColumns },
      quickLinks,
      popularDestinations: result.value.items.map(toDestinationSummary),
    });
  }
}
