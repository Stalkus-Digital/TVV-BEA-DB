"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useDebouncedValue } from "@/features/admin-enquiries/hooks/useDebouncedValue";
import { CustomerDetailDrawer } from "./CustomerDetailDrawer";
import { CustomerFiltersBar } from "./CustomerFiltersBar";
import { CustomersTable } from "./CustomersTable";
import { useCustomersQueryState } from "../hooks/useCustomersQuery";
import type { CustomerListFilters } from "../types";

export function CustomersPage() {
  const searchParams = useSearchParams();
  const [filters, setFilters] = useState<CustomerListFilters>({
    page: 1,
    pageSize: 20,
    sortBy: "lastActivity",
    sortDir: "desc",
  });
  const [searchInput, setSearchInput] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(searchParams.get("selected"));
  const debouncedSearch = useDebouncedValue(searchInput);

  const queryFilters: CustomerListFilters = { ...filters, search: debouncedSearch };
  const customersQuery = useCustomersQueryState(queryFilters);

  useEffect(() => {
    const selected = searchParams.get("selected");
    if (selected) setSelectedId(selected);
  }, [searchParams]);

  return (
    <div className="space-y-0 -m-6 flex flex-col min-h-[calc(100vh-6rem)]">
      <div className="p-6 border-b border-border bg-card shrink-0 space-y-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Customers</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Registered accounts with enquiry, quote, and booking activity across the sales funnel.
          </p>
        </div>
        <CustomerFiltersBar
          filters={filters}
          searchInput={searchInput}
          onSearchChange={(value) => {
            setSearchInput(value);
            setFilters((current) => ({ ...current, page: 1 }));
          }}
          onFiltersChange={(patch) => setFilters((current) => ({ ...current, ...patch }))}
          onRefresh={() => void customersQuery.refetch()}
          isRefreshing={customersQuery.isFetching}
        />
      </div>

      <div className="flex-1 bg-card border-t border-border">
        <CustomersTable
          data={customersQuery.data}
          isLoading={customersQuery.isLoading}
          isError={customersQuery.isError}
          errorMessage={customersQuery.error instanceof Error ? customersQuery.error.message : undefined}
          onRetry={() => void customersQuery.refetch()}
          onSelect={setSelectedId}
          page={filters.page ?? 1}
          onPageChange={(page) => setFilters((current) => ({ ...current, page }))}
        />
      </div>

      <CustomerDetailDrawer
        userId={selectedId}
        bundle={customersQuery.bundle}
        onClose={() => setSelectedId(null)}
      />
    </div>
  );
}
