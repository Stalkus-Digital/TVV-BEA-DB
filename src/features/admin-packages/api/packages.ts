import { adminApiClient } from "@/lib/admin-api/client";
import { adminEndpoints } from "@/lib/admin-api/endpoints";
import type { PaginatedResult } from "@/lib/admin-api/types";
import { DEFAULT_LIST_COMPUTE_PAX } from "../constants";
import type {
  CreateAvailabilityInput,
  CreateDayInput,
  CreateItemInput,
  CreatePackageInput,
  Package,
  PackageAvailability,
  PackageDay,
  PackageItem,
  PackageListFilters,
  PackagePreview,
  PackagePricing,
  PackageRule,
  PackageVersion,
  PriceComputeResult,
  UpdatePackageInput,
  UpsertPricingInput,
  UpsertRulesInput,
} from "../types";

function packagePath(id: string) {
  return `${adminEndpoints.packages}/${id}`;
}

export async function fetchPackages(filters: PackageListFilters = {}): Promise<PaginatedResult<Package>> {
  const result = await adminApiClient.get<PaginatedResult<Package>>(adminEndpoints.packages, {
    params: {
      status: filters.status,
      destinationId: filters.destinationId,
      sourceType: filters.sourceType,
      page: filters.page ?? 1,
      pageSize: filters.pageSize ?? 20,
    },
  });
  if (!result) {
    return { items: [], page: 1, pageSize: filters.pageSize ?? 20, total: 0, totalPages: 1 };
  }
  return result;
}

export async function fetchAllPackages(
  filters: Pick<PackageListFilters, "status" | "destinationId" | "sourceType"> = {}
): Promise<Package[]> {
  const pageSize = 20;
  let page = 1;
  let totalPages = 1;
  const items: Package[] = [];

  while (page <= totalPages) {
    const result = await fetchPackages({ ...filters, page, pageSize });
    items.push(...result.items);
    totalPages = result.totalPages;
    page += 1;
  }

  return items;
}

export async function fetchPackage(id: string): Promise<Package> {
  const result = await adminApiClient.get<Package>(packagePath(id));
  if (!result) throw new Error("Package not found");
  return result;
}

export async function createPackage(input: CreatePackageInput): Promise<Package> {
  const result = await adminApiClient.post<Package>(adminEndpoints.packages, input);
  if (!result) throw new Error("Failed to create package");
  return result;
}

export async function createFullPackage(input: any): Promise<Package> {
  const result = await adminApiClient.post<Package>(`${adminEndpoints.packages}/full`, input);
  if (!result) throw new Error("Failed to save full package");
  return result;
}

export async function updateFullPackage(id: string, input: any): Promise<Package> {
  const result = await adminApiClient.put<Package>(`${adminEndpoints.packages}/full/${id}`, input);
  if (!result) throw new Error("Failed to update full package");
  return result;
}

export async function updatePackage(id: string, input: UpdatePackageInput): Promise<Package> {
  const result = await adminApiClient.patch<Package>(packagePath(id), input);
  if (!result) throw new Error("Failed to update package");
  return result;
}

export async function archivePackage(id: string): Promise<Package> {
  const result = await adminApiClient.delete<Package>(packagePath(id));
  if (!result) throw new Error("Failed to archive package");
  return result;
}

export async function publishPackage(id: string, changeNote?: string): Promise<Package> {
  const result = await adminApiClient.post<Package>(`${packagePath(id)}/publish`, { changeNote: changeNote ?? null });
  if (!result) throw new Error("Failed to publish package");
  return result;
}

export async function fetchPackagePreview(id: string): Promise<PackagePreview> {
  const result = await adminApiClient.get<PackagePreview>(`${packagePath(id)}/preview`);
  if (!result) throw new Error("Failed to load package preview");
  return result;
}

export async function fetchPackagePricing(id: string): Promise<PackagePricing | null> {
  const result = await adminApiClient.get<PackagePricing>(`${packagePath(id)}/pricing`);
  return result;
}

export async function upsertPackagePricing(id: string, input: UpsertPricingInput): Promise<PackagePricing> {
  const result = await adminApiClient.put<PackagePricing>(`${packagePath(id)}/pricing`, input);
  if (!result) throw new Error("Failed to save pricing");
  return result;
}

