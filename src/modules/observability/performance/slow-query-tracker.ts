import type { SlowQueryEntry } from "../types/slow-query";

const DEFAULT_CAPACITY = 200;
const DEFAULT_THRESHOLD_MS = 200;

/**
 * Fed by `module.ts`'s `prisma.$on("query", ...)` listener (see
 * `src/shared/database/prisma-client.ts`'s docstring) — this is the one
 * choke point every repository across every module already goes through,
 * so every module's queries are tracked automatically, with zero changes
 * to any repository file. Bounded ring buffer, same discipline as LogStore.
 */
export class SlowQueryTracker {
  private readonly entries: SlowQueryEntry[] = [];

  constructor(
    private readonly capacity: number = DEFAULT_CAPACITY,
    private readonly thresholdMs: number = DEFAULT_THRESHOLD_MS
  ) {}

  record(query: string, durationMs: number, timestamp: string = new Date().toISOString()): void {
    this.entries.push({ query, durationMs, timestamp, isSlow: durationMs >= this.thresholdMs });
    if (this.entries.length > this.capacity) this.entries.shift();
  }

  listSlow(limit = 50): SlowQueryEntry[] {
    return this.entries
      .filter((entry) => entry.isSlow)
      .slice(-limit)
      .reverse();
  }

  listAll(limit = 50): SlowQueryEntry[] {
    return this.entries.slice(-limit).reverse();
  }

  get threshold(): number {
    return this.thresholdMs;
  }

  get totalTracked(): number {
    return this.entries.length;
  }
}

/** App-wide singleton. */
export const slowQueryTracker = new SlowQueryTracker();
