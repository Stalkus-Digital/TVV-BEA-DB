"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useDebouncedValue } from "@/features/admin-enquiries/hooks/useDebouncedValue";
import { InventoryDetailDrawer } from "./InventoryDetailDrawer";
import { InventoryFiltersBar } from "./InventoryFiltersBar";
import { InventoryTable } from "./InventoryTable";
import { useInventoryQueryState } from "../hooks/useInventoryQuery";
import type { InventoryListFilters } from "../types";

export function InventoryPage() {
  const searchParams = useSearchParams();
  const [filters, setFilters] = useState<InventoryListFilters>({
    page: 1,
    pageSize: 20,
    sortBy: "updatedAt",
    sortDir: "desc",
  });
  const [searchInput, setSearchInput] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(searchParams.get("selected"));
  const debouncedSearch = useDebouncedValue(searchInput);

  const queryFilters: InventoryListFilters = { ...filters, search: debouncedSearch };
  const inventoryQuery = useInventoryQueryState(queryFilters);

  useEffect(() => {
    const selected = searchParams.get("selected");
    if (selected) setSelectedId(selected);
  }, [searchParams]);

  return (
    <div className="space-y-0 -m-6 flex flex-col min-h-[calc(100vh-6rem)]">
      <div className="p-6 border-b border-border bg-card shrink-0 space-y-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Inventory</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage hotels, flights, activities, transfers, visa, and insurance catalog items.
          </p>
        </div>
        <InventoryFiltersBar
          filters={filters}
          searchInput={searchInput}
          destinations={inventoryQuery.destinations}
          onSearchChange={(value) => {
            setSearchInput(value);
            setFilters((current) => ({ ...current, page: 1 }));
          }}
          onFiltersChange={(patch) => setFilters((current) => ({ ...current, ...patch }))}
          onRefresh={() => void inventoryQuery.refetch()}
          isRefreshing={inventoryQuery.isFetching}
        />
      </div>

      <div className="flex-1 bg-card border-t border-border">
        <InventoryTable
          data={inventoryQuery.data}
          isLoading={inventoryQuery.isLoading}
          isError={inventoryQuery.isError}
          errorMessage={inventoryQuery.error instanceof Error ? inventoryQuery.error.message : undefined}
          onRetry={() => void inventoryQuery.refetch()}
          onSelect={setSelectedId}
          page={filters.page ?? 1}
          onPageChange={(page) => setFilters((current) => ({ ...current, page }))}
        />
      </div>

      <InventoryDetailDrawer
        itemId={selectedId}
        destinations={inventoryQuery.destinations}
        onClose={() => setSelectedId(null)}
      />
    </div>
  );
}
