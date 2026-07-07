"use client";

import { BACKEND_GAPS } from "../constants";
import { useSupplierRuntimeBundleQuery } from "../hooks/useOperationsQueries";
import { formatDate, formatDurationMs, formatPercent } from "../utils";
import { BackendGapNotice } from "./BackendGapNotice";
import { OperationsPageShell } from "./OperationsPageShell";
import { StatusBadge } from "./StatusBadge";

export function SupplierRuntimePage() {
  const runtime = useSupplierRuntimeBundleQuery();

  return (
    <OperationsPageShell
      title="Supplier Runtime"
      description="Diagnostics from GET /api/supplier-runtime/* — empty until a connector dispatches through the runtime."
      isLoading={runtime.isLoading}
      isError={runtime.isError}
      errorMessage={runtime.error instanceof Error ? runtime.error.message : undefined}
      isRefreshing={runtime.isFetching}
      onRefresh={() => void runtime.refetch()}
      onRetry={() => void runtime.refetch()}
    >
      <BackendGapNotice title="Cache metrics" message={BACKEND_GAPS.runtimeCacheMetrics} />

      <div className="rounded-xl border border-border bg-card p-6 shadow-sm mt-4">
        <div className="flex items-center justify-between gap-4">
          <h3 className="font-semibold">Overall runtime health</h3>
          {runtime.health ? <StatusBadge status={runtime.health.status} /> : null}
        </div>
        {(runtime.health?.statuses.length ?? 0) === 0 && (
          <p className="text-sm text-muted-foreground mt-3">No supplier executions recorded yet — metrics and events will populate after dispatch.</p>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2 mt-6">
        <Panel title="Runtime metrics (overall)">
          {runtime.metrics?.overall.count === 0 ? (
            <p className="text-sm text-muted-foreground">Not available in backend yet — no executions.</p>
          ) : (
            <dl className="space-y-2 text-sm">
              <Row label="Executions" value={String(runtime.metrics?.overall.count ?? 0)} />
              <Row label="Success rate" value={formatPercent(runtime.metrics?.overall.successRate ?? 0)} />
              <Row label="Avg duration" value={formatDurationMs(runtime.metrics?.overall.avgDurationMs ?? 0)} />
              <Row label="Total retries" value={String(runtime.metrics?.overall.totalRetries ?? 0)} />
              <Row label="Total timeouts" value={String(runtime.metrics?.overall.totalTimeouts ?? 0)} />
              <Row label="Total failures" value={String(runtime.metrics?.overall.totalFailures ?? 0)} />
            </dl>
          )}
        </Panel>

        <Panel title="Per supplier+capability">
          {(runtime.metrics?.byKey.length ?? 0) === 0 ? (
            <p className="text-sm text-muted-foreground">Not available in backend yet — no executions.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="py-2">Key</th>
                  <th className="py-2 text-right">Count</th>
                  <th className="py-2 text-right">Success</th>
                </tr>
              </thead>
              <tbody>
                {runtime.metrics?.byKey.map((item) => (
                  <tr key={item.key} className="border-b border-border last:border-0">
                    <td className="py-2 font-mono text-xs">{item.key}</td>
                    <td className="py-2 text-right">{item.stats.count}</td>
                    <td className="py-2 text-right">{formatPercent(item.stats.successRate)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Panel>
      </div>

      <Panel title="Supplier health statuses" className="mt-6">
        {(runtime.health?.statuses.length ?? 0) === 0 ? (
          <p className="text-sm text-muted-foreground">Not available in backend yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="py-2">Supplier</th>
                <th className="py-2">Capability</th>
                <th className="py-2">Circuit</th>
                <th className="py-2 text-right">Success</th>
                <th className="py-2 text-right">Latency</th>
              </tr>
            </thead>
            <tbody>
              {runtime.health?.statuses.map((item) => (
                <tr key={item.key} className="border-b border-border last:border-0">
                  <td className="py-2">{item.supplierCode}</td>
                  <td className="py-2">{item.capability}</td>
                  <td className="py-2"><StatusBadge status={item.circuitState} /></td>
                  <td className="py-2 text-right">{formatPercent(item.successRate)}</td>
                  <td className="py-2 text-right">{formatDurationMs(item.avgLatencyMs)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Panel>

      <Panel title="Circuit breakers" className="mt-6">
        {runtime.circuitBreakers.length === 0 ? (
          <p className="text-sm text-muted-foreground">Not available in backend yet — no breakers registered.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="py-2">Key</th>
                <th className="py-2">State</th>
                <th className="py-2 text-right">Failures</th>
                <th className="py-2 text-right">Last transition</th>
              </tr>
            </thead>
            <tbody>
              {runtime.circuitBreakers.map((item) => (
                <tr key={item.key} className="border-b border-border last:border-0">
                  <td className="py-2 font-mono text-xs">{item.key}</td>
                  <td className="py-2"><StatusBadge status={item.state} /></td>
                  <td className="py-2 text-right">{item.consecutiveFailures}</td>
                  <td className="py-2 text-right text-xs text-muted-foreground">{formatDate(item.lastTransitionAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Panel>

      <Panel title="Runtime events" className="mt-6">
        {runtime.events.length === 0 ? (
          <p className="text-sm text-muted-foreground">Not available in backend yet — no events recorded.</p>
        ) : (
          <div className="space-y-2">
            {runtime.events.map((event, index) => (
              <div key={`${event.timestamp}-${index}`} className="text-sm border-b border-border pb-2">
                <div className="flex justify-between gap-4">
                  <span className="font-medium">{event.type.replace(/_/g, " ")}</span>
                  <span className="text-xs text-muted-foreground">{formatDate(event.timestamp)}</span>
                </div>
                <p className="text-muted-foreground text-xs mt-1">
                  {event.supplierCode} · {event.capability} · correlation {event.correlationId.slice(0, 8)}…
                </p>
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
      <dd className="font-medium">{value}</dd>
    </div>
  );
}
