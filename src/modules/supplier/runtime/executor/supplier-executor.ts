import { randomUUID } from "node:crypto";
import { err, isErr, type Result } from "@/shared/types";
import { ServiceUnavailableError, ValidationError, type AppError } from "@/shared/errors";
import type { Logger } from "@/shared/logger";
import type { Supplier } from "../../types/supplier.port";
import type { SupplierCapability } from "../../types/supplier-capability";
import { RuntimeConfigService } from "../config.service";
import { executeWithRetry, type RetryPolicyConfig } from "../retry";
import { resolveTimeoutMs, withTimeout, type SupplierOperation } from "../timeouts";
import { breakerKey, type CircuitBreakerRegistry } from "../circuit-breaker";
import type { RuntimeMetricsRegistry } from "../metrics";
import { RuntimeEventType, type RuntimeEventBus } from "../events";

export interface SupplierExecutorDependencies {
  breakerRegistry: CircuitBreakerRegistry;
  metricsRegistry: RuntimeMetricsRegistry;
  eventBus: RuntimeEventBus;
  logger: Logger;
}

export type SupplierCall<T> = (signal: AbortSignal) => Promise<Result<T, AppError>>;

/**
 * The one place a single supplier call actually gets made — every Runtime
 * Responsibility this sprint names (Timeout Management, Retry Policy,
 * Circuit Breaker, Request Logging, Metrics, Correlation IDs, Cancellation)
 * happens inside `execute()`, in this fixed order: breaker eligibility ->
 * timeout+retry loop -> breaker outcome recording -> metrics recording ->
 * event publication. `dispatcher/` calls this once per supplier it tries;
 * it never talks to a `Supplier` directly itself.
 */
export class SupplierExecutor {
  constructor(private readonly deps: SupplierExecutorDependencies) {}

  async execute<T>(
    supplier: Supplier,
    capability: SupplierCapability,
    operation: SupplierOperation,
    call: SupplierCall<T>,
    parentSignal?: AbortSignal
  ): Promise<Result<T, AppError>> {
    const correlationId = randomUUID();
    const key = breakerKey(supplier.code, capability);
    const breaker = this.deps.breakerRegistry.getOrCreate(key);
    const startedAt = Date.now();

    if (!breaker.canAttempt()) {
      this.deps.logger.warn("Rejected — circuit open", { correlationId, supplier: supplier.code, capability, operation });
      this.publish(RuntimeEventType.CIRCUIT_OPENED, correlationId, supplier.code, capability);
      this.recordMetric(key, supplier.code, capability, 0, false, false, true, 0);
      return err(new ServiceUnavailableError(`Supplier "${supplier.code}" is circuit-broken for capability "${capability}"`));
    }

    this.deps.logger.debug("Request started", { correlationId, supplier: supplier.code, capability, operation });
    this.publish(RuntimeEventType.REQUEST_STARTED, correlationId, supplier.code, capability);

    const timeoutMs = resolveTimeoutMs(operation, capability);
    const retryConfig = this.retryConfig();
    let timedOutAny = false;

    const outcome = await executeWithRetry<T>(
      async () => {
        const attemptResult = await withTimeout(call, timeoutMs, parentSignal);
        if (isErr(attemptResult) && attemptResult.error.name === "TimeoutError") {
          timedOutAny = true;
          this.publish(RuntimeEventType.REQUEST_TIMED_OUT, correlationId, supplier.code, capability);
        }
        return attemptResult;
      },
      retryConfig,
      {
        isRetryable: (error) => !(error instanceof ValidationError),
        onRetry: (attempt, error, delayMs) => {
          this.deps.logger.warn("Retrying", { correlationId, supplier: supplier.code, capability, attempt, delayMs, error: error.message });
          this.publish(RuntimeEventType.REQUEST_RETRIED, correlationId, supplier.code, capability, { attempt, delayMs, error: error.message });
        },
        signal: parentSignal,
      }
    );

    const durationMs = Date.now() - startedAt;
    const retries = outcome.attempts - 1;

    if (isErr(outcome.result)) {
      breaker.recordFailure();
      this.deps.logger.warn("Request failed", { correlationId, supplier: supplier.code, capability, attempts: outcome.attempts, durationMs, error: outcome.result.error.message });
      this.publish(RuntimeEventType.REQUEST_FAILED, correlationId, supplier.code, capability, {
        attempts: outcome.attempts,
        durationMs,
        error: outcome.result.error.message,
      });
      this.recordMetric(key, supplier.code, capability, durationMs, false, timedOutAny, false, retries);
      return outcome.result;
    }

    breaker.recordSuccess();
    this.deps.logger.info("Request completed", { correlationId, supplier: supplier.code, capability, attempts: outcome.attempts, durationMs });
    this.publish(RuntimeEventType.REQUEST_COMPLETED, correlationId, supplier.code, capability, { attempts: outcome.attempts, durationMs });
    this.recordMetric(key, supplier.code, capability, durationMs, true, timedOutAny, false, retries);
    return outcome.result;
  }

  private retryConfig(): RetryPolicyConfig {
    const config = RuntimeConfigService.getInstance();
    return {
      maxAttempts: config.get("retryMaxAttempts"),
      baseDelayMs: config.get("retryBaseDelayMs"),
      maxDelayMs: config.get("retryMaxDelayMs"),
      jitter: config.get("retryJitter"),
    };
  }

  private publish(
    type: (typeof RuntimeEventType)[keyof typeof RuntimeEventType],
    correlationId: string,
    supplierCode: string,
    capability: string,
    details?: Record<string, unknown>
  ): void {
    this.deps.eventBus.publish({ type, correlationId, supplierCode, capability, timestamp: new Date().toISOString(), details });
  }

  private recordMetric(
    key: string,
    supplierCode: string,
    capability: string,
    durationMs: number,
    success: boolean,
    timedOut: boolean,
    circuitRejected: boolean,
    retries: number
  ): void {
    this.deps.metricsRegistry.record({ key, supplierCode, capability, durationMs, success, timedOut, circuitRejected, retries, timestamp: new Date().toISOString() });
  }
}
