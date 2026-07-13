"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { archiveDestination } from "../api/destinations";
import { useDebouncedValue } from "@/features/admin-enquiries/hooks/useDebouncedValue";
import { DestinationDetailDrawer } from "./DestinationDetailDrawer";
import { DestinationFiltersBar } from "./DestinationFiltersBar";
import { DestinationsTable } from "./DestinationsTable";
import { useDestinationsQueryState } from "../hooks/useDestinationsQuery";
import type { DestinationListFilters } from "../types";

export function DestinationsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const [filters, setFilters] = useState<DestinationListFilters>({
    page: 1,
    pageSize: 20,
    sortBy: "updatedAt",
    sortDir: "desc",
  });
  const [searchInput, setSearchInput] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(searchParams.get("selected"));
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);
  const debouncedSearch = useDebouncedValue(searchInput);

  const queryFilters: DestinationListFilters = { ...filters, search: debouncedSearch };
  const destinationsQuery = useDestinationsQueryState(queryFilters);

  useEffect(() => {
    const selected = searchParams.get("selected");
    if (selected) setSelectedId(selected);
  }, [searchParams]);

  const deleteMutation = useMutation({
    mutationFn: (id: string) => archiveDestination(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "destinations"] });
    },
  });

  const handleEdit = (id: string) => {
    router.push(`/destinations/new?id=${id}`);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this destination?")) {
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
          onEdit={handleEdit}
          onDelete={handleDelete}
          isDeleting={isDeletingId}
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
