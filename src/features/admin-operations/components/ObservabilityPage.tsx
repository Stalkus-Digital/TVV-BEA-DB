"use client";

import { BACKEND_GAPS } from "../constants";
import { useObservabilityBundleQuery } from "../hooks/useOperationsQueries";
import { formatDate, formatDurationMs, formatUptime } from "../utils";
import { BackendGapNotice } from "./BackendGapNotice";
import { OperationsPageShell } from "./OperationsPageShell";
import { StatusBadge } from "./StatusBadge";

export function ObservabilityPage() {
  const obs = useObservabilityBundleQuery();

  return (
    <OperationsPageShell
      title="Observability"
      description="Metrics, performance, and audit timeline from existing /api/system/* endpoints."
      isLoading={obs.isLoading}
      isError={obs.isError}
      errorMessage={obs.error instanceof Error ? obs.error.message : undefined}
      isRefreshing={obs.isFetching}
      onRefresh={() => void obs.refetch()}
      onRetry={() => void obs.refetch()}
    >
      <BackendGapNotice title="No dashboard endpoint" message={BACKEND_GAPS.systemDashboard} />
      <BackendGapNotice title="Request counters" message={BACKEND_GAPS.requestCounters} />

      <div className="grid gap-6 lg:grid-cols-2 mt-6">
        <Panel title="System version">
          {obs.version ? (
            <dl className="space-y-2 text-sm">
              <Row label="Name" value={obs.version.name} />
              <Row label="Version" value={obs.version.version} />
              <Row label="Node" value={obs.version.nodeVersion} />
              <Row label="Environment" value={obs.version.environment} />
              <Row label="Uptime" value={formatUptime(obs.version.uptimeSeconds)} />
              <Row label="Started" value={formatDate(obs.version.startedAt)} />
            </dl>
          ) : (
            <EmptyNote />
          )}
        </Panel>

        <Panel title="Performance summary">
          {obs.performance ? (
            <dl className="space-y-2 text-sm">
              <Row label="Queries tracked" value={String(obs.performance.totalQueriesTracked)} />
              <Row label="Slow query threshold" value={formatDurationMs(obs.performance.slowQueryThresholdMs)} />
              <Row label="Slow queries" value={String(obs.performance.slowQueries.length)} />
              <Row label="Module latency samples" value={String(obs.performance.moduleLatencies.length)} />
            </dl>
          ) : (
            <EmptyNote />
          )}
        </Panel>
      </div>

      <Panel title="Request counters" className="mt-6">
        {(obs.metrics?.metrics.counters.length ?? 0) === 0 ? (
          <p className="text-sm text-muted-foreground">No counters reported — see middleware isolation note above.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="py-2 font-medium">Counter</th>
                <th className="py-2 font-medium text-right">Value</th>
              </tr>
            </thead>
            <tbody>
              {obs.metrics?.metrics.counters.map((counter) => (
                <tr key={counter.name} className="border-b border-border last:border-0">
                  <td className="py-2 font-mono text-xs">{counter.name}</td>
                  <td className="py-2 text-right">{counter.value.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Panel>

      <Panel title="Module activity (latency)" className="mt-6">
        {(obs.performance?.moduleLatencies.length ?? 0) === 0 ? (
          <p className="text-sm text-muted-foreground">No module latency data yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="py-2 font-medium">Module</th>
                <th className="py-2 font-medium text-right">Latency</th>
              </tr>
            </thead>
            <tbody>
              {obs.performance?.moduleLatencies.map((item) => (
                <tr key={item.name} className="border-b border-border last:border-0">
                  <td className="py-2">{item.name}</td>
                  <td className="py-2 text-right">{formatDurationMs(item.latencyMs)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Panel>

      <Panel title="Slow queries" className="mt-6">
        {(obs.performance?.slowQueries.length ?? 0) === 0 ? (
          <p className="text-sm text-muted-foreground">No slow queries recorded.</p>
        ) : (
          <div className="space-y-3">
            {obs.performance?.slowQueries.map((query, index) => (
              <div key={`${query.timestamp}-${index}`} className="rounded-lg border border-border p-3 text-sm">
                <div className="flex justify-between gap-4 mb-1">
                  <span className="font-medium">{formatDurationMs(query.durationMs)}</span>
                  <span className="text-xs text-muted-foreground">{formatDate(query.timestamp)}</span>
                </div>
                <p className="font-mono text-xs text-muted-foreground break-all">{query.query}</p>
              </div>
            ))}
          </div>
        )}
      </Panel>

      <Panel title="Audit timeline" className="mt-6">
        {(obs.metrics?.auditTimeline.length ?? 0) === 0 ? (
          <p className="text-sm text-muted-foreground">No audit timeline entries yet.</p>
        ) : (
          <div className="space-y-2">
            {obs.metrics?.auditTimeline.map((entry) => (
              <div key={entry.id} className="flex gap-3 text-sm border-b border-border pb-2 last:border-0">
                <span className="text-xs text-muted-foreground whitespace-nowrap">{formatDate(entry.timestamp)}</span>
                <div>
                  <p className="font-medium">{entry.category.replace(/_/g, " ")}</p>
                  <p className="text-muted-foreground">{entry.message}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Panel>

      <Panel title="Active alerts (from metrics)" className="mt-6">
        {(obs.metrics?.alerts.length ?? 0) === 0 ? (
          <p className="text-sm text-muted-foreground">No active alerts.</p>
        ) : (
          <div className="space-y-2">
            {obs.metrics?.alerts.map((alert, index) => (
              <div key={`${alert.source}-${alert.triggeredAt}-${index}`} className="flex items-start justify-between gap-4 text-sm border-b border-border pb-2">
                <div>
                  <StatusBadge status={alert.severity} />
                  <p className="mt-1 font-medium">{alert.source}</p>
                  <p className="text-muted-foreground">{alert.message}</p>
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap">{formatDate(alert.triggeredAt)}</span>
              </div>
            ))}
          </div>
        )}
      </Panel>
    </OperationsPageShell>
  );
}

function Panel({ title, children, className }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-xl border border-border bg-card p-6 shadow-sm ${className ?? ""}`}>
      <h3 className="font-semibold mb-4">{title}</h3>
      {children}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-medium text-right">{value}</dd>
    </div>
  );
}

function EmptyNote() {
  return <p className="text-sm text-muted-foreground">Not available</p>;
}
