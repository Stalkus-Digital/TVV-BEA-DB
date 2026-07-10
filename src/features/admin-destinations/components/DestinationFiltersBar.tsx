"use client";

import Link from "next/link";
import { Plus, RefreshCw, Search } from "lucide-react";
import { DestinationStatus, DESTINATION_STATUS_LABELS } from "../constants";
import type { DestinationListFilters } from "../types";
import type { Country, DestinationCategory, Region, State } from "../types";

interface DestinationFiltersBarProps {
  filters: DestinationListFilters;
  searchInput: string;
  countries: Country[];
  states: State[];
  regions: Region[];
  categories: DestinationCategory[];
  onSearchChange: (value: string) => void;
  onFiltersChange: (patch: Partial<DestinationListFilters>) => void;
  onRefresh: () => void;
  isRefreshing?: boolean;
}

export function DestinationFiltersBar({
  filters,
  searchInput,
  countries,
  states,
  regions,
  categories,
  onSearchChange,
  onFiltersChange,
  onRefresh,
  isRefreshing,
}: DestinationFiltersBarProps) {
  const filteredStates = filters.countryId ? states.filter((s) => s.countryId === filters.countryId) : states;

  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex flex-1 flex-wrap items-center gap-2">
        <div className="relative min-w-[200px] flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="search"
            placeholder="Search destinations…"
            value={searchInput}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-border rounded-md bg-background"
          />
        </div>

        <select
          value={filters.countryId ?? ""}
          onChange={(e) =>
            onFiltersChange({ countryId: e.target.value || undefined, stateId: undefined, page: 1 })
          }
          className="px-3 py-2 text-sm border border-border rounded-md bg-background max-w-[160px]"
        >
          <option value="">All countries</option>
          {countries.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        <select
          value={filters.stateId ?? ""}
          onChange={(e) => onFiltersChange({ stateId: e.target.value || undefined, page: 1 })}
          className="px-3 py-2 text-sm border border-border rounded-md bg-background max-w-[160px]"
        >
          <option value="">All states</option>
          {filteredStates.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>

        <select
          value={filters.regionId ?? ""}
          onChange={(e) => onFiltersChange({ regionId: e.target.value || undefined, page: 1 })}
          className="px-3 py-2 text-sm border border-border rounded-md bg-background max-w-[160px]"
          title="Client-side filter — no regionId on list API"
        >
          <option value="">All regions</option>
          {regions.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name}
            </option>
          ))}
        </select>

        <select
          value={filters.categoryId ?? ""}
          onChange={(e) => onFiltersChange({ categoryId: e.target.value || undefined, page: 1 })}
          className="px-3 py-2 text-sm border border-border rounded-md bg-background max-w-[160px]"
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        <select
          value={filters.status ?? ""}
          onChange={(e) =>
            onFiltersChange({ status: (e.target.value || undefined) as DestinationListFilters["status"], page: 1 })
          }
          className="px-3 py-2 text-sm border border-border rounded-md bg-background"
          title="Client-side filter — no status on list API"
        >
          <option value="">All statuses</option>
          {Object.values(DestinationStatus).map((status) => (
            <option key={status} value={status}>
              {DESTINATION_STATUS_LABELS[status]}
            </option>
          ))}
        </select>

        <select
          value={`${filters.sortBy ?? "updatedAt"}:${filters.sortDir ?? "desc"}`}
          onChange={(e) => {
            const [sortBy, sortDir] = e.target.value.split(":") as [
              DestinationListFilters["sortBy"],
              DestinationListFilters["sortDir"],
            ];
            onFiltersChange({ sortBy, sortDir, page: 1 });
          }}
          className="px-3 py-2 text-sm border border-border rounded-md bg-background"
        >
          <option value="updatedAt:desc">Updated (newest)</option>
          <option value="updatedAt:asc">Updated (oldest)</option>
          <option value="name:asc">Name (A–Z)</option>
          <option value="name:desc">Name (Z–A)</option>
          <option value="status:asc">Status</option>
          <option value="slug:asc">Slug (A–Z)</option>
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
          href="/destinations/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-sm font-semibold rounded-md hover:bg-primary-hover transition-colors shadow-sm"
        >
          <Plus className="h-4 w-4" /> Add Destination
        </Link>
      </div>
    </div>
  );
}
