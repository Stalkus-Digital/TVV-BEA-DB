"use client";

import { useMemo, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import type { SearchFilters, SearchSort, SearchTypeFilter } from "../types";
import { parseSearchFilters } from "../utils/parse-filters";

const sortOptions: { label: string; value: SearchSort }[] = [
  { label: "Most relevant", value: "relevant" },
  { label: "Price: low to high", value: "price-asc" },
  { label: "Price: high to low", value: "price-desc" },
  { label: "Title A–Z", value: "title" },
];

const typeOptions: { label: string; value: SearchTypeFilter }[] = [
  { label: "All", value: "all" },
  { label: "Journeys", value: "packages" },
  { label: "Destinations", value: "destinations" },
  { label: "Guides", value: "guides" },
];

interface SearchFiltersBarProps {
  query: string;
}

export function SearchFiltersBar({ query }: SearchFiltersBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const filters = useMemo(
    () =>
      parseSearchFilters({
        sort: searchParams.get("sort") ?? undefined,
        type: searchParams.get("type") ?? undefined,
      }),
    [searchParams],
  );

  function updateFilters(next: Partial<SearchFilters>) {
    const merged: SearchFilters = { ...filters, ...next };
    const params = new URLSearchParams(searchParams.toString());
    if (query.trim()) params.set("q", query.trim());
    else params.delete("q");

    if (merged.sort === "relevant") params.delete("sort");
    else params.set("sort", merged.sort);

    if (merged.type === "all") params.delete("type");
    else params.set("type", merged.type);

    startTransition(() => {
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    });
  }

  if (!query.trim()) return null;

  return (
    <div
      className={cn(
        "flex flex-col gap-4 border-b border-line/40 pb-6 sm:flex-row sm:items-center sm:justify-between",
        isPending && "opacity-70",
      )}
    >
      <div className="flex flex-wrap gap-2">
        {typeOptions.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => updateFilters({ type: option.value })}
            className={cn(
              "rounded-full border px-4 py-2 text-[12px] font-semibold uppercase tracking-wider transition-colors",
              filters.type === option.value
                ? "border-teal bg-teal text-white"
                : "border-line/60 bg-white text-ink-secondary hover:border-teal/40 hover:text-teal",
            )}
          >
            {option.label}
          </button>
        ))}
      </div>

      <label className="flex items-center gap-3 text-[13px] text-ink-secondary">
        <span className="font-medium uppercase tracking-wider">Sort</span>
        <select
          value={filters.sort}
          onChange={(e) => updateFilters({ sort: e.target.value as SearchSort })}
          className="h-10 rounded-lg border border-line/60 bg-white px-3 text-[13px] text-ink outline-none focus:ring-2 focus:ring-teal/30"
          aria-label="Sort search results"
        >
          {sortOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
