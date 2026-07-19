"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { Activity, ArrowRight, Bell, FileText, HardDrive, Plug, Radar, Server, Shield, KeySquare } from "lucide-react";
import { OPERATIONS_SECTIONS } from "../constants";
import { useSystemHealthQuery, useSystemMetricsQuery } from "../hooks/useOperationsQueries";
import { OperationsPageShell } from "./OperationsPageShell";

const SECTION_ICONS: Record<string, LucideIcon> = {
  "/operations": Activity,
  "/operations/integrations": Plug,
  "/operations/health": Shield,
  "/operations/observability": Radar,
  "/operations/storage": HardDrive,
  "/operations/supplier-runtime": Server,
  "/operations/logs": FileText,
  "/operations/alerts": Bell,
  "/settings/api-keys": KeySquare,
};

export function OperationsDashboardPage() {
  const healthQuery = useSystemHealthQuery();
  const metricsQuery = useSystemMetricsQuery();

  return (
    <OperationsPageShell
      title="Operations Center"
      description="Integrations for APIs and webhooks, plus platform health, observability, storage, and supplier runtime."
      isLoading={healthQuery.isLoading}
      isError={healthQuery.isError}
      errorMessage={healthQuery.error instanceof Error ? healthQuery.error.message : undefined}
      isRefreshing={healthQuery.isFetching || metricsQuery.isFetching}
      onRefresh={async () => {
        await Promise.all([healthQuery.refetch(), metricsQuery.refetch()]);
      }}
      onRetry={() => void healthQuery.refetch()}
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Overall status" value={healthQuery.data?.status ?? "—"} />
        <StatCard label="Modules reported" value={String(healthQuery.data?.modules.length ?? 0)} />
        <StatCard label="Active alerts" value={String(metricsQuery.data?.alerts.length ?? 0)} />
        <StatCard label="Uptime" value={healthQuery.data?.version ? `${Math.floor(healthQuery.data.version.uptimeSeconds / 60)}m` : "—"} />
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-4">Operations sections</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {OPERATIONS_SECTIONS.filter((s) => s.href !== "/operations").map((section) => {
            const Icon = SECTION_ICONS[section.href] ?? Activity;
            const isIntegrations = section.href === "/operations/integrations";
            return (
              <Link
                key={section.href}
                href={section.href}
                className={`flex items-center justify-between rounded-lg border p-4 transition-colors ${
                  isIntegrations
                    ? "border-teal-600/40 bg-teal-50/50 hover:bg-teal-50 dark:border-teal-500/30 dark:bg-teal-950/20 dark:hover:bg-teal-950/40"
                    : "border-border bg-card hover:bg-muted"
                }`}
              >
                <div className="flex items-start gap-3">
                  <Icon className={`h-5 w-5 mt-0.5 ${isIntegrations ? "text-teal-700 dark:text-teal-400" : "text-primary"}`} />
                  <div>
                    <p className="font-medium text-sm">{section.label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{section.description}</p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
              </Link>
            );
          })}
        </div>
      </div>
    </OperationsPageShell>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</p>
      <p className="text-2xl font-bold mt-1 capitalize">{value}</p>
    </div>
  );
}
