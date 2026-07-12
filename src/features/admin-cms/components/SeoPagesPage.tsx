"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useDebouncedValue } from "@/features/admin-enquiries/hooks/useDebouncedValue";
import { useUpdateSeoMutation } from "../hooks/useCmsMutations";
import { useCmsContentQuery } from "../hooks/useCmsQueries";
import { buildSeoList, hasSeoContent } from "../utils";
import { CmsPageShell } from "./CmsPageShell";
import type { SeoListItem, UpdateSeoInput } from "../types";

export function SeoPagesPage() {
  const cms = useCmsContentQuery();
  const seoMutation = useUpdateSeoMutation();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "destination" | "package">("all");
  const [editing, setEditing] = useState<SeoListItem | null>(null);
  const [form, setForm] = useState<UpdateSeoInput>({});
  const [error, setError] = useState<string | null>(null);
  const debouncedSearch = useDebouncedValue(search);

  const items = useMemo(() => buildSeoList(cms.destinations, cms.packages), [cms.destinations, cms.packages]);

  const filtered = useMemo(() => {
    return items.filter((item) => {
      if (typeFilter !== "all" && item.type !== typeFilter) return false;
      if (!debouncedSearch) return true;
      const q = debouncedSearch.toLowerCase();
      return item.name.toLowerCase().includes(q) || item.slug.toLowerCase().includes(q);
    });
  }, [items, typeFilter, debouncedSearch]);

  function openEdit(item: SeoListItem) {
    setEditing(item);
    setForm({ ...item.seo });
    setError(null);
  }

  async function saveSeo() {
    if (!editing) return;
    setError(null);
    try {
      await seoMutation.mutateAsync({ type: editing.type, id: editing.id, seo: form });
      setEditing(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save SEO");
    }
  }

  return (
    <CmsPageShell
      title="SEO Pages"
      description="Manage SEO metadata on destinations and packages via existing PATCH APIs."
      isLoading={cms.isLoading}
      isError={cms.isError}
      errorMessage={cms.error instanceof Error ? cms.error.message : undefined}
      isRefreshing={cms.isFetching}
      onRefresh={() => void cms.refetch()}
      onRetry={() => void cms.refetch()}
      isEmpty={!cms.isLoading && !cms.isError && filtered.length === 0}
      emptyMessage="No destinations or packages match your filters"
    >
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
      </div>

      {error && <p className="text-sm text-destructive mb-4">{error}</p>}

      <div className="rounded-xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 border-b border-border">
            <tr>
              <th className="text-left px-4 py-3 font-medium">Name</th>
              <th className="text-left px-4 py-3 font-medium">Type</th>
              <th className="text-left px-4 py-3 font-medium">SEO</th>
              <th className="text-left px-4 py-3 font-medium">Updated</th>
              <th className="text-right px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((item) => (
              <tr key={`${item.type}-${item.id}`} className="border-b border-border last:border-0">
                <td className="px-4 py-3 font-medium">{item.name}</td>
                <td className="px-4 py-3 capitalize text-muted-foreground">{item.type}</td>
                <td className="px-4 py-3">{hasSeoContent(item.seo) ? "Configured" : "—"}</td>
                <td className="px-4 py-3 text-muted-foreground">{new Date(item.updatedAt).toLocaleDateString()}</td>
                <td className="px-4 py-3 text-right space-x-2">
                  <button type="button" onClick={() => openEdit(item)} className="text-xs text-primary hover:underline">
                    Edit SEO
                  </button>
                  <Link
                    href={item.type === "destination" ? `/destinations?selected=${item.id}` : `/packages?selected=${item.id}`}
                    className="text-xs text-muted-foreground hover:underline"
                  >
                    Open
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button type="button" className="absolute inset-0 bg-black/30" onClick={() => setEditing(null)} aria-label="Close" />
          <div className="relative w-full max-w-lg rounded-xl border border-border bg-white p-6 shadow-xl space-y-4">
            <h3 className="font-semibold">Edit SEO — {editing.name}</h3>
            <Field label="Meta title" value={form.metaTitle ?? ""} onChange={(v) => setForm((f) => ({ ...f, metaTitle: v }))} />
            <Field label="Meta description" value={form.metaDescription ?? ""} onChange={(v) => setForm((f) => ({ ...f, metaDescription: v }))} multiline />
            <Field label="Canonical URL" value={form.canonicalUrl ?? ""} onChange={(v) => setForm((f) => ({ ...f, canonicalUrl: v }))} />
            <Field label="OG image URL" value={form.ogImageUrl ?? ""} onChange={(v) => setForm((f) => ({ ...f, ogImageUrl: v }))} />
            <Field label="Focus keyword" value={form.focusKeyword ?? ""} onChange={(v) => setForm((f) => ({ ...f, focusKeyword: v }))} />
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setEditing(null)} className="px-3 py-2 text-sm rounded-md border border-border">
                Cancel
              </button>
              <button
                type="button"
                disabled={seoMutation.isPending}
                onClick={() => void saveSeo()}
                className="px-3 py-2 text-sm rounded-md bg-primary text-primary-foreground disabled:opacity-50"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </CmsPageShell>
  );
}

function Field({
  label,
  value,
  onChange,
  multiline,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  multiline?: boolean;
}) {
  return (
    <label className="block text-sm">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      {multiline ? (
        <textarea
          rows={3}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="mt-1 w-full bg-background border border-input rounded-md px-3 py-2 text-sm resize-none"
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="mt-1 w-full bg-background border border-input rounded-md px-3 py-2 text-sm"
        />
      )}
    </label>
  );
}
