"use client";

import { useMemo, useState } from "react";
import { useDebouncedValue } from "@/features/admin-enquiries/hooks/useDebouncedValue";
import { useLandingPagesQuery } from "../hooks/useMarketingQueries";
import { MarketingPageShell } from "./MarketingPageShell";
import { LandingPageEditor } from "./LandingPageEditor";
import { ExternalLink } from "lucide-react";

const WEBSITE_BASE = (process.env.NEXT_PUBLIC_WEBSITE_BASE_URL ?? "").replace(/\/$/, "");

export function LandingPagesPage() {
  const pagesQuery = useLandingPagesQuery();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "home" | "package" | "destination" | "static">("all");
  const [isEditing, setIsEditing] = useState(false);
  const debouncedSearch = useDebouncedValue(search);

  const filtered = useMemo(() => {
    return (pagesQuery.data ?? []).filter((page) => {
      if (typeFilter !== "all" && page.type !== typeFilter) return false;
      if (!debouncedSearch) return true;
      const q = debouncedSearch.toLowerCase();
      return page.title.toLowerCase().includes(q) || page.slug.toLowerCase().includes(q) || page.path.toLowerCase().includes(q);
    });
  }, [pagesQuery.data, typeFilter, debouncedSearch]);

  return (
    <MarketingPageShell
      title="Landing Pages"
      description="Public website pages derived from Website BFF and published content — not a dedicated landing-page CMS."
      isLoading={pagesQuery.isLoading}
      isError={pagesQuery.isError}
      errorMessage={pagesQuery.error instanceof Error ? pagesQuery.error.message : undefined}
      isRefreshing={pagesQuery.isFetching}
      onRefresh={() => void pagesQuery.refetch()}
      onRetry={() => void pagesQuery.refetch()}
      isEmpty={!pagesQuery.isLoading && !pagesQuery.isError && filtered.length === 0}
      emptyMessage="No landing pages match your filters"
    >
      <div className="flex flex-wrap gap-3 mb-4 mt-4 justify-between">
        <div className="flex gap-3">
          <input
            type="search"
            placeholder="Search title or slug…"
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
            <option value="home">Home</option>
            <option value="package">Package</option>
            <option value="destination">Destination</option>
            <option value="static">Static (navigation)</option>
          </select>
        </div>
        <button
          onClick={() => setIsEditing(true)}
          className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:opacity-90"
        >
          Create Landing Page
        </button>
      </div>

      {isEditing ? (
        <LandingPageEditor onCancel={() => setIsEditing(false)} />
      ) : (

        <div className="rounded-xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Title</th>
                <th className="text-left px-4 py-3 font-medium">Type</th>
                <th className="text-left px-4 py-3 font-medium">Slug / path</th>
                <th className="text-left px-4 py-3 font-medium">SEO title</th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
                <th className="text-right px-4 py-3 font-medium">Preview</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((page) => (
                <tr key={page.id} className="border-b border-border last:border-0 align-top">
                  <td className="px-4 py-3 font-medium">{page.title}</td>
                  <td className="px-4 py-3 capitalize text-muted-foreground">{page.type}</td>
                  <td className="px-4 py-3 font-mono text-xs">{page.path}</td>
                  <td className="px-4 py-3">{page.seoTitle ?? "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground">{page.publishedLabel}</td>
                  <td className="px-4 py-3 text-right">
                    <a 
                      href={WEBSITE_BASE ? `${WEBSITE_BASE}${page.previewPath}` : page.previewPath}
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline font-medium"
                    >
                      Open <ExternalLink className="h-3 w-3" />
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </MarketingPageShell>
  );
}
