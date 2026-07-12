"use client";

import Link from "next/link";

import { useState, useRef } from "react";
import { Plus, RefreshCw, Search, Upload, Loader2 } from "lucide-react";
import { INVENTORY_KINDS, INVENTORY_KIND_LABELS, InventoryStatus, INVENTORY_STATUS_LABELS } from "../constants";
import type { InventoryListFilters } from "../types";

interface InventoryFiltersBarProps {
  filters: InventoryListFilters;
  searchInput: string;
  destinations: { id: string; name: string }[];
  onSearchChange: (value: string) => void;
  onFiltersChange: (patch: Partial<InventoryListFilters>) => void;
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
      
      alert(`Upload complete!\nSuccessful: ${result.successful}\nFailed: ${result.failed}\n${result.errors.length > 0 ? "Errors:\n" + result.errors.slice(0, 5).join('\n') + (result.errors.length > 5 ? '\n...' : '') : ''}`);
      onRefresh();
    } catch (err: any) {
      alert("Error uploading file: " + err.message);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
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
          onChange={(e) => onFiltersChange({ kind: (e.target.value || undefined) as InventoryListFilters["kind"], page: 1 })}
          className="px-3 py-2 text-sm border border-border rounded-md bg-white text-slate-900"
        >
          <option value="">All types</option>
          {INVENTORY_KINDS.map((kind) => (
            <option key={kind} value={kind}>
              {INVENTORY_KIND_LABELS[kind]}
            </option>
          ))}
        </select>

        <select
          value={filters.destinationId ?? ""}
          onChange={(e) => onFiltersChange({ destinationId: e.target.value || undefined, page: 1 })}
          className="px-3 py-2 text-sm border border-border rounded-md bg-white text-slate-900 max-w-[180px]"
          title="Client-side filter — no destinationId on list API"
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
            onFiltersChange({ status: (e.target.value || undefined) as InventoryListFilters["status"], page: 1 })
          }
          className="px-3 py-2 text-sm border border-border rounded-md bg-white text-slate-900"
          title="Client-side filter — no status on list API"
        >
          <option value="">All statuses</option>
          {Object.values(InventoryStatus).map((status) => (
            <option key={status} value={status}>
              {INVENTORY_STATUS_LABELS[status]}
            </option>
          ))}
        </select>

        <select
          value={`${filters.sortBy ?? "updatedAt"}:${filters.sortDir ?? "desc"}`}
          onChange={(e) => {
            const [sortBy, sortDir] = e.target.value.split(":") as [InventoryListFilters["sortBy"], InventoryListFilters["sortDir"]];
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
          className="inline-flex items-center gap-2 px-3 py-2 text-sm border border-border rounded-md hover:bg-muted disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
          Refresh
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
          {isUploading ? "Uploading..." : "Upload Excel"}
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
