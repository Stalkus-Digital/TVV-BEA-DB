export interface RetryPolicyConfig {
  maxAttempts: number;
  baseDelayMs: number;
  maxDelayMs: number;
  jitter: boolean;
}

/**
 * Exponential backoff (`baseDelayMs * 2^(attempt-1)`, capped at `maxDelayMs`)
 * with optional full jitter (uniform random in `[0, cappedDelay]`) — the
 * standard "full jitter" strategy, chosen over no-jitter/equal-jitter
 * because it's the simplest of the well-known variants and avoids
 * thundering-herd retries against a struggling supplier without needing a
 * second random source. `attempt` is 1-indexed (the first retry is
 * attempt 1, not the initial call).
 */
export function computeBackoffDelay(attempt: number, config: RetryPolicyConfig): number {
  const exponential = config.baseDelayMs * 2 ** (attempt - 1);
  const capped = Math.min(exponential, config.maxDelayMs);
  if (!config.jitter) return capped;
  return Math.random() * capped;
}
