import { isErr, ok, type Result } from "@/shared/types";
import { BaseService, type ServiceContext } from "@/shared/services";
import type { AppError } from "@/shared/errors";
import { PackageStatus, getPackageService } from "@/modules/package";
import { getDestinationService, type Destination } from "@/modules/destination";
import { isMarketRootSlug } from "@/modules/destination/constants/market-roots";
import { toDestinationDetail, toDestinationSummary } from "../transformers/destination.transformer";
import { toPackageSummary } from "../transformers/package.transformer";
import type { WebsiteDestinationDetailDTO, WebsiteDestinationSummaryDTO } from "../dto/website-destination.dto";
import type { WebsiteDestinationTreeNodeDTO } from "../dto/website-destination-tree.dto";
import { WebsiteConfigService } from "./website-config.service";

const FEATURED_PACKAGES_LIMIT = 6;

export class WebsiteDestinationService extends BaseService {
  constructor(context: ServiceContext) {
    super(context);
  }

  async listDestinations(params: { page?: number; pageSize?: number } = {}): Promise<
    Result<{ items: WebsiteDestinationSummaryDTO[]; total: number }, AppError>
  > {
    const result = await getDestinationService().list(params);
    if (isErr(result)) return result;
    const items = result.value.items
      .filter((destination) => !isMarketRootSlug(destination.slug))
      .map(toDestinationSummary);
    return ok({ items, total: items.length });
  }

  async getDestinationTree(): Promise<Result<WebsiteDestinationTreeNodeDTO[], AppError>> {
    const [rootsResult, allResult] = await Promise.all([
      getDestinationService().listMarketRoots(),
      getDestinationService().list({ pageSize: 500 }),
    ]);
    if (isErr(rootsResult)) return rootsResult;
    if (isErr(allResult)) return allResult;

    const destinations = allResult.value.items;
    const byParent = new Map<string | null, Destination[]>();
    for (const destination of destinations) {
      const key = destination.parentDestinationId;
      const bucket = byParent.get(key) ?? [];
      bucket.push(destination);
      byParent.set(key, bucket);
    }

    const buildNode = (destination: Destination): WebsiteDestinationTreeNodeDTO => ({
      id: destination.id,
      slug: destination.slug,
      name: destination.name,
      children: (byParent.get(destination.id) ?? []).map(buildNode),
    });

    return ok(rootsResult.value.map(buildNode));
  }

  async getDestinationDetail(slug: string): Promise<Result<WebsiteDestinationDetailDTO, AppError>> {
    const destinationResult = await getDestinationService().getBySlug(slug);
    if (isErr(destinationResult)) return destinationResult;
    const destination = destinationResult.value;

    const [featuredPackages, nearby, breadcrumbs] = await Promise.all([
      this.listFeaturedPackagesFor(destination),
      this.listNearby(destination.id),
      this.getBreadcrumbs(destination.id),
    ]);

    const baseUrl = WebsiteConfigService.getInstance().get("baseUrl");

    return ok(
      toDestinationDetail({
        destination,
        featuredPackages,
        nearbyDestinations: nearby,
        breadcrumbs,
        baseUrl,
      })
    );
  }

  private async listFeaturedPackagesFor(destination: Destination) {
    const result = await getPackageService().list({
      destinationId: destination.id,
      status: PackageStatus.PUBLISHED,
      pageSize: FEATURED_PACKAGES_LIMIT,
    });
    if (isErr(result)) return [];
    return result.value.items.map((pkg) => toPackageSummary(pkg, destination, null, null));
  }

  private async listNearby(destinationId: string): Promise<Destination[]> {
    const result = await getDestinationService().getNearby(destinationId);
    return isErr(result) ? [] : result.value;
  }

  private async getBreadcrumbs(destinationId: string) {
    const result = await getDestinationService().getBreadcrumbs(destinationId);
    return isErr(result) ? [] : result.value;
  }
}
