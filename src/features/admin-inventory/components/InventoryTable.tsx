"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Eye, EyeOff, Trash2 } from "lucide-react";
import { WidgetEmpty, WidgetError, WidgetLoading } from "@/features/admin-dashboard/components/WidgetState";
import { CATALOG_ENTITY_LABELS } from "../catalog/constants";
import type { CatalogListRow, PaginatedCatalog } from "../catalog/types";
import { formatInventoryDate } from "../utils";
import { InventoryStatusBadge } from "./InventoryStatusBadge";

export type BulkCatalogAction = "PUBLISH" | "UNPUBLISH" | "ARCHIVE";

interface InventoryTableProps {
  data?: PaginatedCatalog;
  isLoading: boolean;
  isError: boolean;
  errorMessage?: string;
  onRetry: () => void;
  onSelect: (row: CatalogListRow) => void;
  page: number;
  onPageChange: (page: number) => void;
  onDelete: (row: CatalogListRow) => void;
  isDeleting?: string | null;
  onBulkAction?: (rows: CatalogListRow[], action: BulkCatalogAction) => void;
  isBulkWorking?: boolean;
}

function rowKey(row: CatalogListRow) {
  return `${row.entityType}:${row.id}`;
}

export function InventoryTable({
  data,
  isLoading,
  isError,
  errorMessage,
  onRetry,
  onSelect,
  page,
  onPageChange,
  onDelete,
  isDeleting,
  onBulkAction,
  isBulkWorking,
}: InventoryTableProps) {
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());

  const allKeys = useMemo(() => new Set((data?.items ?? []).map(rowKey)), [data?.items]);
  const isAllSelected = selectedKeys.size > 0 && selectedKeys.size === allKeys.size;

  const selectedRows = useMemo(
    () => (data?.items ?? []).filter((row) => selectedKeys.has(rowKey(row))),
    [data?.items, selectedKeys]
  );

  const toggleSelectAll = () => {
    setSelectedKeys(isAllSelected ? new Set() : new Set(allKeys));
  };

  const toggleSelectRow = (row: CatalogListRow) => {
    const key = rowKey(row);
    const next = new Set(selectedKeys);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    setSelectedKeys(next);
  };

  const runBulk = (action: BulkCatalogAction) => {
    if (!onBulkAction || selectedRows.length === 0) return;
    if (action === "ARCHIVE" && !confirm(`Archive ${selectedRows.length} item(s)? You can restore them later.`)) {
      return;
    }
    onBulkAction(selectedRows, action);
    setSelectedKeys(new Set());
  };

  if (isLoading && !data) {
    return <WidgetLoading label="Loading catalog…" />;
  }

  if (isError) {
    return <WidgetError message={errorMessage ?? "Failed to load catalog"} onRetry={onRetry} />;
  }

  if (!data || data.items.length === 0) {
    return <WidgetEmpty message="No catalog items found. Add an item or adjust your filters." />;
  }

  return (
    <div className="flex flex-col h-full bg-white text-slate-900 rounded-lg shadow-sm border border-border overflow-hidden">
      {selectedKeys.size > 0 && onBulkAction && (
        <div className="bg-blue-50 border-b border-blue-200 px-4 py-3 flex items-center justify-between">
          <span className="text-sm font-medium text-blue-900">
            {selectedKeys.size} item{selectedKeys.size !== 1 ? "s" : ""} selected
          </span>
          <div className="flex items-center gap-2">
            <button
              disabled={isBulkWorking}
              onClick={() => runBulk("PUBLISH")}
              className="px-3 py-1.5 text-xs font-medium bg-emerald-600 text-white rounded hover:bg-emerald-700 transition-colors flex items-center gap-1 disabled:opacity-50"
            >
              <Eye className="w-3 h-3" /> Publish
            </button>
            <button
              disabled={isBulkWorking}
              onClick={() => runBulk("UNPUBLISH")}
              className="px-3 py-1.5 text-xs font-medium bg-amber-600 text-white rounded hover:bg-amber-700 transition-colors flex items-center gap-1 disabled:opacity-50"
            >
              <EyeOff className="w-3 h-3" /> Unpublish
            </button>
            <button
              disabled={isBulkWorking}
              onClick={() => runBulk("ARCHIVE")}
              className="px-3 py-1.5 text-xs font-medium bg-red-600 text-white rounded hover:bg-red-700 transition-colors flex items-center gap-1 disabled:opacity-50"
            >
              <Trash2 className="w-3 h-3" /> Archive
            </button>
            <button
              onClick={() => setSelectedKeys(new Set())}
              className="px-3 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-100 rounded transition-colors"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      <div className="overflow-x-auto flex-1">
        <table className="w-full text-sm">
          <thead className="bg-slate-100 border-b border-border sticky top-0 text-slate-700">
            <tr>
              <th className="text-left font-medium px-4 py-3 w-10">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  onChange={toggleSelectAll}
                  className="rounded"
                  title={isAllSelected ? "Deselect all" : "Select all"}
                />
              </th>
              <th className="text-left font-medium px-4 py-3">Name</th>
              <th className="text-left font-medium px-4 py-3">Type</th>
              <th className="text-left font-medium px-4 py-3">Supplier</th>
              <th className="text-left font-medium px-4 py-3">Destination</th>
              <th className="text-left font-medium px-4 py-3">Status</th>
              <th className="text-right font-medium px-4 py-3">Price</th>
              <th className="text-left font-medium px-4 py-3">Availability</th>
              <th className="text-left font-medium px-4 py-3">Updated</th>
              <th className="text-right font-medium px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.items.map((row) => (
              <tr
                key={rowKey(row)}
                className={`border-b border-slate-200 cursor-pointer transition-colors ${
                  selectedKeys.has(rowKey(row)) ? "bg-blue-50" : "hover:bg-slate-50"
                }`}
              >
                <td className="px-4 py-3 w-10">
                  <input
                    type="checkbox"
                    checked={selectedKeys.has(rowKey(row))}
                    onChange={() => toggleSelectRow(row)}
                    onClick={(e) => e.stopPropagation()}
                    className="rounded"
                  />
                </td>
                <td className="px-4 py-3 font-medium" onClick={() => onSelect(row)}>
                  {row.title}
                </td>
                <td className="px-4 py-3 text-muted-foreground" onClick={() => onSelect(row)}>
                  {CATALOG_ENTITY_LABELS[row.entityType]}
                </td>
                <td className="px-4 py-3 text-muted-foreground" onClick={() => onSelect(row)}>
                  {row.supplierLabel}
                </td>
                <td className="px-4 py-3 text-muted-foreground" onClick={() => onSelect(row)}>
                  {row.destinationName}
                </td>
                <td className="px-4 py-3" onClick={() => onSelect(row)}>
                  <InventoryStatusBadge status={row.status} />
                </td>
                <td className="px-4 py-3 text-right text-muted-foreground" onClick={() => onSelect(row)}>
                  {row.priceLabel}
                </td>
                <td className="px-4 py-3 text-muted-foreground" onClick={() => onSelect(row)}>
                  {row.availabilityLabel}
                </td>
                <td className="px-4 py-3 text-muted-foreground whitespace-nowrap" onClick={() => onSelect(row)}>
                  {formatInventoryDate(row.updatedAt)}
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    type="button"
                    disabled={isDeleting === row.id || row.status === "ARCHIVED"}
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(row);
                    }}
                    className="text-red-500 hover:text-red-700 disabled:opacity-30 disabled:hover:text-red-500 transition-colors text-xs font-medium bg-red-50 px-2 py-1 rounded"
                  >
                    {isDeleting === row.id ? "Deleting..." : "Delete"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 bg-slate-50 shrink-0">
        <p className="text-xs text-slate-500">
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
