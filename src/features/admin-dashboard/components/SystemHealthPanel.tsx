"use client";

import { Activity, Database, HardDrive, Radar, Server } from "lucide-react";
import type { SystemHealthResponse } from "@/lib/admin-api/types";
import { WidgetEmpty, WidgetError, WidgetLoading } from "./WidgetState";

const TRACKED_MODULES = [
  { key: "database", label: "Database", icon: Database },
  { key: "storage", label: "Storage", icon: HardDrive },
  { key: "supplier-runtime", label: "Supplier Runtime", icon: Server },
  { key: "observability", label: "Observability", icon: Radar },
] as const;

function statusClasses(status: string): string {
  const normalized = status.toLowerCase();
  if (normalized === "healthy") return "bg-emerald-100 text-emerald-700";
  if (normalized === "warning" || normalized === "degraded") return "bg-amber-100 text-amber-700";
  return "bg-rose-100 text-rose-700";
}

function overallClasses(status: string): string {
  const normalized = status.toLowerCase();
  if (normalized === "healthy") return "text-emerald-600";
  if (normalized === "degraded") return "text-amber-600";
  return "text-rose-600";
}

function formatStatus(status: string): string {
  return status.replace(/_/g, " ");
}

interface SystemHealthPanelProps {
  isLoading: boolean;
  isError: boolean;
  errorMessage?: string;
  onRetry?: () => void;
  data?: SystemHealthResponse;
}

export function SystemHealthPanel({ isLoading, isError, errorMessage, onRetry, data }: SystemHealthPanelProps) {
  return (
    <div className="rounded-xl border border-border bg-card text-card-foreground shadow-sm p-6">
      <div className="flex items-center justify-between pb-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground">System Health</h2>
          <p className="text-sm text-muted-foreground mt-1">Platform services diagnostics</p>
        </div>
        <Activity className="h-4 w-4 text-muted-foreground" />
      </div>

      {isLoading ? (
        <WidgetLoading />
      ) : isError ? (
        <WidgetError message={errorMessage ?? "Failed to load system health"} onRetry={onRetry} />
      ) : !data ? (
        <WidgetEmpty message="No health data available" />
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border border-border px-4 py-3">
            <span className="text-sm font-medium">Overall Health</span>
            <span className={`text-sm font-semibold uppercase ${overallClasses(data.status)}`}>{formatStatus(data.status)}</span>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {TRACKED_MODULES.map(({ key, label, icon: Icon }) => {
              const module = data.modules.find((entry) => entry.name === key);
              return (
                <div key={key} className="flex items-center justify-between rounded-lg border border-border px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{label}</span>
                  </div>
                  {module ? (
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${statusClasses(module.status)}`}>
                      {formatStatus(module.status)}
                    </span>
                  ) : (
                    <span className="text-xs text-muted-foreground">Not reported</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
