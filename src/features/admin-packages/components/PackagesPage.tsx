"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { archivePackage } from "../api/packages";
import { useDebouncedValue } from "@/features/admin-enquiries/hooks/useDebouncedValue";
import { PackageDetailDrawer } from "./PackageDetailDrawer";
import { PackageFiltersBar } from "./PackageFiltersBar";
import { PackagesGrid } from "./PackagesGrid";
import { usePackagesQueryState } from "../hooks/usePackagesQuery";
import type { PackageListFilters } from "../types";

export function PackagesPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const [filters, setFilters] = useState<PackageListFilters>({
    page: 1,
    pageSize: 20,
    sortBy: "updatedAt",
    sortDir: "desc",
  });
  const [searchInput, setSearchInput] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(searchParams.get("selected"));
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);
  const debouncedSearch = useDebouncedValue(searchInput);

  const queryFilters: PackageListFilters = { ...filters, search: debouncedSearch };
  const packagesQuery = usePackagesQueryState(queryFilters);

  useEffect(() => {
    const selected = searchParams.get("selected");
    if (selected) setSelectedId(selected);
  }, [searchParams]);

  const deleteMutation = useMutation({
    mutationFn: (id: string) => archivePackage(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "packages"] });
    },
  });

  const handleEdit = (id: string) => {
    router.push(`/packages/new?id=${id}`);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this package?")) {
      setIsDeletingId(id);
      try {
        await deleteMutation.mutateAsync(id);
      } finally {
        setIsDeletingId(null);
      }
    }
  };

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

      <div className="flex-1 bg-slate-50/50 border-t border-border">
        <PackagesGrid
          data={packagesQuery.data}
          isLoading={packagesQuery.isLoading}
          isError={packagesQuery.isError}
          errorMessage={packagesQuery.error instanceof Error ? packagesQuery.error.message : undefined}
          onRetry={() => void packagesQuery.refetch()}
          onSelect={setSelectedId}
          onEdit={handleEdit}
          onDelete={handleDelete}
          isDeleting={isDeletingId}
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
