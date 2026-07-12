"use client";

import { useState } from "react";
import { useSystemMetricsQuery } from "../hooks/useOperationsQueries";
import { formatDate } from "../utils";

import { OperationsPageShell } from "./OperationsPageShell";
import { StatusBadge } from "./StatusBadge";

export function AlertsPage() {
  const metricsQuery = useSystemMetricsQuery();
  const alerts = metricsQuery.data?.alerts ?? [];
  // Client-side dismissed alerts (alerts are computed live from system state, not persisted)
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  const alertKey = (alert: any, index: number) => `${alert.source}-${alert.triggeredAt}-${index}`;

  const visibleAlerts = alerts.filter((alert, i) => !dismissed.has(alertKey(alert, i)));

  function dismissAlert(key: string) {
    setDismissed((prev) => new Set([...prev, key]));
  }

  return (
    <OperationsPageShell
      title="Alerts"
      description="Active system alerts and anomaly detections."
      isLoading={metricsQuery.isLoading}
      isError={metricsQuery.isError}
      errorMessage={metricsQuery.error instanceof Error ? metricsQuery.error.message : undefined}
      isRefreshing={metricsQuery.isFetching}
      onRefresh={() => void metricsQuery.refetch()}
      onRetry={() => void metricsQuery.refetch()}
      isEmpty={!metricsQuery.isLoading && !metricsQuery.isError && visibleAlerts.length === 0}
      emptyMessage="No active alerts"
    >
      {dismissed.size > 0 && (
        <p className="text-xs text-muted-foreground mt-4">
          {dismissed.size} alert(s) dismissed for this session.{" "}
          <button
            type="button"
            className="text-primary hover:underline"
            onClick={() => setDismissed(new Set())}
          >
            Restore all
          </button>
        </p>
      )}

      <div className="rounded-xl border border-border overflow-hidden mt-4">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 border-b border-border">
            <tr>
              <th className="text-left px-4 py-3 font-medium">Severity</th>
              <th className="text-left px-4 py-3 font-medium">Module / Source</th>
              <th className="text-left px-4 py-3 font-medium">Triggered</th>
              <th className="text-left px-4 py-3 font-medium">Message</th>
              <th className="text-left px-4 py-3 font-medium">Status</th>
              <th className="text-left px-4 py-3 font-medium">Action</th>
            </tr>
          </thead>
          <tbody>
            {visibleAlerts.map((alert, index) => {
              const key = alertKey(alert, index);
              return (
                <tr key={key} className="border-b border-border last:border-0">
                  <td className="px-4 py-3"><StatusBadge status={alert.severity} /></td>
                  <td className="px-4 py-3 font-medium">{alert.source}</td>
                  <td className="px-4 py-3 text-muted-foreground">{formatDate(alert.triggeredAt)}</td>
                  <td className="px-4 py-3">{alert.message}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-rose-100 text-rose-700">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                      Active
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => dismissAlert(key)}
                      className="text-xs px-2 py-1 border border-border rounded hover:bg-muted transition-colors text-muted-foreground"
                    >
                      Dismiss
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </OperationsPageShell>
  );
}
