"use client";

import { ArrowDown, ArrowUpDown } from "lucide-react";
import { RefreshCw, Search } from "lucide-react";
import type { CustomerListFilters, CustomerSortField, SortDirection } from "../types";

const SORT_OPTIONS: { value: CustomerSortField; label: string }[] = [
  { value: "lastActivity", label: "Last activity" },
  { value: "name", label: "Name" },
  { value: "email", label: "Email" },
  { value: "createdAt", label: "Created date" },
  { value: "enquiryCount", label: "Enquiry count" },
  { value: "quoteCount", label: "Quote count" },
  { value: "bookingCount", label: "Booking count" },
];

interface CustomerFiltersBarProps {
  filters: CustomerListFilters;
  searchInput: string;
  onSearchChange: (value: string) => void;
  onFiltersChange: (patch: Partial<CustomerListFilters>) => void;
  onRefresh: () => void;
  isRefreshing?: boolean;
}

export function CustomerFiltersBar({
  filters,
  searchInput,
  onSearchChange,
  onFiltersChange,
  onRefresh,
  isRefreshing,
}: CustomerFiltersBarProps) {
  const sortDir: SortDirection = filters.sortDir ?? "desc";

  return (
    <div className="p-4 border-b border-border flex flex-col gap-3">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by name, email, phone, or ID…"
            className="w-full bg-background border border-input rounded-md pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
        <button
          type="button"
          onClick={onRefresh}
          disabled={isRefreshing}
          className="inline-flex items-center gap-2 self-start rounded-md border border-border px-3 py-2 text-sm font-medium hover:bg-muted transition-colors disabled:opacity-60"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <ArrowUpDown className="h-4 w-4 text-muted-foreground" />

        <select
          value={filters.emailVerified ?? "all"}
          onChange={(e) =>
            onFiltersChange({
              emailVerified: e.target.value as CustomerListFilters["emailVerified"],
              page: 1,
            })
          }
          className="bg-background border border-input rounded-md px-3 py-2 text-sm"
          aria-label="Filter by email verification"
        >
          <option value="all">All verification</option>
          <option value="verified">Verified only</option>
          <option value="unverified">Unverified only</option>
        </select>

        <select
          value={filters.sortBy ?? "lastActivity"}
          onChange={(e) => onFiltersChange({ sortBy: e.target.value as CustomerSortField, page: 1 })}
          className="bg-background border border-input rounded-md px-3 py-2 text-sm"
          aria-label="Sort by"
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              Sort: {option.label}
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={() => onFiltersChange({ sortDir: sortDir === "asc" ? "desc" : "asc", page: 1 })}
          className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-2 text-sm hover:bg-muted"
        >
          <ArrowDown className={`h-4 w-4 transition-transform ${sortDir === "asc" ? "rotate-180" : ""}`} />
          {sortDir === "asc" ? "Ascending" : "Descending"}
        </button>
      </div>
    </div>
  );
}
