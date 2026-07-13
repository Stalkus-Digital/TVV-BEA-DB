"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { WidgetEmpty, WidgetError, WidgetLoading } from "@/features/admin-dashboard/components/WidgetState";
import { INVENTORY_KIND_LABELS } from "../constants";
import type { PaginatedInventory } from "../types";
import { formatInventoryDate } from "../utils";
import { InventoryStatusBadge } from "./InventoryStatusBadge";

interface InventoryTableProps {
  data?: PaginatedInventory;
  isLoading: boolean;
  isError: boolean;
  errorMessage?: string;
  onRetry: () => void;
  onSelect: (id: string) => void;
  page: number;
  onPageChange: (page: number) => void;
  onDelete: (id: string) => void;
  isDeleting?: string | null;
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
}: InventoryTableProps) {
  if (isLoading && !data) {
    return <WidgetLoading label="Loading inventory…" />;
  }

  if (isError) {
    return <WidgetError message={errorMessage ?? "Failed to load inventory"} onRetry={onRetry} />;
  }

  if (!data || data.items.length === 0) {
    return <WidgetEmpty message="No inventory items found. Add an item or adjust your filters." />;
  }

  return (
    <div className="flex flex-col h-full bg-white text-slate-900 rounded-lg shadow-sm border border-border overflow-hidden">
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-sm">
          <thead className="bg-slate-100 border-b border-border sticky top-0 text-slate-700">
            <tr>
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
                key={row.id}
                onClick={() => onSelect(row.id)}
                className="border-b border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors"
              >
                <td className="px-4 py-3 font-medium">{row.title}</td>
                <td className="px-4 py-3 text-muted-foreground">{INVENTORY_KIND_LABELS[row.kind]}</td>
                <td className="px-4 py-3 text-muted-foreground">{row.supplierLabel}</td>
                <td className="px-4 py-3 text-muted-foreground">{row.destinationName}</td>
                <td className="px-4 py-3">
                  <InventoryStatusBadge status={row.status} />
                </td>
                <td className="px-4 py-3 text-right text-muted-foreground">{row.priceLabel}</td>
                <td className="px-4 py-3 text-muted-foreground">{row.availabilityLabel}</td>
                <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{formatInventoryDate(row.updatedAt)}</td>
                <td className="px-4 py-3 text-right">
                  <button
                    type="button"
                    disabled={isDeleting === row.id || row.status === "ARCHIVED"}
                    onClick={(e) => { e.stopPropagation(); onDelete(row.id); }}
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
