"use client";

import { Filter, RefreshCw, Search } from "lucide-react";
import { EnquiryStatus, EnquiryType, type EnquiryListFilters } from "../types";
import { ENQUIRY_STATUS_LABELS, ENQUIRY_TYPE_LABELS } from "../constants";

interface EnquiryFiltersBarProps {
  filters: EnquiryListFilters;
  searchInput: string;
  onSearchChange: (value: string) => void;
  onFiltersChange: (patch: Partial<EnquiryListFilters>) => void;
  onRefresh: () => void;
  onCreate?: () => void;
  isRefreshing?: boolean;
}

export function EnquiryFiltersBar({
  filters,
  searchInput,
  onSearchChange,
  onFiltersChange,
  onRefresh,
  onCreate,
  isRefreshing,
}: EnquiryFiltersBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-border px-4 py-3">
      <div className="relative min-w-[200px] flex-1 basis-[220px] max-w-md">
        <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          value={searchInput}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search name, email, phone…"
          className="w-full rounded-md border border-input bg-background py-1.5 pl-8 pr-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
        />
      </div>

      <Filter className="hidden h-3.5 w-3.5 text-muted-foreground sm:block" aria-hidden />

      <select
        value={filters.status ?? ""}
        onChange={(e) => onFiltersChange({ status: (e.target.value as EnquiryStatus) || undefined, page: 1 })}
        className="rounded-md border border-input bg-background px-2.5 py-1.5 text-sm"
        aria-label="Status"
      >
        <option value="">All statuses</option>
        {Object.values(EnquiryStatus).map((status) => (
          <option key={status} value={status}>
            {ENQUIRY_STATUS_LABELS[status]}
          </option>
        ))}
      </select>

      <select
        value={filters.type ?? ""}
        onChange={(e) => onFiltersChange({ type: (e.target.value as EnquiryType) || undefined, page: 1 })}
        className="rounded-md border border-input bg-background px-2.5 py-1.5 text-sm"
        aria-label="Type"
      >
        <option value="">All types</option>
        {Object.values(EnquiryType).map((type) => (
          <option key={type} value={type}>
            {ENQUIRY_TYPE_LABELS[type]}
          </option>
        ))}
      </select>

      <input
        type="date"
        value={filters.dateFrom ?? ""}
        onChange={(e) => onFiltersChange({ dateFrom: e.target.value || undefined, page: 1 })}
        className="rounded-md border border-input bg-background px-2.5 py-1.5 text-sm"
        aria-label="From date"
      />
      <input
        type="date"
        value={filters.dateTo ?? ""}
        onChange={(e) => onFiltersChange({ dateTo: e.target.value || undefined, page: 1 })}
        className="rounded-md border border-input bg-background px-2.5 py-1.5 text-sm"
        aria-label="To date"
      />

      <div className="ml-auto flex shrink-0 gap-2">
        <button
          type="button"
          onClick={onRefresh}
          disabled={isRefreshing}
          className="inline-flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1.5 text-sm font-medium hover:bg-muted transition-colors disabled:opacity-60"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
          Refresh
        </button>

        {onCreate && (
          <button
            type="button"
            onClick={onCreate}
            className="inline-flex items-center gap-1.5 rounded-md bg-primary px-2.5 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Add Lead
          </button>
        )}
      </div>
    </div>
  );
}
