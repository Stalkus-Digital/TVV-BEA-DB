import { isErr, type Result } from "@/shared/types";
import type { AppError } from "@/shared/errors";
import { computeBackoffDelay, type RetryPolicyConfig } from "./retry-policy";

export interface RetryOutcome<T> {
  result: Result<T, AppError>;
  attempts: number;
}

export type RetryableOperation<T> = (attempt: number) => Promise<Result<T, AppError>>;

export interface RetryOptions {
  /** Defaults to "retry every error" — the executor narrows this so a `ValidationError` (the request itself is malformed) is never retried, only transient failures are. */
  isRetryable?: (error: AppError) => boolean;
  onRetry?: (attempt: number, error: AppError, delayMs: number) => void;
  signal?: AbortSignal;
}

function sleep(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve) => {
    const timer = setTimeout(resolve, ms);
    signal?.addEventListener("abort", () => {
      clearTimeout(timer);
      resolve();
    }, { once: true });
  });
}

/**
 * Runs `operation` up to `config.maxAttempts` times, stopping early on
 * success, a non-retryable error, the last configured attempt, or an
 * aborted `signal` — the mechanics behind this sprint's "Retry Policy"
 * runtime responsibility. Callers never see individual failed attempts;
 * only the final outcome plus how many attempts it took.
 */
export async function executeWithRetry<T>(
  operation: RetryableOperation<T>,
  config: RetryPolicyConfig,
  options: RetryOptions = {}
): Promise<RetryOutcome<T>> {
  const isRetryable = options.isRetryable ?? (() => true);

  for (let attempt = 1; attempt <= config.maxAttempts; attempt++) {
    const result = await operation(attempt);
    if (!isErr(result)) return { result, attempts: attempt };
    if (!isRetryable(result.error)) return { result, attempts: attempt };
    if (attempt === config.maxAttempts) return { result, attempts: attempt };
    if (options.signal?.aborted) return { result, attempts: attempt };

    const delayMs = computeBackoffDelay(attempt, config);
    options.onRetry?.(attempt, result.error, delayMs);
    await sleep(delayMs, options.signal);
  }

  // Only reachable if config.maxAttempts < 1 (a configuration error, not a runtime outcome) — the loop above always returns before falling through for any valid policy.
  throw new Error("executeWithRetry: maxAttempts must be >= 1");
}
