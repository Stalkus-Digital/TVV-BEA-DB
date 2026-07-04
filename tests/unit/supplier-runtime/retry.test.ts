import { describe, expect, it } from "vitest";
import { isErr, isOk, ok, err, type Result } from "@/shared/types";
import { InternalError, ValidationError, type AppError } from "@/shared/errors";
import { computeBackoffDelay, type RetryPolicyConfig } from "@/modules/supplier/runtime/retry/retry-policy";
import { executeWithRetry } from "@/modules/supplier/runtime/retry/retry-executor";

describe("computeBackoffDelay", () => {
  const config: RetryPolicyConfig = { maxAttempts: 5, baseDelayMs: 100, maxDelayMs: 2000, jitter: false };

  it("doubles the delay with each attempt (exponential)", () => {
    expect(computeBackoffDelay(1, config)).toBe(100);
    expect(computeBackoffDelay(2, config)).toBe(200);
    expect(computeBackoffDelay(3, config)).toBe(400);
    expect(computeBackoffDelay(4, config)).toBe(800);
  });

  it("caps the delay at maxDelayMs", () => {
    expect(computeBackoffDelay(10, config)).toBe(2000);
  });

  it("without jitter, the delay is deterministic", () => {
    expect(computeBackoffDelay(2, config)).toBe(computeBackoffDelay(2, config));
  });

  it("with jitter, the delay is between 0 and the capped exponential value", () => {
    const jittered: RetryPolicyConfig = { ...config, jitter: true };
    for (let i = 0; i < 20; i++) {
      const delay = computeBackoffDelay(3, jittered);
      expect(delay).toBeGreaterThanOrEqual(0);
      expect(delay).toBeLessThanOrEqual(400);
    }
  });
});

describe("executeWithRetry", () => {
  const config: RetryPolicyConfig = { maxAttempts: 3, baseDelayMs: 1, maxDelayMs: 5, jitter: false };

  it("returns immediately on first-attempt success", async () => {
    const outcome = await executeWithRetry<number>(async () => ok(42), config);
    expect(outcome.attempts).toBe(1);
    expect(isOk(outcome.result)).toBe(true);
    if (isOk(outcome.result)) expect(outcome.result.value).toBe(42);
  });

  it("retries on failure and succeeds on a later attempt", async () => {
    let calls = 0;
    const outcome = await executeWithRetry<number>(async () => {
      calls += 1;
      if (calls < 3) return err(new InternalError("transient"));
      return ok(99);
    }, config);
    expect(calls).toBe(3);
    expect(outcome.attempts).toBe(3);
    expect(isOk(outcome.result)).toBe(true);
  });

  it("exhausts maxAttempts and returns the last failure", async () => {
    let calls = 0;
    const outcome = await executeWithRetry<number>(async () => {
      calls += 1;
      return err(new InternalError(`fail-${calls}`));
    }, config);
    expect(calls).toBe(3);
    expect(outcome.attempts).toBe(3);
    expect(isErr(outcome.result)).toBe(true);
    if (isErr(outcome.result)) expect(outcome.result.error.message).toBe("fail-3");
  });

  it("stops immediately on a non-retryable error, without exhausting attempts", async () => {
    let calls = 0;
    const outcome = await executeWithRetry<number>(
      async () => {
        calls += 1;
        return err(new ValidationError("bad request"));
      },
      config,
      { isRetryable: (error) => !(error instanceof ValidationError) }
    );
    expect(calls).toBe(1);
    expect(outcome.attempts).toBe(1);
  });

  it("invokes onRetry with the attempt number, error, and computed delay", async () => {
    const retries: { attempt: number; delayMs: number }[] = [];
    let calls = 0;
    await executeWithRetry<number>(
      async () => {
        calls += 1;
        if (calls < 2) return err(new InternalError("transient"));
        return ok(1);
      },
      config,
      { onRetry: (attempt, _error, delayMs) => retries.push({ attempt, delayMs }) }
    );
    expect(retries).toHaveLength(1);
    expect(retries[0].attempt).toBe(1);
  });

  it("stops retrying once the signal is already aborted after a failed attempt", async () => {
    const controller = new AbortController();
    let calls = 0;
    const outcome = await executeWithRetry<number>(
      async () => {
        calls += 1;
        if (calls === 1) controller.abort();
        return err(new InternalError("transient")) as Result<number, AppError>;
      },
      config,
      { signal: controller.signal }
    );
    expect(calls).toBe(1);
    expect(outcome.attempts).toBe(1);
  });
});
