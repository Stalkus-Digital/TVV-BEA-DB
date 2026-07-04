/** A single named counter's current value — e.g. `{ name: "requests.seen", value: 412 }`. */
export interface CounterMetric {
  name: string;
  value: number;
}

export interface MetricsSnapshot {
  counters: CounterMetric[];
  generatedAt: string;
}
