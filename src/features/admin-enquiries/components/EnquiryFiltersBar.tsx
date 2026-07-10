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
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm font-medium hover:bg-muted transition-colors disabled:opacity-60"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
            Refresh
          </button>
          
          {onCreate && (
            <button
              type="button"
              onClick={onCreate}
              className="inline-flex items-center gap-2 rounded-md bg-primary text-primary-foreground px-3 py-2 text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              Add Lead
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Filter className="h-4 w-4 text-muted-foreground" />

        <select
          value={filters.status ?? ""}
          onChange={(e) => onFiltersChange({ status: (e.target.value as EnquiryStatus) || undefined, page: 1 })}
          className="bg-background border border-input rounded-md px-3 py-2 text-sm"
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
          className="bg-background border border-input rounded-md px-3 py-2 text-sm"
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
          className="bg-background border border-input rounded-md px-3 py-2 text-sm"
          aria-label="From date"
        />
        <input
          type="date"
          value={filters.dateTo ?? ""}
          onChange={(e) => onFiltersChange({ dateTo: e.target.value || undefined, page: 1 })}
          className="bg-background border border-input rounded-md px-3 py-2 text-sm"
          aria-label="To date"
        />
      </div>
    </div>
  );
}
