"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useDebouncedValue } from "@/features/admin-enquiries/hooks/useDebouncedValue";
import { PackageDetailDrawer } from "./PackageDetailDrawer";
import { PackageFiltersBar } from "./PackageFiltersBar";
import { PackagesTable } from "./PackagesTable";
import { usePackagesQueryState } from "../hooks/usePackagesQuery";
import type { PackageListFilters } from "../types";

export function PackagesPage() {
  const searchParams = useSearchParams();
  const [filters, setFilters] = useState<PackageListFilters>({
    page: 1,
    pageSize: 20,
    sortBy: "updatedAt",
    sortDir: "desc",
  });
  const [searchInput, setSearchInput] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(searchParams.get("selected"));
  const debouncedSearch = useDebouncedValue(searchInput);

  const queryFilters: PackageListFilters = { ...filters, search: debouncedSearch };
  const packagesQuery = usePackagesQueryState(queryFilters);

  useEffect(() => {
    const selected = searchParams.get("selected");
    if (selected) setSelectedId(selected);
  }, [searchParams]);

  return (
    <div className="space-y-0 -m-6 flex flex-col min-h-[calc(100vh-6rem)]">
      <div className="p-6 border-b border-border bg-card shrink-0 space-y-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Packages</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage all standard and dynamically built travel packages.
          </p>
        </div>
        <PackageFiltersBar
          filters={filters}
          searchInput={searchInput}
          destinations={packagesQuery.destinations}
          onSearchChange={(value) => {
            setSearchInput(value);
            setFilters((current) => ({ ...current, page: 1 }));
          }}
          onFiltersChange={(patch) => setFilters((current) => ({ ...current, ...patch }))}
          onRefresh={() => void packagesQuery.refetch()}
          isRefreshing={packagesQuery.isFetching}
        />
      </div>

      <div className="flex-1 bg-card border-t border-border">
        <PackagesTable
          data={packagesQuery.data}
          isLoading={packagesQuery.isLoading}
          isError={packagesQuery.isError}
          errorMessage={packagesQuery.error instanceof Error ? packagesQuery.error.message : undefined}
          onRetry={() => void packagesQuery.refetch()}
          onSelect={setSelectedId}
          page={filters.page ?? 1}
          onPageChange={(page) => setFilters((current) => ({ ...current, page }))}
        />
      </div>

      <PackageDetailDrawer
        packageId={selectedId}
        destinations={packagesQuery.destinations}
        onClose={() => setSelectedId(null)}
      />
    </div>
  );
}
