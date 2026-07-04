import { err, isErr, ok, type Result } from "@/shared/types";
import { BaseService, type ServiceContext } from "@/shared/services";
import { NotFoundError, type AppError } from "@/shared/errors";
import {
  PackageStatus,
  getPackageService,
  getPackagePricingService,
  type Package,
} from "@/modules/package";
import { getDestinationService, type Destination } from "@/modules/destination";
import { toPackageDetail, toPackageSummary } from "../transformers/package.transformer";
import type { WebsitePackageDetailDTO, WebsitePackageSummaryDTO } from "../dto/website-package.dto";
import { WebsiteConfigService } from "./website-config.service";

const DEFAULT_PRICE_PAX = { adults: 2 };
const RELATED_PACKAGES_LIMIT = 4;

/**
 * The one place this module calls Package/Destination Engine — always
 * through their public service accessors (getPackageService(),
 * getDestinationService(), getPackagePricingService()), never a repository.
 * Only PUBLISHED packages are ever visible to the website — draft/archived
 * packages exist for ops but are never returned here.
 */
export class WebsitePackageService extends BaseService {
  constructor(context: ServiceContext) {
    super(context);
  }

  async listPackages(filter: { destinationSlug?: string; page?: number; pageSize?: number } = {}): Promise<
    Result<{ items: WebsitePackageSummaryDTO[]; total: number; page: number; pageSize: number }, AppError>
  > {
    let destinationId: string | undefined;
    if (filter.destinationSlug) {
      const destination = await getDestinationService().getBySlug(filter.destinationSlug);
      if (isErr(destination)) return destination;
      destinationId = destination.value.id;
    }

    const result = await getPackageService().list({
      destinationId,
      status: PackageStatus.PUBLISHED,
      page: filter.page,
      pageSize: filter.pageSize,
    });
    if (isErr(result)) return result;

    const items = await Promise.all(result.value.items.map((pkg) => this.toSummaryDTO(pkg)));

    return ok({ items, total: result.value.total, page: result.value.page, pageSize: result.value.pageSize });
  }

  async getPackageDetail(slug: string): Promise<Result<WebsitePackageDetailDTO, AppError>> {
    const packageResult = await getPackageService().getBySlug(slug);
    if (isErr(packageResult)) return packageResult;
    const pkg = packageResult.value;

    if (pkg.status !== PackageStatus.PUBLISHED) {
      return err(new NotFoundError(`Package "${slug}" not found`));
    }

    const preview = await getPackageService().preview(pkg.id);
    if (isErr(preview)) return preview;

    const destination = await this.tryGetDestination(pkg.destinationId);
    const fromPrice = await this.resolveFromPrice(pkg.id);

    const related = await this.listRelated(pkg);

    const breadcrumbs = destination
      ? [{ id: destination.id, name: destination.name, slug: destination.slug }]
      : [];

    const baseUrl = WebsiteConfigService.getInstance().get("baseUrl");

    return ok(
      toPackageDetail({
        pkg,
        days: preview.value.days,
        pricing: preview.value.pricing,
        destination,
        relatedPackages: related,
        breadcrumbs: breadcrumbs.map((b) => ({ label: b.name, url: `/destination/${b.slug}` })),
        fromPrice,
        baseUrl,
      })
    );
  }

  /**
   * Public — reused by HomepageService and WebsiteSearchService so every
   * package card shown anywhere on the site (homepage, search results,
   * listing) resolves destination name and price consistently, not just
   * the dedicated packages listing.
   */
  async toSummaryDTO(pkg: Package): Promise<WebsitePackageSummaryDTO> {
    const destination = await this.tryGetDestination(pkg.destinationId);
    const pricing = await getPackagePricingService().getByPackage(pkg.id);
    if (isErr(pricing)) {
      return toPackageSummary(pkg, destination, null, null);
    }
    const computed = await getPackagePricingService().compute(pkg.id, DEFAULT_PRICE_PAX);
    const fromPrice = isErr(computed) ? pricing.value.basePrice : computed.value.total;
    return toPackageSummary(pkg, destination, fromPrice, pricing.value.currency);
  }

  private async listRelated(pkg: Package): Promise<WebsitePackageSummaryDTO[]> {
    const result = await getPackageService().list({
      destinationId: pkg.destinationId,
      status: PackageStatus.PUBLISHED,
      pageSize: RELATED_PACKAGES_LIMIT + 1,
    });
    if (isErr(result)) return [];
    const others = result.value.items.filter((p) => p.id !== pkg.id).slice(0, RELATED_PACKAGES_LIMIT);
    return Promise.all(others.map((p) => this.toSummaryDTO(p)));
  }

  private async tryGetDestination(destinationId: string): Promise<Destination | null> {
    const result = await getDestinationService().getById(destinationId);
    return isErr(result) ? null : result.value;
  }

  /** "From" price = live-computed price for 2 adults, falling back to raw basePrice if compute fails, null if no pricing exists at all. */
  private async resolveFromPrice(packageId: string): Promise<number | null> {
    const computed = await getPackagePricingService().compute(packageId, DEFAULT_PRICE_PAX);
    if (!isErr(computed)) return computed.value.total;

    const pricing = await getPackagePricingService().getByPackage(packageId);
    return isErr(pricing) ? null : pricing.value.basePrice;
  }
}
