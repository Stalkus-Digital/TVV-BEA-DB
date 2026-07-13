"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { deleteQuote } from "../api/quotes";
import { useDebouncedValue } from "@/features/admin-enquiries/hooks/useDebouncedValue";
import { QuoteCreateDialog } from "./QuoteCreateDialog";
import { QuoteDetailDrawer } from "./QuoteDetailDrawer";
import { QuoteFiltersBar } from "./QuoteFiltersBar";
import { QuotesTable } from "./QuotesTable";
import { useQuotesQueryState } from "../hooks/useQuotesQuery";
import type { QuoteListFilters } from "../types";

export function QuotesPage() {
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const [filters, setFilters] = useState<QuoteListFilters>({
    page: 1,
    pageSize: 20,
    sortBy: "createdAt",
    sortDir: "desc",
  });
  const [searchInput, setSearchInput] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(searchParams.get("selected"));
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const debouncedSearch = useDebouncedValue(searchInput);

  const queryFilters: QuoteListFilters = { ...filters, search: debouncedSearch };
  const quotesQuery = useQuotesQueryState(queryFilters);

  useEffect(() => {
    const selected = searchParams.get("selected");
    if (selected) setSelectedId(selected);
  }, [searchParams]);

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteQuote(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "quotes"] });
    },
  });

  const handleEdit = (id: string) => {
    setSelectedId(id); // Quotes use the Drawer for editing
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this quote?")) {
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
          <h1 className="text-2xl font-bold tracking-tight">Quotes</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage priced itineraries from draft through approval and booking conversion.
          </p>
        </div>
        <QuoteFiltersBar
          filters={filters}
          searchInput={searchInput}
          users={quotesQuery.users ?? []}
          onSearchChange={(value) => {
            setSearchInput(value);
            setFilters((current) => ({ ...current, page: 1 }));
          }}
          onFiltersChange={(patch) => setFilters((current) => ({ ...current, ...patch }))}
          onRefresh={() => void quotesQuery.refetch()}
          onCreate={() => setCreateOpen(true)}
          isRefreshing={quotesQuery.isFetching}
        />
      </div>

      <div className="flex-1 bg-card border-t border-border">
        <QuotesTable
          data={quotesQuery.data}
          isLoading={quotesQuery.isLoading}
          isError={quotesQuery.isError}
          errorMessage={quotesQuery.error instanceof Error ? quotesQuery.error.message : undefined}
          onRetry={() => void quotesQuery.refetch()}
          onSelect={setSelectedId}
          onEdit={handleEdit}
          onDelete={handleDelete}
          isDeleting={isDeletingId}
          page={filters.page ?? 1}
          onPageChange={(page) => setFilters((current) => ({ ...current, page }))}
        />
      </div>

      <QuoteDetailDrawer
        quoteId={selectedId}
        users={quotesQuery.users ?? []}
        bundle={quotesQuery.bundle}
        onClose={() => setSelectedId(null)}
        onSelectQuote={setSelectedId}
      />

      <QuoteCreateDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={(quoteId) => setSelectedId(quoteId)}
      />
    </div>
  );
}
