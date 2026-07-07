"use client";

import { Loader2, RefreshCw } from "lucide-react";
import { WidgetEmpty, WidgetError, WidgetLoading } from "@/features/admin-dashboard/components/WidgetState";

interface CmsPageShellProps {
  title: string;
  description: string;
  isLoading?: boolean;
  isError?: boolean;
  errorMessage?: string;
  isRefreshing?: boolean;
  onRefresh?: () => void;
  onRetry?: () => void;
  isEmpty?: boolean;
  emptyMessage?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
}

export function CmsPageShell({
  title,
  description,
  isLoading,
  isError,
  errorMessage,
  isRefreshing,
  onRefresh,
  onRetry,
  isEmpty,
  emptyMessage,
  children,
  actions,
}: CmsPageShellProps) {
  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {actions}
          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              disabled={isRefreshing}
              className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md border border-border bg-card hover:bg-muted disabled:opacity-50"
            >
              {isRefreshing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              Refresh
            </button>
          )}
        </div>
      </div>

      {isLoading ? (
        <WidgetLoading label="Loading content…" />
      ) : isError ? (
        <WidgetError
          message={errorMessage ?? "Failed to load content"}
          onRetry={onRetry}
        />
      ) : isEmpty ? (
        <WidgetEmpty message={emptyMessage ?? "No content found"} />
      ) : (
        children
      )}
    </div>
  );
}
