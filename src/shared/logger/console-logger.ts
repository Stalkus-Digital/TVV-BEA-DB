import type { Logger, LogLevel, LogMeta } from "./logger.types";
import { emitToLogSink } from "./log-sink";

const LEVEL_ORDER: Record<LogLevel, number> = { debug: 10, info: 20, warn: 30, error: 40 };

export interface ConsoleLoggerOptions {
  scope: string;
  minLevel?: LogLevel;
}

/**
 * Zero-dependency structured logger. No logging library (pino/winston) is
 * installed yet — this is the intentional placeholder implementation behind
 * the `Logger` interface; swapping it out later means changing this one file,
 * not every call site, since every call site depends on `Logger`, not this class.
 */
export class ConsoleLogger implements Logger {
  private readonly scope: string;
  private readonly minLevel: LogLevel;

  constructor(options: ConsoleLoggerOptions) {
    this.scope = options.scope;
    this.minLevel = options.minLevel ?? "debug";
  }

  debug(message: string, meta?: LogMeta): void {
    this.write("debug", message, meta);
  }

  info(message: string, meta?: LogMeta): void {
    this.write("info", message, meta);
  }

  warn(message: string, meta?: LogMeta): void {
    this.write("warn", message, meta);
  }

  error(message: string, meta?: LogMeta): void {
    this.write("error", message, meta);
  }

  private write(level: LogLevel, message: string, meta?: LogMeta): void {
    if (LEVEL_ORDER[level] < LEVEL_ORDER[this.minLevel]) return;
    const entry = {
      timestamp: new Date().toISOString(),
      level,
      scope: this.scope,
      message,
      ...(meta ? { meta } : {}),
    };
    const line = JSON.stringify(entry);
    if (level === "error") console.error(line);
    else if (level === "warn") console.warn(line);
    else console.log(line);
    emitToLogSink(entry);
  }
}
