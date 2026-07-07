"use client";

import { useState } from "react";
import { CrmKanbanBoard } from "./CrmKanbanBoard";
import { EnquiryFiltersBar } from "./EnquiryFiltersBar";
import { LeadDetailDrawer } from "./LeadDetailDrawer";
import { useAllEnquiriesQuery } from "../hooks/useEnquiriesQuery";
import { useDebouncedValue } from "../hooks/useDebouncedValue";
import type { EnquiryListFilters } from "../types";

export function CrmLeadsPage() {
  const [filters, setFilters] = useState<EnquiryListFilters>({});
  const [searchInput, setSearchInput] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const debouncedSearch = useDebouncedValue(searchInput);

  const queryFilters = { ...filters, search: debouncedSearch };
  const enquiriesQuery = useAllEnquiriesQuery(queryFilters);

  return (
    <div className="h-[calc(100vh-6rem)] -m-6 flex flex-col">
      <div className="p-6 border-b border-border bg-card shrink-0 space-y-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">CRM & Leads</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage incoming leads and track them through the pipeline.</p>
        </div>
        <EnquiryFiltersBar
          filters={filters}
          searchInput={searchInput}
          onSearchChange={setSearchInput}
          onFiltersChange={(patch) => setFilters((current) => ({ ...current, ...patch }))}
          onRefresh={() => void enquiriesQuery.refetch()}
          isRefreshing={enquiriesQuery.isFetching}
        />
      </div>

      <div className="flex-1 overflow-x-auto bg-slate-50/50 p-6">
        <CrmKanbanBoard
          enquiries={enquiriesQuery.data}
          isLoading={enquiriesQuery.isLoading}
          isError={enquiriesQuery.isError}
          errorMessage={enquiriesQuery.error instanceof Error ? enquiriesQuery.error.message : undefined}
          onRetry={() => void enquiriesQuery.refetch()}
          onSelect={setSelectedId}
        />
      </div>

      <LeadDetailDrawer enquiryId={selectedId} onClose={() => setSelectedId(null)} />
    </div>
  );
}
