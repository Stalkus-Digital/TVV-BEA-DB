import { err, isErr, ok, type Result } from "@/shared/types";
import { BaseService, type ServiceContext } from "@/shared/services";
import { ValidationError, type AppError } from "@/shared/errors";
import { PackageStatus, getPackageService, getPackagePricingService, type Package } from "@/modules/package";
import { getDestinationService } from "@/modules/destination";
import type { WebsitePackageService } from "../services/website-package.service";
import type { WebsiteSearchQuery, WebsiteSearchResultDTO } from "../dto/website-search.dto";

/**
 * A simple, in-process filter over Package Engine's own list() — NOT the
 * dedicated "Search Engine" reserved in CLAUDE.md's Future Engine Modules
 * section (still unscheduled). That future module would own a real search
 * index; this is a straightforward filter suitable for the current
 * in-memory data volume, kept intentionally simple rather than pretending
 * to be more than it is.
 */
export class WebsiteSearchService extends BaseService {
  constructor(
    context: ServiceContext,
    private readonly websitePackages: WebsitePackageService
  ) {
    super(context);
  }

  async search(input: unknown): Promise<Result<WebsiteSearchResultDTO, AppError>> {
    const validated = this.validateQuery(input);
    if (isErr(validated)) return validated;
    const query = validated.value;

    let destinationId: string | undefined;
    if (query.destinationSlug) {
      const destination = await getDestinationService().getBySlug(query.destinationSlug);
      if (isErr(destination)) return destination;
      destinationId = destination.value.id;
    }

    // "Category" has no field on Package itself — resolved via the
    // destinations that belong to the category, since Destination does
    // have categoryIds. Honest interpretation, not a fabricated filter.
    let categoryDestinationIds: Set<string> | null = null;
    if (query.categoryId) {
      const destinations = await getDestinationService().list({ categoryId: query.categoryId, pageSize: 200 });
      if (isErr(destinations)) return destinations;
      categoryDestinationIds = new Set(destinations.value.items.map((d) => d.id));
    }

    const candidates = await getPackageService().list({
      destinationId,
      tripType: query.tripType as import("@/modules/package/constants/trip-type").PackageTripType | undefined,
      status: PackageStatus.PUBLISHED,
      sourceType: query.packageType as never,
      pageSize: 200,
    });
    if (isErr(candidates)) return candidates;

    let filtered = candidates.value.items;

    if (categoryDestinationIds) {
      filtered = filtered.filter((pkg) => categoryDestinationIds!.has(pkg.destinationId));
    }
    if (query.keyword) {
      const keyword = query.keyword.toLowerCase();
      filtered = filtered.filter((pkg) => pkg.title.toLowerCase().includes(keyword));
    }
    if (query.minDurationDays !== undefined) {
      filtered = filtered.filter((pkg) => pkg.durationDays >= query.minDurationDays!);
    }
    if (query.maxDurationDays !== undefined) {
      filtered = filtered.filter((pkg) => pkg.durationDays <= query.maxDurationDays!);
    }

    if (query.minPrice !== undefined || query.maxPrice !== undefined) {
      filtered = await this.filterByPrice(filtered, query.minPrice, query.maxPrice);
    }

    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;
    const start = (page - 1) * pageSize;
    const pageItems = filtered.slice(start, start + pageSize);

    // toSummaryDTO resolves destination name + live price per package — the
    // same enrichment path used everywhere else a package card is shown,
    // so search results are never displayed with a missing price.
    const results = await Promise.all(pageItems.map((pkg) => this.websitePackages.toSummaryDTO(pkg)));

    return ok({ results, total: filtered.length, page, pageSize });
  }

  private async filterByPrice(packages: Package[], min: number | undefined, max: number | undefined): Promise<Package[]> {
    const kept: Package[] = [];
    for (const pkg of packages) {
      const pricing = await getPackagePricingService().getByPackage(pkg.id);
      if (isErr(pricing)) continue;
      const price = pricing.value.basePrice;
      if (min !== undefined && price < min) continue;
      if (max !== undefined && price > max) continue;
      kept.push(pkg);
    }
    return kept;
  }

  private validateQuery(input: unknown): Result<WebsiteSearchQuery, ValidationError> {
    if (typeof input !== "object" || input === null) return err(new ValidationError("Query must be an object"));
    const q = input as Record<string, unknown>;
    for (const field of ["minDurationDays", "maxDurationDays", "minPrice", "maxPrice", "page", "pageSize"]) {
      if (q[field] !== undefined && typeof q[field] !== "number") {
        return err(new ValidationError(`${field} must be a number`));
      }
    }
    return ok(q as WebsiteSearchQuery);
  }
}
