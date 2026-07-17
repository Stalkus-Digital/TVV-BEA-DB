import { err, isErr, ok, type Result } from "@/shared/types";
import { BaseService, type ServiceContext } from "@/shared/services";
import { NotFoundError, ValidationError, type AppError } from "@/shared/errors";
import {
  PackageStatus,
  getPackageService,
  getPackagePricingService,
  type Package,
} from "@/modules/package";
import { getDestinationService, type Destination } from "@/modules/destination";
import { isMarketRootSlug, type MarketRootSlug } from "@/modules/destination/constants/market-roots";
import { toPackageDetail, toPackageSummary } from "../transformers/package.transformer";
import type { WebsitePackageDetailDTO, WebsitePackageSummaryDTO } from "../dto/website-package.dto";
import { WebsiteConfigService } from "./website-config.service";

const DEFAULT_PRICE_PAX = { adults: 2 };
const RELATED_PACKAGES_LIMIT = 4;
const MARKET_ROOT_SCAN_PAGE_SIZE = 500;

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

  async listPackages(
    filter: {
      destinationSlug?: string;
      tripType?: string;
      marketRoot?: string;
      page?: number;
      pageSize?: number;
    } = {}
  ): Promise<Result<{ items: WebsitePackageSummaryDTO[]; total: number; page: number; pageSize: number }, AppError>> {
    const page = filter.page ?? 1;
    const pageSize = filter.pageSize ?? 20;

    let destinationId: string | undefined;
    let marketDestinationIds: Set<string> | null = null;

    if (filter.marketRoot) {
      if (!isMarketRootSlug(filter.marketRoot)) {
        return err(new ValidationError(`marketRoot must be one of: andaman, domestic, international`));
      }
      const ids = await this.collectMarketDestinationIds(filter.marketRoot);
      if (isErr(ids)) return ids;
      marketDestinationIds = ids.value;
    }

    if (filter.destinationSlug) {
      const destination = await getDestinationService().getBySlug(filter.destinationSlug);
      if (isErr(destination)) return destination;
      destinationId = destination.value.id;
      if (marketDestinationIds && !marketDestinationIds.has(destinationId)) {
        return ok({ items: [], total: 0, page, pageSize });
      }
    }

    if (marketDestinationIds && !destinationId) {
      const result = await getPackageService().list({
        tripType: filter.tripType as import("@/modules/package/constants/trip-type").PackageTripType | undefined,
        status: PackageStatus.PUBLISHED,
        page: 1,
        pageSize: MARKET_ROOT_SCAN_PAGE_SIZE,
      });
      if (isErr(result)) return result;

      const filtered = result.value.items.filter((pkg) => marketDestinationIds!.has(pkg.destinationId));
      const start = (page - 1) * pageSize;
      const pageItems = filtered.slice(start, start + pageSize);
      const items = await Promise.all(pageItems.map((pkg) => this.toSummaryDTO(pkg)));
      return ok({ items, total: filtered.length, page, pageSize });
    }

    const result = await getPackageService().list({
      destinationId,
      tripType: filter.tripType as import("@/modules/package/constants/trip-type").PackageTripType | undefined,
      status: PackageStatus.PUBLISHED,
      page,
      pageSize,
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

  /** Destination IDs under a market root (children + nested descendants — not the root itself). */
  private async collectMarketDestinationIds(marketRoot: MarketRootSlug): Promise<Result<Set<string>, AppError>> {
    const root = await getDestinationService().getBySlug(marketRoot);
    if (isErr(root)) return root;

    const ids = new Set<string>();
    const queue = [root.value.id];
    let safety = 0;

    while (queue.length > 0 && safety < 200) {
      safety += 1;
      const parentId = queue.shift()!;
      const children = await getDestinationService().getChildren(parentId);
      if (isErr(children)) return children;
      for (const child of children.value) {
        if (ids.has(child.id)) continue;
        ids.add(child.id);
        queue.push(child.id);
      }
    }

    return ok(ids);
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
