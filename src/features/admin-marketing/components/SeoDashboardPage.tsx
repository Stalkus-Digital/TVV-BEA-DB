"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useDebouncedValue } from "@/features/admin-enquiries/hooks/useDebouncedValue";
import { BACKEND_GAPS } from "../constants";
import { useSeoDashboardQuery } from "../hooks/useMarketingQueries";
import { BackendGapNotice } from "./BackendGapNotice";
import { MarketingPageShell } from "./MarketingPageShell";

export function SeoDashboardPage() {
  const seoQuery = useSeoDashboardQuery();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "destination" | "package">("all");
  const [missingOnly, setMissingOnly] = useState(false);
  const debouncedSearch = useDebouncedValue(search);

  const filtered = useMemo(() => {
    return (seoQuery.data ?? []).filter((item) => {
      if (typeFilter !== "all" && item.type !== typeFilter) return false;
      if (missingOnly && item.missingFields.length === 0) return false;
      if (!debouncedSearch) return true;
      const q = debouncedSearch.toLowerCase();
      return item.name.toLowerCase().includes(q) || item.slug.toLowerCase().includes(q);
    });
  }, [seoQuery.data, typeFilter, missingOnly, debouncedSearch]);

  const missingCount = useMemo(
    () => (seoQuery.data ?? []).filter((item) => item.missingFields.length > 0).length,
    [seoQuery.data]
  );

  return (
    <MarketingPageShell
      title="SEO Dashboard"
      description="Destination and package SEO from admin APIs — edit via CMS SEO Pages."
      isLoading={seoQuery.isLoading}
      isError={seoQuery.isError}
      errorMessage={seoQuery.error instanceof Error ? seoQuery.error.message : undefined}
      isRefreshing={seoQuery.isFetching}
      onRefresh={() => void seoQuery.refetch()}
      onRetry={() => void seoQuery.refetch()}
      isEmpty={!seoQuery.isLoading && !seoQuery.isError && filtered.length === 0}
      emptyMessage="No SEO records match your filters"
      actions={
        <Link href="/cms/seo" className="inline-flex items-center px-3 py-2 text-sm font-medium rounded-md border border-border bg-card hover:bg-muted">
          Edit in CMS
        </Link>
      }
    >
      <BackendGapNotice title="Static page SEO" message={BACKEND_GAPS.staticPageSeo} />

      <div className="grid gap-4 sm:grid-cols-3 mt-4 mb-4">
        <StatCard label="Total records" value={String(seoQuery.data?.length ?? 0)} />
        <StatCard label="Missing SEO fields" value={String(missingCount)} />
        <StatCard label="Complete SEO" value={String((seoQuery.data?.length ?? 0) - missingCount)} />
      </div>

      <div className="flex flex-wrap gap-3 mb-4">
        <input
          type="search"
          placeholder="Search name or slug…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 min-w-[200px] bg-background border border-input rounded-md px-3 py-2 text-sm"
        />
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as typeof typeFilter)}
          className="bg-background border border-input rounded-md px-3 py-2 text-sm"
        >
          <option value="all">All types</option>
          <option value="destination">Destinations</option>
          <option value="package">Packages</option>
        </select>
        <label className="inline-flex items-center gap-2 text-sm px-3 py-2 border border-input rounded-md">
          <input type="checkbox" checked={missingOnly} onChange={(e) => setMissingOnly(e.target.checked)} />
          Missing SEO only
        </label>
      </div>

      <div className="rounded-xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 border-b border-border">
            <tr>
              <th className="text-left px-4 py-3 font-medium">Name</th>
              <th className="text-left px-4 py-3 font-medium">Type</th>
              <th className="text-left px-4 py-3 font-medium">Meta title</th>
              <th className="text-left px-4 py-3 font-medium">Meta description</th>
              <th className="text-left px-4 py-3 font-medium">Missing</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((item) => (
              <tr key={item.id} className="border-b border-border last:border-0 align-top">
                <td className="px-4 py-3">
                  <p className="font-medium">{item.name}</p>
                  <p className="text-xs text-muted-foreground font-mono">{item.slug}</p>
                </td>
                <td className="px-4 py-3 capitalize text-muted-foreground">{item.type}</td>
                <td className="px-4 py-3 max-w-xs truncate">{item.seo.metaTitle || "—"}</td>
                <td className="px-4 py-3 max-w-xs truncate">{item.seo.metaDescription || "—"}</td>
                <td className="px-4 py-3">
                  {item.missingFields.length === 0 ? (
                    <span className="text-xs text-green-600">Complete</span>
                  ) : (
                    <span className="text-xs text-amber-600">{item.missingFields.join(", ")}</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </MarketingPageShell>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</p>
      <p className="text-2xl font-bold mt-1">{value}</p>
    </div>
  );
}
