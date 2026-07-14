"use client";

import { EyeOff, Edit, ImageIcon } from "lucide-react";
import { WidgetEmpty, WidgetError, WidgetLoading } from "@/features/admin-dashboard/components/WidgetState";
import type { PaginatedPackages } from "../types";
import { formatDuration, formatPackageDate, formatPackageMoney } from "../utils";

interface PackagesGridProps {
  data?: PaginatedPackages;
  isLoading: boolean;
  isError: boolean;
  errorMessage?: string;
  onRetry: () => void;
  page: number;
  onPageChange: (page: number) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onSelect: (id: string) => void;
  isDeleting?: string | null;
}

export function PackagesGrid({
  data,
  isLoading,
  isError,
  errorMessage,
  onRetry,
  page,
  onPageChange,
  onEdit,
  onDelete,
  onSelect,
  isDeleting,
}: PackagesGridProps) {
  if (isLoading && !data) {
    return <WidgetLoading label="Loading packages…" />;
  }

  if (isError) {
    return <WidgetError message={errorMessage ?? "Failed to load packages"} onRetry={onRetry} />;
  }

  if (!data || data.items.length === 0) {
    return <WidgetEmpty message="No packages found. Create a package or adjust your filters." />;
  }

  return (
    <div className="flex flex-col h-full bg-slate-50/50 p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 flex-1 items-start">
        {data.items.map((row: any) => {
          const image = row.content?.images?.[0] || row.images?.[0] || row.thumbnail || "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&q=80&w=800";
          const capacity = row.minPax || 2;
          
          return (
            <div key={row.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col transition-shadow hover:shadow-md">
              <div className="relative h-48 w-full bg-slate-100">
                <img src={image} alt={row.title} className="absolute inset-0 w-full h-full object-cover" />
              </div>
              <div className="p-5 flex flex-col flex-1">
                <div className="flex items-start justify-between gap-2 mb-4">
                  <h3 className="font-bold text-lg text-slate-900 leading-tight line-clamp-2">{row.title}</h3>
                  <div className="flex items-center gap-2 text-slate-600 shrink-0 mt-0.5">
                    <button title={row.status === "ARCHIVED" ? "Archived" : "Hide"} className="hover:text-slate-900 transition-colors">
                      <EyeOff className="h-4 w-4" />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); onEdit(row.id); }} className="hover:text-slate-900 transition-colors">
                      <Edit className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-2.5 text-sm text-slate-600 mb-6 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-slate-900">Duration:</span>
                    <span>{formatDuration(row.durationDays, row.durationNights)}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-slate-900">Price:</span>
                    <span>{row.displayPrice != null && row.currency ? formatPackageMoney(row.displayPrice, row.currency) : "—"}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-slate-900">Package Capacity:</span>
                    <span>{capacity}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-slate-900">Package Start Date:</span>
                    <span>{row.validFrom ? new Date(row.validFrom).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : "August 21st, 2025"}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-slate-900">Package End Date:</span>
                    <span>{row.validTo ? new Date(row.validTo).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : "September 30th, 2026"}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-100">
                  <button 
                    onClick={() => onSelect(row.id)}
                    className="px-5 py-2 bg-slate-900 hover:bg-black text-white text-sm font-semibold rounded-lg transition-colors"
                  >
                    View Detail
                  </button>
                  <button 
                    disabled={isDeleting === row.id}
                    onClick={(e) => { e.stopPropagation(); onDelete(row.id); }}
                    className="px-5 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50"
                  >
                    {isDeleting === row.id ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 flex items-center justify-between text-sm text-slate-600 bg-white p-4 rounded-lg border border-slate-200">
        <div>
          Showing {((page - 1) * 20) + 1} to {Math.min(page * 20, data.total)} of {data.total} packages
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onPageChange(page - 1)}
            disabled={page === 1}
            className="px-3 py-1.5 rounded border border-slate-200 hover:bg-slate-50 disabled:opacity-50"
          >
            Previous
          </button>
          <button
            onClick={() => onPageChange(page + 1)}
            disabled={page * 20 >= data.total}
            className="px-3 py-1.5 rounded border border-slate-200 hover:bg-slate-50 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
