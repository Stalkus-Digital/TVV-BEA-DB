import type { Logger } from "@/shared/logger/logger.types";

/** A silent Logger for unit-constructing a service directly (BaseService requires one via ServiceContext). */
export function createTestLogger(): Logger {
  return {
    debug: () => {},
    info: () => {},
    warn: () => {},
    error: () => {},
  };
}
