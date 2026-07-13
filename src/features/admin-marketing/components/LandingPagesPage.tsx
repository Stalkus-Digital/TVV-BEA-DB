"use client";

import { useMemo, useState } from "react";
import { useDebouncedValue } from "@/features/admin-enquiries/hooks/useDebouncedValue";
import { useLandingPagesQuery } from "../hooks/useMarketingQueries";
import { MarketingPageShell } from "./MarketingPageShell";
import { LandingPageEditor } from "./LandingPageEditor";
import { ExternalLink, Edit2, Trash2 } from "lucide-react";
import { adminApiClient } from "@/lib/admin-api/client";
import { useRouter } from "next/navigation";

const WEBSITE_BASE = (process.env.NEXT_PUBLIC_WEBSITE_BASE_URL ?? "").replace(/\/$/, "");

export function LandingPagesPage() {
  const pagesQuery = useLandingPagesQuery();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "home" | "package" | "destination" | "static">("all");
  const [isEditing, setIsEditing] = useState(false);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);
  const debouncedSearch = useDebouncedValue(search);
  const router = useRouter();

  const filtered = useMemo(() => {
    return (pagesQuery.data ?? []).filter((page) => {
      if (typeFilter !== "all" && page.type !== typeFilter) return false;
      if (!debouncedSearch) return true;
      const q = debouncedSearch.toLowerCase();
      return page.title.toLowerCase().includes(q) || page.slug.toLowerCase().includes(q) || page.path.toLowerCase().includes(q);
    });
  }, [pagesQuery.data, typeFilter, debouncedSearch]);

  const handleEdit = (page: any) => {
    if (page.type === "destination") {
      router.push(`/destinations/builder/${page.id}`);
    } else if (page.type === "package") {
      router.push(`/packages/${page.id}`);
    } else if (page.type === "home") {
      router.push("/cms/home");
    } else {
      router.push("/cms/navigation");
    }
  };

  const handleDelete = async (page: any) => {
    if (page.type !== "destination" && page.type !== "package") {
      alert(`Cannot delete ${page.type} pages from here.`);
      return;
    }
    if (!confirm(`Are you sure you want to delete this ${page.type}?`)) return;

    setIsDeletingId(page.id);
    try {
      if (page.type === "destination") {
        await adminApiClient.delete(`/api/destinations/${page.id}`);
      } else if (page.type === "package") {
        await adminApiClient.delete(`/api/packages/${page.id}`);
      }
      await pagesQuery.refetch();
    } catch (err) {
      alert(`Failed to delete ${page.type}`);
    } finally {
      setIsDeletingId(null);
    }
  };

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
                <th className="text-right px-4 py-3 font-medium">Actions</th>
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
                    <div className="flex items-center justify-end gap-3">
                      <a
                        href={WEBSITE_BASE ? `${WEBSITE_BASE}${page.previewPath}` : page.previewPath}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Preview"
                        className="text-muted-foreground hover:text-blue-600 transition-colors"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                      <button
                        onClick={() => handleEdit(page)}
                        title="Edit"
                        className="text-muted-foreground hover:text-blue-600 transition-colors"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      {(page.type === "destination" || page.type === "package") && (
                        <button
                          onClick={() => void handleDelete(page)}
                          disabled={isDeletingId === page.id}
                          title="Delete"
                          className="text-muted-foreground hover:text-destructive transition-colors disabled:opacity-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
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
