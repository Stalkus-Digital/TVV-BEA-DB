import { ConsoleLogger } from "./console-logger";
import type { Logger, LogLevel } from "./logger.types";

/**
 * Every module/service/repository should obtain its logger through this
 * factory, scoped to its own name (e.g. createLogger("supplier.service")) —
 * never instantiate ConsoleLogger directly outside this file.
 */
export function createLogger(scope: string, minLevel?: LogLevel): Logger {
  return new ConsoleLogger({ scope, minLevel });
}
