import { err, type Result } from "@/shared/types";
import { TimeoutError, type AppError } from "@/shared/errors";

/**
 * Races `operation` against a timer, whichever settles first wins. The
 * `AbortSignal` passed into `operation` is what makes cancellation and
 * timeout the same mechanism — a real future HTTP call (e.g. TripJack's)
 * would pass this straight to `fetch(url, { signal })`, so an actual
 * network request gets aborted too, not just abandoned. An optional
 * `parentSignal` (from `ExecutionContext`) is chained in, so an
 * externally-cancelled dispatch also aborts this specific attempt.
 */
export async function withTimeout<T>(
  operation: (signal: AbortSignal) => Promise<Result<T, AppError>>,
  timeoutMs: number,
  parentSignal?: AbortSignal
): Promise<Result<T, AppError>> {
  const controller = new AbortController();
  const onParentAbort = () => controller.abort();
  parentSignal?.addEventListener("abort", onParentAbort, { once: true });

  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const timeoutPromise = new Promise<Result<T, AppError>>((resolve) => {
      controller.signal.addEventListener(
        "abort",
        () => resolve(err(new TimeoutError(`Operation timed out after ${timeoutMs}ms`))),
        { once: true }
      );
    });
    return await Promise.race([operation(controller.signal), timeoutPromise]);
  } finally {
    clearTimeout(timer);
    parentSignal?.removeEventListener("abort", onParentAbort);
  }
}
