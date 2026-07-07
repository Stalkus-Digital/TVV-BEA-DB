"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useDebouncedValue } from "@/features/admin-enquiries/hooks/useDebouncedValue";
import { DestinationDetailDrawer } from "./DestinationDetailDrawer";
import { DestinationFiltersBar } from "./DestinationFiltersBar";
import { DestinationsTable } from "./DestinationsTable";
import { useDestinationsQueryState } from "../hooks/useDestinationsQuery";
import type { DestinationListFilters } from "../types";

export function DestinationsPage() {
  const searchParams = useSearchParams();
  const [filters, setFilters] = useState<DestinationListFilters>({
    page: 1,
    pageSize: 20,
    sortBy: "updatedAt",
    sortDir: "desc",
  });
  const [searchInput, setSearchInput] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(searchParams.get("selected"));
  const debouncedSearch = useDebouncedValue(searchInput);

  const queryFilters: DestinationListFilters = { ...filters, search: debouncedSearch };
  const destinationsQuery = useDestinationsQueryState(queryFilters);

  useEffect(() => {
    const selected = searchParams.get("selected");
    if (selected) setSelectedId(selected);
  }, [searchParams]);

  return (
    <div className="space-y-0 -m-6 flex flex-col min-h-[calc(100vh-6rem)]">
      <div className="p-6 border-b border-border bg-card shrink-0 space-y-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Destinations</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Build your destination pages. These will appear on the website and fuel the package builder.
          </p>
        </div>
        <DestinationFiltersBar
          filters={filters}
          searchInput={searchInput}
          countries={destinationsQuery.geo?.countries ?? []}
          states={destinationsQuery.geo?.states ?? []}
          regions={destinationsQuery.geo?.regions ?? []}
          categories={destinationsQuery.geo?.categories ?? []}
          onSearchChange={(value) => {
            setSearchInput(value);
            setFilters((current) => ({ ...current, page: 1 }));
          }}
          onFiltersChange={(patch) => setFilters((current) => ({ ...current, ...patch }))}
          onRefresh={() => void destinationsQuery.refetch()}
          isRefreshing={destinationsQuery.isFetching}
        />
      </div>

      <div className="flex-1 bg-card border-t border-border">
        <DestinationsTable
          data={destinationsQuery.data}
          isLoading={destinationsQuery.isLoading}
          isError={destinationsQuery.isError}
          errorMessage={destinationsQuery.error instanceof Error ? destinationsQuery.error.message : undefined}
          onRetry={() => void destinationsQuery.refetch()}
          onSelect={setSelectedId}
          page={filters.page ?? 1}
          onPageChange={(page) => setFilters((current) => ({ ...current, page }))}
        />
      </div>

      <DestinationDetailDrawer
        destinationId={selectedId}
        geo={destinationsQuery.geo}
        onClose={() => setSelectedId(null)}
        onSelectDestination={setSelectedId}
      />
    </div>
  );
}
