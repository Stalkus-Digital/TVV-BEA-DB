import { isErr, ok, type Result } from "@/shared/types";
import { BaseService, type ServiceContext } from "@/shared/services";
import type { AppError } from "@/shared/errors";
import { PackageStatus, getPackageService } from "@/modules/package";
import { getDestinationService } from "@/modules/destination";
import { toDestinationSummary } from "../transformers/destination.transformer";
import { buildSeoDTO } from "../seo/seo-builder";
import type { HeroBannerDTO, HomepageResponseDTO, QuickLinkDTO } from "../dto/website-homepage.dto";
import type { WebsitePackageService } from "../services/website-package.service";
import { WebsiteConfigService } from "../services/website-config.service";
import { CmsConfigService } from "../services/cms-config.service";
import { heroBannerFromSections, resolveHomeSections } from "./home-sections";

const FEATURED_LIMIT = 6;
const LATEST_LIMIT = 8;
const POPULAR_DESTINATIONS_LIMIT = 6;

const STATIC_HERO_BANNER: HeroBannerDTO = {
  headline: "Discover Your Next Adventure",
  subheadline: "Handpicked holiday packages across India's most beautiful destinations",
  backgroundImage: null,
  ctaLabel: "Explore Packages",
  ctaUrl: "/packages",
};

const STATIC_QUICK_LINKS: QuickLinkDTO[] = [
  { label: "Holiday Packages", url: "/packages" },
  { label: "Destinations", url: "/destinations" },
  { label: "Contact Us", url: "/contact" },
];

export class HomepageService extends BaseService {
  constructor(
    context: ServiceContext,
    private readonly websitePackages: WebsitePackageService
  ) {
    super(context);
  }

  async getHomepage(): Promise<Result<HomepageResponseDTO, AppError>> {
    const [featuredPackagesResult, featuredDestinationsResult, latestPackagesResult] = await Promise.all([
      getPackageService().list({ status: PackageStatus.PUBLISHED, pageSize: FEATURED_LIMIT }),
      getDestinationService().listFeatured(),
      getPackageService().list({ status: PackageStatus.PUBLISHED, pageSize: LATEST_LIMIT }),
    ]);

    if (isErr(featuredPackagesResult)) return featuredPackagesResult;
    if (isErr(featuredDestinationsResult)) return featuredDestinationsResult;
    if (isErr(latestPackagesResult)) return latestPackagesResult;

    const featuredPackages = await Promise.all(
      featuredPackagesResult.value.items.map((pkg) => this.websitePackages.toSummaryDTO(pkg))
    );
    const featuredDestinations = featuredDestinationsResult.value.map(toDestinationSummary);
    const latestPackages = await Promise.all(
      [...latestPackagesResult.value.items]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, LATEST_LIMIT)
        .map((pkg) => this.websitePackages.toSummaryDTO(pkg))
    );

    const popularResult = await getDestinationService().list({ pageSize: POPULAR_DESTINATIONS_LIMIT });
    const popularDestinations = isErr(popularResult) ? [] : popularResult.value.items.map(toDestinationSummary);

    const baseUrl = WebsiteConfigService.getInstance().get("baseUrl");
    const seo = buildSeoDTO(
      baseUrl,
      {},
      {
        title: "The Vacation Voice — Holiday Packages & Destinations",
        description: "Discover handpicked holiday packages and destinations across India.",
        path: "/",
      }
    );

    const cmsConfigResult = await CmsConfigService.getInstance().getConfig("HOME_SECTIONS");
    const config = !isErr(cmsConfigResult) ? cmsConfigResult.value : null;
    const { sections, heroBanner: storedBanner, quickLinks: storedLinks } = resolveHomeSections(config);

    const heroBanner =
      storedBanner ?? heroBannerFromSections(sections, STATIC_HERO_BANNER);
    const quickLinks = storedLinks ?? STATIC_QUICK_LINKS;

    return ok({
      sections,
      heroBanner,
      featuredPackages,
      featuredDestinations,
      popularDestinations,
      latestPackages,
      quickLinks,
      seo,
    });
  }
}
