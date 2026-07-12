"use client";

import { useState } from "react";
import { CrmKanbanBoard } from "./CrmKanbanBoard";
import { EnquiriesTable } from "./EnquiriesTable";
import { EnquiryFiltersBar } from "./EnquiryFiltersBar";
import { LeadDetailDrawer } from "./LeadDetailDrawer";
import { LeadCreateDialog } from "./LeadCreateDialog";
import { useAllEnquiriesQuery, useEnquiriesQuery } from "../hooks/useEnquiriesQuery";
import { useDebouncedValue } from "../hooks/useDebouncedValue";
import type { EnquiryListFilters } from "../types";
import { LayoutGrid, List } from "lucide-react";

export function CrmLeadsPage() {
  const [filters, setFilters] = useState<EnquiryListFilters>({});
  const [searchInput, setSearchInput] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"kanban" | "list">("list");
  const debouncedSearch = useDebouncedValue(searchInput);

  const queryFilters = { ...filters, search: debouncedSearch };
  const allEnquiriesQuery = useAllEnquiriesQuery(queryFilters);
  const paginatedQuery = useEnquiriesQuery({ ...queryFilters, page: filters.page ?? 1, pageSize: filters.pageSize ?? 20 });

  return (
    <div className="h-[calc(100vh-6rem)] -m-6 flex flex-col">
      <div className="p-6 border-b border-border bg-card shrink-0 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">CRM & Leads</h1>
            <p className="text-sm text-muted-foreground mt-1">Manage incoming leads and track them through the pipeline.</p>
          </div>
          <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200">
            <button 
              onClick={() => setViewMode("list")} 
              className={`flex items-center gap-2 px-3 py-1.5 text-sm font-semibold rounded-md transition-colors ${viewMode === 'list' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
            >
              <List className="h-4 w-4" /> List
            </button>
            <button 
              onClick={() => setViewMode("kanban")} 
              className={`flex items-center gap-2 px-3 py-1.5 text-sm font-semibold rounded-md transition-colors ${viewMode === 'kanban' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
            >
              <LayoutGrid className="h-4 w-4" /> Kanban
            </button>
          </div>
        </div>
        <EnquiryFiltersBar
          filters={filters}
          searchInput={searchInput}
          onSearchChange={setSearchInput}
          onFiltersChange={(patch) => setFilters((current) => ({ ...current, ...patch }))}
          onRefresh={() => {
            void allEnquiriesQuery.refetch();
            void paginatedQuery.refetch();
          }}
          onCreate={() => setCreateOpen(true)}
          isRefreshing={allEnquiriesQuery.isFetching || paginatedQuery.isFetching}
        />
      </div>

      <div className={`flex-1 overflow-x-auto bg-slate-50/50 ${viewMode === "kanban" ? "p-6" : "p-0"}`}>
        {viewMode === "kanban" ? (
          <CrmKanbanBoard
            enquiries={allEnquiriesQuery.data}
            isLoading={allEnquiriesQuery.isLoading}
            isError={allEnquiriesQuery.isError}
            errorMessage={allEnquiriesQuery.error instanceof Error ? allEnquiriesQuery.error.message : undefined}
            onRetry={() => void allEnquiriesQuery.refetch()}
            onSelect={setSelectedId}
          />
        ) : (
          <EnquiriesTable
            data={paginatedQuery.data}
            isLoading={paginatedQuery.isLoading}
            isError={paginatedQuery.isError}
            errorMessage={paginatedQuery.error instanceof Error ? paginatedQuery.error.message : undefined}
            onRetry={() => void paginatedQuery.refetch()}
            onSelect={setSelectedId}
            page={filters.page ?? 1}
            onPageChange={(page) => setFilters((current) => ({ ...current, page }))}
          />
        )}
      </div>

      <LeadDetailDrawer enquiryId={selectedId} onClose={() => setSelectedId(null)} />
      
      <LeadCreateDialog 
        open={createOpen} 
        onClose={() => setCreateOpen(false)} 
        onCreated={(id) => setSelectedId(id)} 
      />
    </div>
  );
}
