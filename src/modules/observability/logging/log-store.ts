import type { StructuredLogEntry } from "@/shared/logger";
import type { CapturedLogEntry, LogQueryFilter } from "../types/log-entry";

const DEFAULT_CAPACITY = 500;
const DEFAULT_LIST_LIMIT = 100;

/**
 * Bounded in-memory ring buffer — the single sink `console-logger.ts` calls
 * on every log line, from every module, without any of them knowing this
 * exists. Bounded so a long-running process can't leak memory; oldest
 * entries are dropped first once `capacity` is reached.
 */
export class LogStore {
  private readonly entries: CapturedLogEntry[] = [];

  constructor(private readonly capacity: number = DEFAULT_CAPACITY) {}

  record(entry: StructuredLogEntry): void {
    this.entries.push({ timestamp: entry.timestamp, level: entry.level, scope: entry.scope, message: entry.message, meta: entry.meta });
    if (this.entries.length > this.capacity) this.entries.shift();
  }

  list(filter: LogQueryFilter = {}): CapturedLogEntry[] {
    const matches = this.entries.filter((entry) => {
      if (filter.level && entry.level !== filter.level) return false;
      if (filter.scope && !entry.scope.startsWith(filter.scope)) return false;
      return true;
    });
    const limit = filter.limit && filter.limit > 0 ? filter.limit : DEFAULT_LIST_LIMIT;
    return matches.slice(-limit).reverse();
  }

  /** Most recent entry whose scope starts with the given prefix — used by ModuleStatusService to derive "Last Activity" per module. */
  mostRecentForScope(scopePrefix: string): CapturedLogEntry | null {
    for (let i = this.entries.length - 1; i >= 0; i--) {
      if (this.entries[i].scope.startsWith(scopePrefix)) return this.entries[i];
    }
    return null;
  }

  get size(): number {
    return this.entries.length;
  }
}

/** App-wide singleton — installed as the shared logger's sink by `installLogCapture()`. */
export const logStore = new LogStore();
