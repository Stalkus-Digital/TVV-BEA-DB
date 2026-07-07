import type { ModuleStatusReport } from "./types";

export function formatDate(value: string): string {
  return new Date(value).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export function formatDurationMs(ms: number): string {
  if (ms < 1) return "<1 ms";
  if (ms < 1000) return `${Math.round(ms)} ms`;
  return `${(ms / 1000).toFixed(2)} s`;
}

export function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${mins}m`;
  return `${mins}m`;
}

export function formatPercent(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function statusBadgeClass(status: string): string {
  const normalized = status.toUpperCase();
  if (normalized === "HEALTHY" || normalized === "healthy") return "bg-emerald-100 text-emerald-700";
  if (normalized === "WARNING" || normalized === "DEGRADED" || normalized === "degraded") return "bg-amber-100 text-amber-700";
  if (normalized === "OFFLINE" || normalized === "UNHEALTHY" || normalized === "unhealthy") return "bg-rose-100 text-rose-700";
  if (normalized === "OPEN") return "bg-rose-100 text-rose-700";
  if (normalized === "HALF_OPEN") return "bg-amber-100 text-amber-700";
  if (normalized === "CLOSED") return "bg-emerald-100 text-emerald-700";
  return "bg-muted text-muted-foreground";
}

export function formatStatusLabel(status: string): string {
  return status.replace(/_/g, " ");
}

export function resolveModuleMessage(module: ModuleStatusReport | undefined): string {
  if (!module) return "Not registered in this process yet";
  if (module.details?.reason && typeof module.details.reason === "string") return module.details.reason;
  if (module.details?.message && typeof module.details.message === "string") return module.details.message;
  return `Status ${formatStatusLabel(module.status)} · ${formatDurationMs(module.latencyMs)} latency`;
}

export function findModule(modules: ModuleStatusReport[], key: string): ModuleStatusReport | undefined {
  return modules.find((m) => m.name === key);
}
