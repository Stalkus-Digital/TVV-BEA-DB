/**
 * Public surface of the Observability module — same discipline as every
 * other module: internal services/trackers/stores stay internal, only
 * types, API handlers, tracing helpers (needed by `middleware.ts`), and
 * service accessor functions are exported.
 */
export * from "./types";
export * from "./api";
export * from "./tracing";
export { getModuleStatusService, getAuditTimelineService, getAlertService, getSystemDashboardService, recordRequestSeen } from "./module";
