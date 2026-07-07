"use client";

import { useState } from "react";
import { EnquiryFiltersBar } from "./EnquiryFiltersBar";
import { EnquiriesTable } from "./EnquiriesTable";
import { LeadDetailDrawer } from "./LeadDetailDrawer";
import { useDebouncedValue } from "../hooks/useDebouncedValue";
import { useEnquiriesQuery } from "../hooks/useEnquiriesQuery";
import type { EnquiryListFilters } from "../types";

export function EnquiriesInboxPage() {
  const [filters, setFilters] = useState<EnquiryListFilters>({ page: 1, pageSize: 20 });
  const [searchInput, setSearchInput] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const debouncedSearch = useDebouncedValue(searchInput);

  const queryFilters: EnquiryListFilters = { ...filters, search: debouncedSearch };
  const enquiriesQuery = useEnquiriesQuery(queryFilters);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Enquiries</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Monitor client vacation requests, assign support agents, and track conversion statuses.
        </p>
      </div>

      <div className="bg-card border border-border rounded-lg shadow-sm overflow-hidden">
        <EnquiryFiltersBar
          filters={filters}
          searchInput={searchInput}
          onSearchChange={setSearchInput}
          onFiltersChange={(patch) => setFilters((current) => ({ ...current, ...patch }))}
          onRefresh={() => void enquiriesQuery.refetch()}
          isRefreshing={enquiriesQuery.isFetching}
        />

        <EnquiriesTable
          data={enquiriesQuery.data}
          isLoading={enquiriesQuery.isLoading}
          isError={enquiriesQuery.isError}
          errorMessage={enquiriesQuery.error instanceof Error ? enquiriesQuery.error.message : undefined}
          onRetry={() => void enquiriesQuery.refetch()}
          onSelect={setSelectedId}
          page={filters.page ?? 1}
          onPageChange={(page) => setFilters((current) => ({ ...current, page }))}
        />
      </div>

      <LeadDetailDrawer enquiryId={selectedId} onClose={() => setSelectedId(null)} />
    </div>
  );
}
