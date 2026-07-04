import { computeExecutionStats, type ExecutionRecord, type ExecutionStats } from "./execution-record";

const DEFAULT_CAPACITY = 500;

export interface RuntimeMetricsSnapshot {
  overall: ExecutionStats;
  byKey: { key: string; stats: ExecutionStats }[];
  generatedAt: string;
}

/**
 * Bounded ring buffer of `ExecutionRecord`s — same discipline as
 * Observability's `LogStore`/`SlowQueryTracker`, deliberately not shared
 * with that module (Runtime stays self-contained; see this sprint's
 * "Runtime isolated" acceptance criterion). `executor/` is the only writer.
 */
export class RuntimeMetricsRegistry {
  private readonly records: ExecutionRecord[] = [];

  constructor(private readonly capacity: number = DEFAULT_CAPACITY) {}

  record(entry: ExecutionRecord): void {
    this.records.push(entry);
    if (this.records.length > this.capacity) this.records.shift();
  }

  forKey(key: string): ExecutionRecord[] {
    return this.records.filter((r) => r.key === key);
  }

  all(): ExecutionRecord[] {
    return [...this.records];
  }

  getSnapshot(): RuntimeMetricsSnapshot {
    const keys = Array.from(new Set(this.records.map((r) => r.key))).sort();
    return {
      overall: computeExecutionStats(this.records),
      byKey: keys.map((key) => ({ key, stats: computeExecutionStats(this.forKey(key)) })),
      generatedAt: new Date().toISOString(),
    };
  }
}
