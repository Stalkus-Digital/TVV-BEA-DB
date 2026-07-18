import { isErr, ok, type Result } from "@/shared/types";
import { BaseService, type ServiceContext } from "@/shared/services";
import type { AppError } from "@/shared/errors";
import { getDestinationService } from "@/modules/destination";
import { toDestinationSummary } from "../transformers/destination.transformer";
import type { FooterColumnDTO, MenuItemDTO, NavigationResponseDTO } from "../dto/website-navigation.dto";
import type { QuickLinkDTO } from "../dto/website-homepage.dto";
import { CmsConfigService } from "../services/cms-config.service";

const POPULAR_DESTINATIONS_LIMIT = 8;
const CUSTOM_PAGE_LINKS_KEY = "CUSTOM_PAGE_LINKS";

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

type CustomPageLinks = {
  nav: MenuItemDTO[];
  footer: { label: string; url: string; column: string }[];
};

function parseCustomPageLinks(raw: unknown): CustomPageLinks {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return { nav: [], footer: [] };
  }
  const rec = raw as Record<string, unknown>;
  const nav: MenuItemDTO[] = [];
  if (Array.isArray(rec.nav)) {
    for (const item of rec.nav) {
      if (!item || typeof item !== "object") continue;
      const label = (item as { label?: unknown }).label;
      const url = (item as { url?: unknown }).url;
      if (typeof label === "string" && label.trim() && typeof url === "string" && url.trim()) {
        nav.push({ label: label.trim(), url: url.trim() });
      }
    }
  }
  const footer: CustomPageLinks["footer"] = [];
  if (Array.isArray(rec.footer)) {
    for (const item of rec.footer) {
      if (!item || typeof item !== "object") continue;
      const label = (item as { label?: unknown }).label;
      const url = (item as { url?: unknown }).url;
      const column = (item as { column?: unknown }).column;
      if (typeof label === "string" && label.trim() && typeof url === "string" && url.trim()) {
        footer.push({
          label: label.trim(),
          url: url.trim(),
          column: typeof column === "string" && column.trim() ? column.trim() : "Company",
        });
      }
    }
  }
  return { nav, footer };
}

function mergeFooterCustomLinks(
  columns: FooterColumnDTO[],
  custom: CustomPageLinks["footer"]
): FooterColumnDTO[] {
  if (custom.length === 0) return columns;

  const next = columns.map((col) => ({
    title: col.title,
    links: col.links.map((l) => ({ ...l })),
  }));

  for (const link of custom) {
    let col = next.find((c) => c.title.toLowerCase() === link.column.toLowerCase());
    if (!col) {
      col = { title: link.column, links: [] };
      next.push(col);
    }
    if (!col.links.some((l) => l.url === link.url)) {
      col.links.push({ label: link.label, url: link.url });
    }
  }

  return next;
}

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
    let customNavLinks: MenuItemDTO[] = [];

    const [navConfigRes, footerConfigRes, customLinksRes] = await Promise.all([
      CmsConfigService.getInstance().getConfig("NAVIGATION"),
      CmsConfigService.getInstance().getConfig("FOOTER"),
      CmsConfigService.getInstance().getConfig(CUSTOM_PAGE_LINKS_KEY),
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

    if (!isErr(customLinksRes)) {
      const custom = parseCustomPageLinks(customLinksRes.value);
      customNavLinks = custom.nav;
      footerColumns = mergeFooterCustomLinks(footerColumns, custom.footer);
    }

    return ok({
      menu,
      footer: { columns: footerColumns },
      quickLinks,
      popularDestinations: result.value.items.map(toDestinationSummary),
      customNavLinks,
    });
  }
}
