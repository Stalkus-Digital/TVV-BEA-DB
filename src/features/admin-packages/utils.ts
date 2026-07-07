import type { DestinationOption } from "@/features/admin-quotes/types";
import type { Package, PackageListFilters, PackageListRow } from "./types";

export function formatPackageDate(iso: string): string {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(iso));
}

export function formatPackageMoney(amount: number, currency = "INR"): string {
  return `${currency} ${amount.toLocaleString("en-IN")}`;
}

export function formatDuration(days: number, nights: number): string {
  return `${days}D / ${nights}N`;
}

export function resolveDestinationName(
  destinationId: string,
  destinationsById: Map<string, DestinationOption>
): string {
  return destinationsById.get(destinationId)?.name ?? "—";
}

export function applyPackageSearch(items: Package[], search?: string): Package[] {
  const query = search?.trim().toLowerCase();
  if (!query) return items;

  return items.filter(
    (item) =>
      item.title.toLowerCase().includes(query) ||
      item.code.toLowerCase().includes(query) ||
      item.slug.toLowerCase().includes(query) ||
      item.id.toLowerCase().includes(query)
  );
}

export function enrichPackageRows(
  packages: Package[],
  destinationsById: Map<string, DestinationOption>,
  pricesById: Map<string, { total: number; currency: string }>
): PackageListRow[] {
  return packages.map((pkg) => {
    const price = pricesById.get(pkg.id);
    return {
      ...pkg,
      destinationName: resolveDestinationName(pkg.destinationId, destinationsById),
      displayPrice: price?.total ?? null,
      currency: price?.currency ?? null,
    };
  });
}

export function sortPackages(
  items: PackageListRow[],
  sortBy: PackageListFilters["sortBy"] = "updatedAt",
  sortDir: PackageListFilters["sortDir"] = "desc"
): PackageListRow[] {
  const dir = sortDir === "asc" ? 1 : -1;
  return [...items].sort((a, b) => {
    switch (sortBy) {
      case "title":
        return a.title.localeCompare(b.title) * dir;
      case "status":
        return a.status.localeCompare(b.status) * dir;
      case "durationDays":
        return (a.durationDays - b.durationDays) * dir;
      case "displayPrice": {
        const av = a.displayPrice ?? -1;
        const bv = b.displayPrice ?? -1;
        return (av - bv) * dir;
      }
      case "createdAt":
        return (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) * dir;
      case "updatedAt":
      default:
        return (new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()) * dir;
    }
  });
}

export function paginatePackages<T>(items: T[], page: number, pageSize: number) {
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(Math.max(page, 1), totalPages);
  const start = (safePage - 1) * pageSize;
  return {
    items: items.slice(start, start + pageSize),
    page: safePage,
    pageSize,
    total,
    totalPages,
  };
}

export function needsClientPackageFiltering(filters: PackageListFilters): boolean {
  return Boolean(filters.search?.trim()) || filters.sortBy === "displayPrice" || filters.sortBy === "title";
}
