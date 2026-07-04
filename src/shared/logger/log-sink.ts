import type { LogLevel, LogMeta } from "./logger.types";

export interface StructuredLogEntry {
  timestamp: string;
  level: LogLevel;
  scope: string;
  message: string;
  meta?: LogMeta;
}

export type LogSink = (entry: StructuredLogEntry) => void;

let sink: LogSink | null = null;

/**
 * Optional capture hook for every log line this process emits — `null` by
 * default, meaning `ConsoleLogger` behaves exactly as it always has (stdout
 * only). The Observability module (`src/modules/observability/logging`) is
 * the only intended caller of `setLogSink`, registering its ring buffer
 * here as a side effect of being imported, the same self-registration
 * convention every module already uses for the DI container and health
 * registry. Kept in `src/shared/logger` (not the Observability module)
 * because `console-logger.ts` needs to call it and `shared/*` may never
 * depend on `modules/*`.
 */
export function setLogSink(next: LogSink | null): void {
  sink = next;
}

export function emitToLogSink(entry: StructuredLogEntry): void {
  sink?.(entry);
}
