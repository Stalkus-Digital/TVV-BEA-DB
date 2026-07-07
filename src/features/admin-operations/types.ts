export type ModuleStatusValue = "HEALTHY" | "WARNING" | "DEGRADED" | "OFFLINE";

export interface ModuleStatusReport {
  name: string;
  status: ModuleStatusValue;
  latencyMs: number;
  lastActivityAt: string | null;
  details?: Record<string, unknown>;
}

export interface SystemVersionInfo {
  name: string;
  version: string;
  nodeVersion: string;
  environment: string;
  startedAt: string;
  uptimeSeconds: number;
}

export interface SystemHealthView {
  status: string;
  modules: { name: string; status: string; latencyMs: number }[];
  version: SystemVersionInfo;
  generatedAt: string;
}

export interface CounterMetric {
  name: string;
  value: number;
}

export interface MetricsSnapshot {
  counters: CounterMetric[];
  generatedAt: string;
}

export type AlertSeverity = "WARNING" | "CRITICAL";

export interface SystemAlert {
  severity: AlertSeverity;
  source: string;
  message: string;
  triggeredAt: string;
}

export type AuditTimelineCategory = "MODULE_STATUS_CHANGE" | "SLOW_QUERY" | "ALERT_RAISED";

export interface AuditTimelineEntry {
  id: string;
  timestamp: string;
  category: AuditTimelineCategory;
  message: string;
  details?: Record<string, unknown>;
}

export interface SystemMetricsView {
  metrics: MetricsSnapshot;
  alerts: SystemAlert[];
  auditTimeline: AuditTimelineEntry[];
}

export type LogLevel = "debug" | "info" | "warn" | "error";

export interface CapturedLogEntry {
  timestamp: string;
  level: LogLevel;
  scope: string;
  message: string;
  meta?: Record<string, unknown>;
}

export interface SlowQueryEntry {
  query: string;
  durationMs: number;
  timestamp: string;
  isSlow: boolean;
}

export interface SystemPerformanceView {
  slowQueryThresholdMs: number;
  totalQueriesTracked: number;
  slowQueries: SlowQueryEntry[];
  moduleLatencies: { name: string; latencyMs: number }[];
}

export interface ExecutionStats {
  count: number;
  successRate: number;
  avgDurationMs: number;
  totalRetries: number;
  totalTimeouts: number;
  totalFailures: number;
}

export interface RuntimeMetricsSnapshot {
  overall: ExecutionStats;
  byKey: { key: string; stats: ExecutionStats }[];
  generatedAt: string;
}

export interface SupplierRuntimeStatus {
  key: string;
  supplierCode: string;
  capability: string;
  circuitState: string;
  successRate: number;
  avgLatencyMs: number;
  totalExecutions: number;
  lastExecutedAt: string | null;
}

export interface RuntimeHealthView {
  status: string;
  statuses: SupplierRuntimeStatus[];
}

export interface CircuitSnapshot {
  key: string;
  state: string;
  consecutiveFailures: number;
  consecutiveSuccesses: number;
  openedAt: string | null;
  lastTransitionAt: string;
}

export interface RuntimeEvent {
  type: string;
  correlationId: string;
  supplierCode: string;
  capability: string;
  timestamp: string;
  details?: Record<string, unknown>;
}

export type StorageCategory =
  | "PROFILE_IMAGE"
  | "PACKAGE_IMAGE"
  | "DESTINATION_IMAGE"
  | "GALLERY_IMAGE"
  | "INVOICE"
  | "VOUCHER"
  | "PASSPORT"
  | "VISA"
  | "INSURANCE"
  | "TRAVEL_DOCUMENT";

export type StorageVisibility = "PUBLIC" | "PRIVATE";

export interface StorageObject {
  key: string;
  url: string;
  category: StorageCategory;
  visibility: StorageVisibility;
  contentType: string;
  size: number;
  uploadedAt: string;
}

export interface SignedUrlResult {
  url: string;
  expiresAt: number;
}

export interface UploadStorageInput {
  file: File;
  category: StorageCategory;
  ownerId: string;
  fileName?: string;
}

export interface LogsQuery {
  level?: string;
  scope?: string;
  limit?: number;
}
