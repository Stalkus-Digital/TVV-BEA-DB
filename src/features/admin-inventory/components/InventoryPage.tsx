"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useDebouncedValue } from "@/features/admin-enquiries/hooks/useDebouncedValue";
import { archiveDestination } from "@/features/admin-destinations/api/destinations";
import { DestinationDetailDrawer } from "@/features/admin-destinations/components/DestinationDetailDrawer";
import { useGeographyReferenceQuery } from "@/features/admin-destinations/hooks/useDestinationsQuery";
import { archivePackage } from "@/features/admin-packages/api/packages";
import { PackageDetailDrawer } from "@/features/admin-packages/components/PackageDetailDrawer";
import { archiveInventoryItem } from "../api/inventory";
import type { CatalogListFilters, CatalogListRow } from "../catalog/types";
import { isInventoryKind } from "../catalog/constants";
import { useCatalogQuery } from "../hooks/useCatalogQuery";
import { InventoryDetailDrawer } from "./InventoryDetailDrawer";
import { InventoryFiltersBar } from "./InventoryFiltersBar";
import { InventoryTable } from "./InventoryTable";

type Selection =
  | { type: "inventory"; id: string }
  | { type: "destination"; id: string }
  | { type: "package"; id: string }
  | null;

export function InventoryPage() {
  const searchParams = useSearchParams();
  const [filters, setFilters] = useState<CatalogListFilters>({
    page: 1,
    pageSize: 20,
    sortBy: "updatedAt",
    sortDir: "desc",
  });
  const [searchInput, setSearchInput] = useState("");
  const [selection, setSelection] = useState<Selection>(() => {
    const selected = searchParams.get("selected");
    const type = searchParams.get("type");
    if (!selected) return null;
    if (type === "destination") return { type: "destination", id: selected };
    if (type === "package") return { type: "package", id: selected };
    return { type: "inventory", id: selected };
  });
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);
  const debouncedSearch = useDebouncedValue(searchInput);
  const queryClient = useQueryClient();
  const geoQuery = useGeographyReferenceQuery();

  const queryFilters: CatalogListFilters = { ...filters, search: debouncedSearch };
  const catalogQuery = useCatalogQuery(queryFilters);

  const destinationOptions = useMemo(
    () => catalogQuery.destinations.map((d) => ({ id: d.id, name: d.name, slug: d.slug })),
    [catalogQuery.destinations]
  );

  const invalidateCatalog = () => {
    queryClient.invalidateQueries({ queryKey: ["admin", "catalog"] });
    queryClient.invalidateQueries({ queryKey: ["admin", "inventory"] });
    queryClient.invalidateQueries({ queryKey: ["admin", "destinations"] });
    queryClient.invalidateQueries({ queryKey: ["admin", "packages"] });
  };

  const deleteMutation = useMutation({
    mutationFn: async (row: CatalogListRow) => {
      if (row.entityType === "DESTINATION") return archiveDestination(row.id);
      if (row.entityType === "PACKAGE") return archivePackage(row.id);
      return archiveInventoryItem(row.id);
    },
    onSuccess: () => invalidateCatalog(),
  });

  const handleDelete = async (row: CatalogListRow) => {
    const label =
      row.entityType === "DESTINATION"
        ? "destination"
        : row.entityType === "PACKAGE"
          ? "holiday package"
          : "inventory item";
    if (!window.confirm(`Are you sure you want to delete this ${label}?`)) return;

    setIsDeletingId(row.id);
    try {
      await deleteMutation.mutateAsync(row);
    } finally {
      setIsDeletingId(null);
    }
  };

  const handleSelect = (row: CatalogListRow) => {
    if (row.entityType === "DESTINATION") {
      setSelection({ type: "destination", id: row.id });
      return;
    }
    if (row.entityType === "PACKAGE") {
      setSelection({ type: "package", id: row.id });
      return;
    }
    if (isInventoryKind(row.entityType)) {
      setSelection({ type: "inventory", id: row.id });
    }
  };

  useEffect(() => {
    const selected = searchParams.get("selected");
    const type = searchParams.get("type");
    if (!selected) return;
    if (type === "destination") setSelection({ type: "destination", id: selected });
    else if (type === "package") setSelection({ type: "package", id: selected });
    else setSelection({ type: "inventory", id: selected });
  }, [searchParams]);

  return (
    <div className="space-y-0 -m-6 flex flex-col min-h-[calc(100vh-6rem)] bg-slate-50">
      <div className="px-6 py-3 border-b border-border bg-white shrink-0 space-y-2">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Inventory</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage hotels, activities, destinations, holiday packages, and more in one place.
          </p>
        </div>
        <InventoryFiltersBar
          filters={filters}
          searchInput={searchInput}
          destinations={catalogQuery.destinations}
          onSearchChange={(value) => {
            setSearchInput(value);
            setFilters((current) => ({ ...current, page: 1 }));
          }}
          onFiltersChange={(patch) => setFilters((current) => ({ ...current, ...patch }))}
          onRefresh={() => void catalogQuery.refetch()}
          isRefreshing={catalogQuery.isFetching}
        />
      </div>

      <div className="flex-1 bg-white border-t border-border">
        <InventoryTable
          data={catalogQuery.data}
          isLoading={catalogQuery.isLoading}
          isError={catalogQuery.isError}
          errorMessage={catalogQuery.error instanceof Error ? catalogQuery.error.message : undefined}
          onRetry={() => void catalogQuery.refetch()}
          onSelect={handleSelect}
          onDelete={handleDelete}
          isDeleting={isDeletingId}
          page={filters.page ?? 1}
          onPageChange={(page) => setFilters((current) => ({ ...current, page }))}
        />
      </div>

      <InventoryDetailDrawer
        itemId={selection?.type === "inventory" ? selection.id : null}
        destinations={catalogQuery.destinations}
        onClose={() => setSelection(null)}
      />

      <DestinationDetailDrawer
        destinationId={selection?.type === "destination" ? selection.id : null}
        geo={geoQuery.data}
        onClose={() => setSelection(null)}
      />

      <PackageDetailDrawer
        packageId={selection?.type === "package" ? selection.id : null}
        destinations={destinationOptions}
        onClose={() => setSelection(null)}
      />
    </div>
  );
}
