"use client";

import Link from "next/link";
import { Plus, RefreshCw, Search } from "lucide-react";
import {
  PACKAGE_SOURCE_TYPE_LABELS,
  PackageSourceType,
  PackageStatus,
  PACKAGE_STATUS_LABELS,
} from "../constants";
import type { PackageListFilters } from "../types";
import type { DestinationOption } from "@/features/admin-quotes/types";

interface PackageFiltersBarProps {
  filters: PackageListFilters;
  searchInput: string;
  destinations: DestinationOption[];
  onSearchChange: (value: string) => void;
  onFiltersChange: (patch: Partial<PackageListFilters>) => void;
  onRefresh: () => void;
  isRefreshing?: boolean;
}

export function PackageFiltersBar({
  filters,
  searchInput,
  destinations,
  onSearchChange,
  onFiltersChange,
  onRefresh,
  isRefreshing,
}: PackageFiltersBarProps) {
  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex flex-1 flex-wrap items-center gap-2">
        <div className="relative min-w-[200px] flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="search"
            placeholder="Search packages…"
            value={searchInput}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-border rounded-md bg-background"
          />
        </div>

        <select
          value={filters.status ?? ""}
          onChange={(e) => onFiltersChange({ status: (e.target.value || undefined) as PackageListFilters["status"], page: 1 })}
          className="px-3 py-2 text-sm border border-border rounded-md bg-background"
        >
          <option value="">All statuses</option>
          {Object.values(PackageStatus).map((status) => (
            <option key={status} value={status}>
              {PACKAGE_STATUS_LABELS[status]}
            </option>
          ))}
        </select>

        <select
          value={filters.destinationId ?? ""}
          onChange={(e) => onFiltersChange({ destinationId: e.target.value || undefined, page: 1 })}
          className="px-3 py-2 text-sm border border-border rounded-md bg-background max-w-[180px]"
        >
          <option value="">All destinations</option>
          {destinations.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>

        <select
          value={filters.sourceType ?? ""}
          onChange={(e) => onFiltersChange({ sourceType: (e.target.value || undefined) as PackageListFilters["sourceType"], page: 1 })}
          className="px-3 py-2 text-sm border border-border rounded-md bg-background"
          title="Category maps to builder source type"
        >
          <option value="">All categories</option>
          {Object.values(PackageSourceType).map((type) => (
            <option key={type} value={type}>
              {PACKAGE_SOURCE_TYPE_LABELS[type]}
            </option>
          ))}
        </select>

        <select
          value={`${filters.sortBy ?? "updatedAt"}:${filters.sortDir ?? "desc"}`}
          onChange={(e) => {
            const [sortBy, sortDir] = e.target.value.split(":") as [PackageListFilters["sortBy"], PackageListFilters["sortDir"]];
            onFiltersChange({ sortBy, sortDir, page: 1 });
          }}
          className="px-3 py-2 text-sm border border-border rounded-md bg-background"
        >
          <option value="updatedAt:desc">Updated (newest)</option>
          <option value="updatedAt:asc">Updated (oldest)</option>
          <option value="title:asc">Name (A–Z)</option>
          <option value="title:desc">Name (Z–A)</option>
          <option value="displayPrice:desc">Price (high)</option>
          <option value="displayPrice:asc">Price (low)</option>
          <option value="durationDays:desc">Duration (longest)</option>
          <option value="status:asc">Status</option>
        </select>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          onClick={onRefresh}
          disabled={isRefreshing}
          className="inline-flex items-center gap-2 px-3 py-2 text-sm border border-border rounded-md hover:bg-muted disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
          Refresh
        </button>
        <Link
          href="/packages/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-sm font-semibold rounded-md hover:bg-primary-hover"
        >
          <Plus className="h-4 w-4" /> Create Package
        </Link>
      </div>
    </div>
  );
}
