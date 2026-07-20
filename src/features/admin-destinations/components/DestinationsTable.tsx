"use client";

import { ChevronLeft, ChevronRight, Trash2, Archive, Eye, EyeOff } from "lucide-react";
import { useMemo, useState } from "react";
import { WidgetEmpty, WidgetError, WidgetLoading } from "@/features/admin-dashboard/components/WidgetState";
import type { PaginatedDestinations } from "../types";
import { formatDestinationDate } from "../utils";
import { DestinationStatusBadge } from "./DestinationStatusBadge";

interface DestinationsTableProps {
  data?: PaginatedDestinations;
  isLoading: boolean;
  isError: boolean;
  errorMessage?: string;
  onRetry: () => void;
  onSelect: (id: string) => void;
  page: number;
  onPageChange: (page: number) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  isDeleting?: string | null;
  onTogglePublish?: (id: string, currentStatus: string) => void;
  isPublishing?: string | null;
  onBulkDelete?: (ids: string[]) => void;
  onBulkPublish?: (ids: string[], status: string) => void;
}

export function DestinationsTable({
  data,
  isLoading,
  isError,
  errorMessage,
  onRetry,
  onSelect,
  page,
  onPageChange,
  onEdit,
  onDelete,
  isDeleting,
  onTogglePublish,
  isPublishing,
  onBulkDelete,
  onBulkPublish,
}: DestinationsTableProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const allItemIds = useMemo(() => new Set(data?.items.map((item) => item.id) ?? []), [data?.items]);

  const isAllSelected = selectedIds.size > 0 && selectedIds.size === allItemIds.size;
  const isSomeSelected = selectedIds.size > 0 && !isAllSelected;

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(allItemIds));
    }
  };

  const toggleSelectRow = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
  };
  if (isLoading && !data) {
    return <WidgetLoading label="Loading destinations…" />;
  }

  if (isError) {
    return <WidgetError message={errorMessage ?? "Failed to load destinations"} onRetry={onRetry} />;
  }

  if (!data || !Array.isArray(data.items) || data.items.length === 0) {
    return <WidgetEmpty message="No destinations found. Add a destination or adjust your filters." />;
  }

  return (
    <div className="flex flex-col h-full">
      {/* Bulk actions bar */}
      {selectedIds.size > 0 && (
        <div className="bg-blue-50 border-b border-blue-200 px-4 py-3 flex items-center justify-between">
          <span className="text-sm font-medium text-blue-900">
            {selectedIds.size} destination{selectedIds.size !== 1 ? "s" : ""} selected
          </span>
          <div className="flex items-center gap-2">
            {onBulkPublish && (
              <>
                <button
                  onClick={() => onBulkPublish(Array.from(selectedIds), "ACTIVE")}
                  className="px-3 py-1.5 text-xs font-medium bg-emerald-600 text-white rounded hover:bg-emerald-700 transition-colors flex items-center gap-1"
                >
                  <Eye className="w-3 h-3" /> Publish
                </button>
                <button
                  onClick={() => onBulkPublish(Array.from(selectedIds), "DRAFT")}
                  className="px-3 py-1.5 text-xs font-medium bg-amber-600 text-white rounded hover:bg-amber-700 transition-colors flex items-center gap-1"
                >
                  <EyeOff className="w-3 h-3" /> Unpublish
                </button>
              </>
            )}
            {onBulkDelete && (
              <button
                onClick={() => {
                  if (confirm(`Delete ${selectedIds.size} destination(s)? This cannot be undone.`)) {
                    onBulkDelete(Array.from(selectedIds));
                    setSelectedIds(new Set());
                  }
                }}
                className="px-3 py-1.5 text-xs font-medium bg-red-600 text-white rounded hover:bg-red-700 transition-colors flex items-center gap-1"
              >
                <Trash2 className="w-3 h-3" /> Delete
              </button>
            )}
            <button
              onClick={() => setSelectedIds(new Set())}
              className="px-3 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-100 rounded transition-colors"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      <div className="overflow-x-auto flex-1">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 border-b border-border sticky top-0">
            <tr>
              <th className="text-left font-medium px-4 py-3 w-10">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  onChange={toggleSelectAll}
                  className="rounded"
                  title={isAllSelected ? "Deselect all" : isSomeSelected ? "Select all" : "Select all"}
                />
              </th>
              <th className="text-left font-medium px-4 py-3">Name</th>
              <th className="text-left font-medium px-4 py-3">Country</th>
              <th className="text-left font-medium px-4 py-3">State</th>
              <th className="text-left font-medium px-4 py-3">Region</th>
              <th className="text-left font-medium px-4 py-3">Category</th>
              <th className="text-left font-medium px-4 py-3">Status</th>
              <th className="text-left font-medium px-4 py-3">Slug</th>
              <th className="text-left font-medium px-4 py-3">Updated</th>
              <th className="text-right font-medium px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.items.map((row) => (
              <tr
                key={row.id}
                className={`border-b border-border transition-colors ${selectedIds.has(row.id) ? "bg-blue-50" : "hover:bg-muted/30"}`}
              >
                <td className="px-4 py-3 w-10">
                  <input
                    type="checkbox"
                    checked={selectedIds.has(row.id)}
                    onChange={() => toggleSelectRow(row.id)}
                    className="rounded"
                    onClick={(e) => e.stopPropagation()}
                  />
                </td>
                <td className="px-4 py-3 cursor-pointer" onClick={() => onSelect(row.id)}>
                  <div className="font-medium">{row.name}</div>
                  {row.isFeatured && (
                    <span className="text-[10px] uppercase tracking-wide text-amber-600 font-semibold">Featured</span>
                  )}
                </td>
                <td className="px-4 py-3 text-muted-foreground">{row.countryName}</td>
                <td className="px-4 py-3 text-muted-foreground">{row.stateName}</td>
                <td className="px-4 py-3 text-muted-foreground">{row.regionName}</td>
                <td className="px-4 py-3 text-muted-foreground">{row.categoryLabel}</td>
                <td className="px-4 py-3">
                  <DestinationStatusBadge status={row.status} />
                </td>
                <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{row.slug}</td>
                <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{formatDestinationDate(row.updatedAt)}</td>
                <td className="px-4 py-3 text-right whitespace-nowrap">
                  {onTogglePublish && (
                    <button
                      disabled={isPublishing === row.id}
                      onClick={(e) => { e.stopPropagation(); onTogglePublish(row.id, row.status); }}
                      className="text-emerald-600 hover:underline font-medium mr-3 disabled:opacity-50"
                    >
                      {isPublishing === row.id ? "..." : row.status === "ACTIVE" ? "Unpublish" : "Publish"}
                    </button>
                  )}
                  <button
                    onClick={(e) => { e.stopPropagation(); onEdit(row.id); }}
                    className="text-blue-600 hover:underline font-medium mr-3"
                  >
                    Edit
                  </button>
                  <button
                    disabled={isDeleting === row.id}
                    onClick={(e) => { e.stopPropagation(); onDelete(row.id); }}
                    className="text-muted-foreground hover:text-destructive font-medium disabled:opacity-50"
                  >
                    {isDeleting === row.id ? "Deleting..." : "Delete"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-card shrink-0">
        <p className="text-xs text-muted-foreground">
          Page {data.page} of {data.totalPages} · {data.total} total
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
            className="p-2 rounded-md border border-border disabled:opacity-40 hover:bg-muted"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            disabled={page >= data.totalPages}
            onClick={() => onPageChange(page + 1)}
            className="p-2 rounded-md border border-border disabled:opacity-40 hover:bg-muted"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
