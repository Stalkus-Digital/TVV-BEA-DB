import type { LogLevel, LogMeta } from "@/shared/logger";

/** Mirrors `StructuredLogEntry` from `src/shared/logger/log-sink.ts` — this is the module's own public copy of that shape, kept separate so callers never need to import `shared/logger` internals directly. */
export interface CapturedLogEntry {
  timestamp: string;
  level: LogLevel;
  scope: string;
  message: string;
  meta?: LogMeta;
}

export interface LogQueryFilter {
  level?: LogLevel;
  scope?: string;
  limit?: number;
}
