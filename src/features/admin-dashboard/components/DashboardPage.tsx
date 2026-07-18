"use client";

import { RefreshCw } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useDashboardKpis } from "../hooks/useDashboardKpis";
import { useRecentActivity } from "../hooks/useRecentActivity";
import { useRevenueChart } from "../hooks/useRevenueChart";
import { KpiGrid } from "./KpiGrid";
import { RecentActivityPanel } from "./RecentActivityPanel";
import { RevenueChartPanel } from "./RevenueChartPanel";

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Something went wrong";
}

export function DashboardPage() {
  const queryClient = useQueryClient();
  const kpis = useDashboardKpis();
  const activity = useRecentActivity();
  const revenue = useRevenueChart();

  function refreshAll() {
    void queryClient.invalidateQueries({ queryKey: ["admin", "dashboard"] });
  }

  const pageTitle = kpis.data?.pageTitle;
  const pageDescription = kpis.data?.pageDescription;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">
            {kpis.isLoading && !pageTitle ? "…" : pageTitle || "Dashboard"}
          </h1>
          <p className="text-muted-foreground">
            {kpis.isLoading && !pageDescription
              ? "Loading management overview…"
              : pageDescription || "Management overview from Travel OS APIs."}
          </p>
        </div>
        <button
          type="button"
          onClick={refreshAll}
          className="inline-flex items-center gap-2 self-start rounded-md border border-border px-3 py-2 text-sm font-medium hover:bg-muted transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      <KpiGrid
        isLoading={kpis.isLoading}
        isError={kpis.isError}
        errorMessage={kpis.error ? errorMessage(kpis.error) : undefined}
        onRetry={() => void kpis.refetch()}
        data={kpis.data}
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-4">
          <RevenueChartPanel
            isLoading={revenue.isLoading}
            isError={revenue.isError}
            errorMessage={revenue.error ? errorMessage(revenue.error) : undefined}
            onRetry={() => void revenue.refetch()}
            points={revenue.data}
            currency={kpis.data?.revenueCurrency}
          />
        </div>
        <div className="col-span-3">
          <RecentActivityPanel
            isLoading={activity.isLoading}
            isError={activity.isError}
            errorMessage={activity.error ? errorMessage(activity.error) : undefined}
            onRetry={() => void activity.refetch()}
            items={activity.data}
          />
        </div>
      </div>
    </div>
  );
}
