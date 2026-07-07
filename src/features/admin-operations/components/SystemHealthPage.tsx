"use client";

import { PREFERRED_HEALTH_MODULES } from "../constants";
import { useSystemHealthQuery, useSystemModulesQuery } from "../hooks/useOperationsQueries";
import {
  findModule,
  formatDate,
  formatDurationMs,
  formatUptime,
  resolveModuleMessage,
} from "../utils";
import { OperationsPageShell } from "./OperationsPageShell";
import { StatusBadge } from "./StatusBadge";

export function SystemHealthPage() {
  const healthQuery = useSystemHealthQuery();
  const modulesQuery = useSystemModulesQuery();
  const modules = modulesQuery.data ?? [];

  const isLoading = healthQuery.isLoading || modulesQuery.isLoading;
  const isError = healthQuery.isError || modulesQuery.isError;
  const error = healthQuery.error ?? modulesQuery.error;

  return (
    <OperationsPageShell
      title="System Health"
      description="Module status from GET /api/system/modules with overall summary from GET /api/system/health."
      isLoading={isLoading}
      isError={isError}
      errorMessage={error instanceof Error ? error.message : undefined}
      isRefreshing={healthQuery.isFetching || modulesQuery.isFetching}
      onRefresh={async () => {
        await Promise.all([healthQuery.refetch(), modulesQuery.refetch()]);
      }}
      onRetry={() => void modulesQuery.refetch()}
    >
      {healthQuery.data && (
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm mb-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Overall status</p>
              <div className="mt-2">
                <StatusBadge status={healthQuery.data.status} />
              </div>
            </div>
            <div className="text-sm text-muted-foreground space-y-1 text-right">
              <p>Version {healthQuery.data.version.version}</p>
              <p>Uptime {formatUptime(healthQuery.data.version.uptimeSeconds)}</p>
              <p>Checked {formatDate(healthQuery.data.generatedAt)}</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {PREFERRED_HEALTH_MODULES.map(({ key, label }) => {
          const module = findModule(modules, key);
          return (
            <ModuleHealthCard key={key} label={label} module={module} />
          );
        })}
      </div>

      {modules.filter((m) => !PREFERRED_HEALTH_MODULES.some((p) => p.key === m.name)).length > 0 && (
        <section className="mt-8">
          <h2 className="text-lg font-semibold mb-4">Other registered modules</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {modules
              .filter((m) => !PREFERRED_HEALTH_MODULES.some((p) => p.key === m.name))
              .map((module) => (
                <ModuleHealthCard key={module.name} label={module.name} module={module} />
              ))}
          </div>
        </section>
      )}
    </OperationsPageShell>
  );
}

function ModuleHealthCard({
  label,
  module,
}: {
  label: string;
  module: ReturnType<typeof findModule>;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-3">
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-semibold text-sm">{label}</h3>
        {module ? <StatusBadge status={module.status} /> : (
          <span className="text-xs text-muted-foreground">Not reported</span>
        )}
      </div>
      <dl className="space-y-1.5 text-xs">
        <Row label="Latency" value={module ? formatDurationMs(module.latencyMs) : "—"} />
        <Row label="Last check" value={module?.lastActivityAt ? formatDate(module.lastActivityAt) : "—"} />
        <Row label="Message" value={resolveModuleMessage(module)} />
      </dl>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-medium mt-0.5 break-words">{value}</dd>
    </div>
  );
}
