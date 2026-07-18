"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { Download, Loader2, Plus, RefreshCw, Search, Upload } from "lucide-react";
import { CATALOG_ENTITY_LABELS, CATALOG_ENTITY_TYPES } from "../catalog/constants";
import type { CatalogListFilters } from "../catalog/types";
import { InventoryStatus, INVENTORY_STATUS_LABELS } from "../constants";
import { downloadCatalogExport } from "../utils/catalog-io";

interface InventoryFiltersBarProps {
  filters: CatalogListFilters;
  searchInput: string;
  destinations: { id: string; name: string }[];
  onSearchChange: (value: string) => void;
  onFiltersChange: (patch: Partial<CatalogListFilters>) => void;
  onRefresh: () => void;
  isRefreshing?: boolean;
}

export function InventoryFiltersBar({
  filters,
  searchInput,
  destinations,
  onSearchChange,
  onFiltersChange,
  onRefresh,
  isRefreshing,
}: InventoryFiltersBarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/admin/inventory/upload", {
        method: "POST",
        body: formData,
      });

      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.error || "Upload failed");
      }

      const byTypeSummary = result.byType
        ? Object.entries(result.byType as Record<string, { successful: number; failed: number }>)
            .map(([type, counts]) => `${type}: ${counts.successful} ok / ${counts.failed} failed`)
            .join("\n")
        : "";

      alert(
        `Import complete!\nSuccessful: ${result.successful}\nFailed: ${result.failed}${
          byTypeSummary ? `\n\n${byTypeSummary}` : ""
        }${
          result.errors?.length > 0
            ? "\n\nErrors:\n" +
              result.errors.slice(0, 5).join("\n") +
              (result.errors.length > 5 ? "\n..." : "")
            : ""
        }`
      );
      onRefresh();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Upload failed";
      alert("Error uploading file: " + message);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await downloadCatalogExport({
        kind: filters.kind,
        destinationId: filters.destinationId,
        status: filters.status,
        search: filters.search ?? searchInput,
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Export failed";
      alert("Error exporting catalog: " + message);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex flex-1 flex-wrap items-center gap-2">
        <div className="relative min-w-[200px] flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="search"
            placeholder="Search inventory…"
            value={searchInput}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-border rounded-md bg-white text-slate-900"
          />
        </div>

        <select
          value={filters.kind ?? ""}
          onChange={(e) =>
            onFiltersChange({
              kind: (e.target.value || undefined) as CatalogListFilters["kind"],
              page: 1,
            })
          }
          className="px-3 py-2 text-sm border border-border rounded-md bg-white text-slate-900"
        >
          <option value="">All types</option>
          {CATALOG_ENTITY_TYPES.map((kind) => (
            <option key={kind} value={kind}>
              {CATALOG_ENTITY_LABELS[kind]}
            </option>
          ))}
        </select>

        <select
          value={filters.destinationId ?? ""}
          onChange={(e) => onFiltersChange({ destinationId: e.target.value || undefined, page: 1 })}
          className="px-3 py-2 text-sm border border-border rounded-md bg-white text-slate-900 max-w-[180px]"
        >
          <option value="">All destinations</option>
          {destinations.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>

        <select
          value={filters.status ?? ""}
          onChange={(e) =>
            onFiltersChange({ status: (e.target.value || undefined) as CatalogListFilters["status"], page: 1 })
          }
          className="px-3 py-2 text-sm border border-border rounded-md bg-white text-slate-900"
        >
          <option value="">All statuses</option>
          {Object.values(InventoryStatus).map((status) => (
            <option key={status} value={status}>
              {INVENTORY_STATUS_LABELS[status]}
            </option>
          ))}
          <option value="PUBLISHED">Published</option>
        </select>

        <select
          value={`${filters.sortBy ?? "updatedAt"}:${filters.sortDir ?? "desc"}`}
          onChange={(e) => {
            const [sortBy, sortDir] = e.target.value.split(":") as [
              CatalogListFilters["sortBy"],
              CatalogListFilters["sortDir"],
            ];
            onFiltersChange({ sortBy, sortDir, page: 1 });
          }}
          className="px-3 py-2 text-sm border border-border rounded-md bg-white text-slate-900"
        >
          <option value="updatedAt:desc">Updated (newest)</option>
          <option value="updatedAt:asc">Updated (oldest)</option>
          <option value="title:asc">Name (A–Z)</option>
          <option value="title:desc">Name (Z–A)</option>
          <option value="kind:asc">Type</option>
          <option value="status:asc">Status</option>
        </select>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          onClick={onRefresh}
          disabled={isRefreshing}
          aria-label="Refresh"
          title="Refresh"
          className="inline-flex items-center justify-center p-2 border border-border rounded-md hover:bg-muted disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
        </button>
        <input
          type="file"
          accept=".xlsx, .xls, .csv"
          className="hidden"
          ref={fileInputRef}
          onChange={handleFileUpload}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="inline-flex items-center gap-2 px-3 py-2 text-sm border border-border rounded-md hover:bg-muted disabled:opacity-50"
        >
          {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
          {isUploading ? "Importing…" : "Import"}
        </button>
        <button
          type="button"
          onClick={() => void handleExport()}
          disabled={isExporting}
          className="inline-flex items-center gap-2 px-3 py-2 text-sm border border-border rounded-md hover:bg-muted disabled:opacity-50"
        >
          {isExporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
          {isExporting ? "Exporting…" : "Export"}
        </button>
        <Link
          href="/inventory/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-sm font-semibold rounded-md hover:bg-primary-hover"
        >
          <Plus className="h-4 w-4" /> Add Inventory
        </Link>
      </div>
    </div>
  );
}
