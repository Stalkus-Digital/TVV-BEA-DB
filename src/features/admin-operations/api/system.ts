import { adminApiClient } from "@/lib/admin-api/client";
import type {
  CapturedLogEntry,
  LogsQuery,
  ModuleStatusReport,
  RuntimeHealthView,
  RuntimeMetricsSnapshot,
  CircuitSnapshot,
  RuntimeEvent,
  SystemHealthView,
  SystemMetricsView,
  SystemPerformanceView,
  SystemVersionInfo,
} from "../types";

export async function fetchSystemHealth(): Promise<SystemHealthView> {
  const result = await adminApiClient.get<SystemHealthView>("/api/system/health", { noAuth: true });
  if (!result) throw new Error("System health unavailable");
  return result;
}

export async function fetchSystemModules(): Promise<ModuleStatusReport[]> {
  const result = await adminApiClient.get<ModuleStatusReport[]>("/api/system/modules");
  return result ?? [];
}

export async function fetchSystemMetrics(): Promise<SystemMetricsView> {
  const result = await adminApiClient.get<SystemMetricsView>("/api/system/metrics");
  if (!result) throw new Error("System metrics unavailable");
  return result;
}

export async function fetchSystemPerformance(): Promise<SystemPerformanceView> {
  const result = await adminApiClient.get<SystemPerformanceView>("/api/system/performance");
  if (!result) throw new Error("System performance unavailable");
  return result;
}

export async function fetchSystemVersion(): Promise<SystemVersionInfo> {
  const result = await adminApiClient.get<SystemVersionInfo>("/api/system/version");
  if (!result) throw new Error("System version unavailable");
  return result;
}

export async function fetchSystemLogs(query: LogsQuery = {}): Promise<CapturedLogEntry[]> {
  const result = await adminApiClient.get<CapturedLogEntry[]>("/api/system/logs", {
    params: {
      level: query.level,
      scope: query.scope,
      limit: query.limit ?? 100,
    },
  });
  return result ?? [];
}

export async function fetchSupplierRuntimeHealth(): Promise<RuntimeHealthView> {
  const result = await adminApiClient.get<RuntimeHealthView>("/api/supplier-runtime/health");
  if (!result) throw new Error("Supplier runtime health unavailable");
  return result;
}

export async function fetchSupplierRuntimeMetrics(): Promise<RuntimeMetricsSnapshot> {
  const result = await adminApiClient.get<RuntimeMetricsSnapshot>("/api/supplier-runtime/metrics");
  if (!result) throw new Error("Supplier runtime metrics unavailable");
  return result;
}

export async function fetchSupplierRuntimeEvents(limit = 50): Promise<RuntimeEvent[]> {
  const result = await adminApiClient.get<RuntimeEvent[]>("/api/supplier-runtime/events", {
    params: { limit },
  });
  return result ?? [];
}

export async function fetchSupplierRuntimeCircuitBreakers(): Promise<CircuitSnapshot[]> {
  const result = await adminApiClient.get<CircuitSnapshot[]>("/api/supplier-runtime/circuit-breakers");
  return result ?? [];
}
