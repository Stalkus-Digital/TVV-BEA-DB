import type { LogLevel } from "./types";

export const OPERATIONS_SECTIONS = [
  { href: "/operations", label: "Operations Dashboard", description: "Platform services overview" },
  { href: "/operations/health", label: "System Health", description: "Module status and latency" },
  { href: "/operations/observability", label: "Observability", description: "Metrics, performance, audit timeline" },
  { href: "/operations/storage", label: "Storage", description: "Uploads and signed URLs" },
  { href: "/operations/supplier-runtime", label: "Supplier Runtime", description: "Circuit breakers and dispatch metrics" },
  { href: "/operations/logs", label: "System Logs", description: "Captured application logs" },
  { href: "/operations/alerts", label: "Alerts", description: "Active system alerts" },
] as const;

/** Preferred display order for health cards — modules not yet registered are shown separately. */
export const PREFERRED_HEALTH_MODULES = [
  { key: "database", label: "Database" },
  { key: "storage", label: "Storage" },
  { key: "auth", label: "Authentication" },
  { key: "customer", label: "Customer Module" },
  { key: "inventory", label: "Inventory Module" },
  { key: "destination", label: "Destination Module" },
  { key: "package", label: "Package Module" },
  { key: "quote", label: "Quote Module" },
  { key: "booking", label: "Booking Module" },
  { key: "supplier-runtime", label: "Supplier Runtime" },
  { key: "observability", label: "Observability" },
] as const;

export const LOG_LEVELS: LogLevel[] = ["debug", "info", "warn", "error"];

export const PUBLIC_STORAGE_CATEGORIES = [
  "PROFILE_IMAGE",
  "PACKAGE_IMAGE",
  "DESTINATION_IMAGE",
  "GALLERY_IMAGE",
] as const;

export const PRIVATE_STORAGE_CATEGORIES = [
  "INVOICE",
  "VOUCHER",
  "PASSPORT",
  "VISA",
  "INSURANCE",
  "TRAVEL_DOCUMENT",
] as const;

export const UPLOAD_CATEGORIES = [
  { value: "GALLERY_IMAGE" as const, label: "Gallery image (public)" },
  { value: "DESTINATION_IMAGE" as const, label: "Destination image (public)" },
  { value: "PACKAGE_IMAGE" as const, label: "Package image (public)" },
  { value: "INVOICE" as const, label: "Invoice (private)" },
];

export const BACKEND_GAPS = {
  systemDashboard: "GET /api/system/dashboard does not exist — use /api/system/modules, /api/system/metrics, and /api/system/performance.",
  systemAlertsEndpoint: "GET /api/system/alerts does not exist — alerts are returned inside GET /api/system/metrics.",
  requestCounters: "Middleware request counters are not visible to /api/system/metrics due to Next.js middleware/route-handler process isolation (documented in docs/34).",
  logCorrelationIds: "Captured log entries do not include requestId/correlationId in meta — HTTP headers carry them separately.",
  alertResolvedStatus: "Alert model has no resolved/acknowledged field — alerts are evaluated fresh on each metrics request.",
  storageList: "No GET /api/storage/list — uploads can be created, metadata fetched by key, and deleted; no browse API.",
  runtimeCacheMetrics: "RuntimeCache abstraction exists but has no metrics endpoint and no consumer yet.",
} as const;
