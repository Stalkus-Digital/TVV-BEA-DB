import type { MetricsSnapshot } from "../types/metric";

/**
 * Plain in-memory counters — no histograms/gauges this sprint, just named,
 * monotonically-increasing counts (requests seen by middleware, auth
 * outcomes, log lines by level). Deliberately not Prometheus's data model
 * or wire format — "use internal abstractions only" per this sprint.
 */
export class MetricsRegistry {
  private readonly counters = new Map<string, number>();

  increment(name: string, by = 1): void {
    this.counters.set(name, (this.counters.get(name) ?? 0) + by);
  }

  get(name: string): number {
    return this.counters.get(name) ?? 0;
  }

  getSnapshot(): MetricsSnapshot {
    return {
      counters: Array.from(this.counters.entries())
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => a.name.localeCompare(b.name)),
      generatedAt: new Date().toISOString(),
    };
  }

  /** Test-only escape hatch — mirrors Container's own `reset()`. */
  reset(): void {
    this.counters.clear();
  }
}

/** App-wide singleton. */
export const metricsRegistry = new MetricsRegistry();
