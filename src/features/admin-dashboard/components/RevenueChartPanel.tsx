"use client";

import type { RevenueMonthPoint } from "@/lib/admin-api/types";
import { WidgetEmpty, WidgetError, WidgetLoading } from "./WidgetState";

interface RevenueChartPanelProps {
  isLoading: boolean;
  isError: boolean;
  errorMessage?: string;
  onRetry?: () => void;
  points?: RevenueMonthPoint[];
  currency?: string;
}

export function RevenueChartPanel({
  isLoading,
  isError,
  errorMessage,
  onRetry,
  points = [],
  currency = "INR",
}: RevenueChartPanelProps) {
  const maxAmount = Math.max(...points.map((point) => point.amount), 0);

  return (
    <div className="rounded-xl border border-border bg-card text-card-foreground shadow-sm p-6">
      <div className="flex flex-col space-y-1.5 pb-4">
        <h3 className="font-semibold leading-none tracking-tight">Revenue Overview</h3>
        <p className="text-sm text-muted-foreground">Manual payments collected by month.</p>
      </div>

      {isLoading ? (
        <WidgetLoading />
      ) : isError ? (
        <WidgetError message={errorMessage ?? "Failed to load revenue data"} onRetry={onRetry} />
      ) : points.length === 0 || maxAmount === 0 ? (
        <WidgetEmpty message="No payment data yet" />
      ) : (
        <div className="h-[300px] flex items-end gap-3 pt-4">
          {points.map((point) => {
            const height = Math.max(12, Math.round((point.amount / maxAmount) * 220));
            return (
              <div key={point.month} className="flex-1 flex flex-col items-center justify-end gap-2 min-w-0">
                <div
                  className="w-full rounded-t-md bg-primary/80"
                  style={{ height }}
                  title={`${point.label}: ${point.amount.toLocaleString("en-IN")} ${currency}`}
                />
                <div className="text-[11px] text-muted-foreground text-center truncate w-full">{point.label}</div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
