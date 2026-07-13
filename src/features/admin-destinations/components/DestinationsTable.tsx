"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
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
}: DestinationsTableProps) {
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
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 border-b border-border sticky top-0">
            <tr>
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
                onClick={() => onSelect(row.id)}
                className="border-b border-border hover:bg-muted/30 cursor-pointer transition-colors"
              >
                <td className="px-4 py-3">
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
