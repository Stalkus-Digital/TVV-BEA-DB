/** One completed dispatch attempt-sequence (all retries included) — the raw unit every metric and health figure in this runtime is derived from. */
export interface ExecutionRecord {
  key: string;
  supplierCode: string;
  capability: string;
  durationMs: number;
  success: boolean;
  timedOut: boolean;
  circuitRejected: boolean;
  retries: number;
  timestamp: string;
}

export interface ExecutionStats {
  count: number;
  successRate: number;
  avgDurationMs: number;
  totalRetries: number;
  totalTimeouts: number;
  totalFailures: number;
}

const EMPTY_STATS: ExecutionStats = { count: 0, successRate: 1, avgDurationMs: 0, totalRetries: 0, totalTimeouts: 0, totalFailures: 0 };

/** Pure aggregation — shared by `RuntimeMetricsRegistry`'s snapshot and `health/`'s rolling success-rate figures, so the two never compute "success rate" two different ways. */
export function computeExecutionStats(records: ExecutionRecord[]): ExecutionStats {
  if (records.length === 0) return EMPTY_STATS;

  const totalFailures = records.filter((r) => !r.success).length;
  const totalTimeouts = records.filter((r) => r.timedOut).length;
  const totalRetries = records.reduce((sum, r) => sum + r.retries, 0);
  const totalDuration = records.reduce((sum, r) => sum + r.durationMs, 0);

  return {
    count: records.length,
    successRate: (records.length - totalFailures) / records.length,
    avgDurationMs: totalDuration / records.length,
    totalRetries,
    totalTimeouts,
    totalFailures,
  };
}