export async function computePackagePrice(
  id: string,
  body: { adults: number; children?: { age: number }[]; infants?: number; date?: string } = DEFAULT_LIST_COMPUTE_PAX
): Promise<PriceComputeResult> {
  const result = await adminApiClient.post<PriceComputeResult>(`${packagePath(id)}/pricing/compute`, body);
  if (!result) throw new Error("Failed to compute price");
  return result;
}

export async function fetchPackageRules(id: string): Promise<PackageRule | null> {
  const result = await adminApiClient.get<PackageRule>(`${packagePath(id)}/rules`);
  return result;
}

export async function upsertPackageRules(id: string, input: UpsertRulesInput): Promise<PackageRule> {
  const result = await adminApiClient.put<PackageRule>(`${packagePath(id)}/rules`, input);
  if (!result) throw new Error("Failed to save rules");
  return result;
}

export async function fetchPackageAvailability(id: string): Promise<PackageAvailability[]> {
  const result = await adminApiClient.get<PackageAvailability[]>(`${packagePath(id)}/availability`);
  return result ?? [];
}

export async function addPackageAvailability(id: string, input: CreateAvailabilityInput): Promise<PackageAvailability> {
  const result = await adminApiClient.post<PackageAvailability>(`${packagePath(id)}/availability`, input);
  if (!result) throw new Error("Failed to add availability window");
  return result;
}

export async function fetchPackageDays(id: string): Promise<PackageDay[]> {
  const result = await adminApiClient.get<PackageDay[]>(`${packagePath(id)}/days`);
  return result ?? [];
}

export async function addPackageDay(id: string, input: CreateDayInput): Promise<PackageDay> {
  const result = await adminApiClient.post<PackageDay>(`${packagePath(id)}/days`, input);
  if (!result) throw new Error("Failed to add day");
  return result;
}

export async function updatePackageDay(packageId: string, dayId: string, input: { title?: string; description?: string | null }): Promise<PackageDay> {
  const result = await adminApiClient.patch<PackageDay>(`${packagePath(packageId)}/days/${dayId}`, input);
  if (!result) throw new Error("Failed to update day");
  return result;
}

export async function removePackageDay(packageId: string, dayId: string): Promise<void> {
  await adminApiClient.delete(`${packagePath(packageId)}/days/${dayId}`);
}

export async function addPackageItem(packageId: string, dayId: string, input: CreateItemInput): Promise<PackageItem> {
  const result = await adminApiClient.post<PackageItem>(`${packagePath(packageId)}/days/${dayId}/items`, input);
  if (!result) throw new Error("Failed to add item");
  return result;
}

export async function removePackageItem(packageId: string, dayId: string, itemId: string): Promise<void> {
  await adminApiClient.delete(`${packagePath(packageId)}/days/${dayId}/items/${itemId}`);
}

export async function fetchPackageVersions(id: string): Promise<PackageVersion[]> {
  const result = await adminApiClient.get<PackageVersion[]>(`${packagePath(id)}/versions`);
  return result ?? [];
}

export async function rollbackPackageVersion(packageId: string, versionId: string): Promise<Package> {
  const result = await adminApiClient.post<Package>(`${packagePath(packageId)}/versions/${versionId}/rollback`, {});
  if (!result) throw new Error("Failed to rollback version");
  return result;
}

export async function fetchPricesForPackages(
  packages: Package[]
): Promise<Map<string, { total: number; currency: string }>> {
  const entries = await Promise.all(
    packages.map(async (pkg) => {
      try {
        const computed = await computePackagePrice(pkg.id, DEFAULT_LIST_COMPUTE_PAX);
        return [pkg.id, { total: computed.total, currency: computed.currency }] as const;
      } catch {
        try {
          const pricing = await fetchPackagePricing(pkg.id);
          if (pricing) {
            return [pkg.id, { total: pricing.basePrice, currency: pricing.currency }] as const;
          }
        } catch {
          // no pricing configured
        }
        return [pkg.id, null] as const;
      }
    })
  );

  const map = new Map<string, { total: number; currency: string }>();
  for (const [id, value] of entries) {
    if (value) map.set(id, value);
  }
  return map;
}
