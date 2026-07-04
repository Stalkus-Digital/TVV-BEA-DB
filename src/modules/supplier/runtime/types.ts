import type { SupplierCapability } from "../types/supplier-capability";

/**
 * Threaded through every layer of a single dispatch — dispatcher, executor,
 * retry, timeouts, circuit-breaker, metrics, events all read from the same
 * context rather than re-deriving correlation id / capability / attempt
 * number independently. `signal` is what makes "Cancellation" (a named
 * Runtime Responsibility) real: any layer can check `signal?.aborted` or
 * pass it to a timeout race.
 */
export interface ExecutionContext {
  readonly correlationId: string;
  readonly capability: SupplierCapability;
  readonly supplierCode: string;
  readonly startedAt: string;
  readonly signal?: AbortSignal;
}

export interface ExecutionOutcome<T> {
  result: T;
  attempts: number;
  durationMs: number;
}
