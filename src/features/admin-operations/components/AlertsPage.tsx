"use client";

import { BACKEND_GAPS } from "../constants";
import { useSystemMetricsQuery } from "../hooks/useOperationsQueries";
import { formatDate } from "../utils";
import { BackendGapNotice } from "./BackendGapNotice";
import { OperationsPageShell } from "./OperationsPageShell";
import { StatusBadge } from "./StatusBadge";

export function AlertsPage() {
  const metricsQuery = useSystemMetricsQuery();
  const alerts = metricsQuery.data?.alerts ?? [];

  return (
    <OperationsPageShell
      title="Alerts"
      description="Active alerts from GET /api/system/metrics — evaluated fresh on each request."
      isLoading={metricsQuery.isLoading}
      isError={metricsQuery.isError}
      errorMessage={metricsQuery.error instanceof Error ? metricsQuery.error.message : undefined}
      isRefreshing={metricsQuery.isFetching}
      onRefresh={() => void metricsQuery.refetch()}
      onRetry={() => void metricsQuery.refetch()}
      isEmpty={!metricsQuery.isLoading && !metricsQuery.isError && alerts.length === 0}
      emptyMessage="No active alerts"
    >
      <BackendGapNotice title="No dedicated alerts endpoint" message={BACKEND_GAPS.systemAlertsEndpoint} />
      <BackendGapNotice title="Resolved status" message={BACKEND_GAPS.alertResolvedStatus} />

      <div className="rounded-xl border border-border overflow-hidden mt-4">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 border-b border-border">
            <tr>
              <th className="text-left px-4 py-3 font-medium">Severity</th>
              <th className="text-left px-4 py-3 font-medium">Module / Source</th>
              <th className="text-left px-4 py-3 font-medium">Created</th>
              <th className="text-left px-4 py-3 font-medium">Message</th>
              <th className="text-left px-4 py-3 font-medium">Resolved</th>
            </tr>
          </thead>
          <tbody>
            {alerts.map((alert, index) => (
              <tr key={`${alert.source}-${alert.triggeredAt}-${index}`} className="border-b border-border last:border-0">
                <td className="px-4 py-3"><StatusBadge status={alert.severity} /></td>
                <td className="px-4 py-3 font-medium">{alert.source}</td>
                <td className="px-4 py-3 text-muted-foreground">{formatDate(alert.triggeredAt)}</td>
                <td className="px-4 py-3">{alert.message}</td>
                <td className="px-4 py-3 text-muted-foreground">—</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </OperationsPageShell>
  );
}
