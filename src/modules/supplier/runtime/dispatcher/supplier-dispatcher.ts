import { isErr, err, type Result } from "@/shared/types";
import { NotFoundError, type AppError } from "@/shared/errors";
import type { Supplier } from "../../types/supplier.port";
import type { SupplierCapability } from "../../types/supplier-capability";
import type { SupplierRegistry } from "../../services/supplier-registry";
import type { RoutingPolicy } from "../policies/routing-policy";
import type { SupplierExecutor } from "../executor/supplier-executor";
import type { SupplierOperation } from "../timeouts/timeout-policy";

export interface DispatchRequest<T> {
  capability: SupplierCapability;
  operation: SupplierOperation;
  call: (supplier: Supplier, signal: AbortSignal) => Promise<Result<T, AppError>>;
  signal?: AbortSignal;
  /** Try only this one supplier, skipping routing/failover — for a follow-up call (e.g. `details()` after a `search()` result) that must stay pinned to the supplier that produced the original result. */
  preferredSupplierCode?: string;
}

export interface DispatchResponse<T> {
  supplierCode: string;
  result: Result<T, AppError>;
}

/**
 * This sprint's own flow diagram, implemented literally: Accept Supplier
 * Capability -> Find matching suppliers -> Apply routing policy -> Execute
 * -> Return normalized response. Never talks to a `Supplier` directly —
 * `SupplierExecutor` owns every actual call, this class only decides WHICH
 * supplier(s), in what order.
 *
 * Failover is sequential, not fan-out: if the first supplier in policy
 * order is rejected (circuit open) or fails outright, the next one is
 * tried; the dispatcher returns as soon as one succeeds, or the last
 * attempted outcome if none did. Concurrently fanning the same request out
 * to multiple real suppliers is a business decision (cost, duplicate
 * bookings) deliberately left out of this infrastructure-only sprint.
 */
export class SupplierDispatcher {
  constructor(
    private readonly registry: SupplierRegistry,
    private readonly routingPolicy: RoutingPolicy,
    private readonly executor: SupplierExecutor
  ) {}

  async dispatch<T>(request: DispatchRequest<T>): Promise<DispatchResponse<T>> {
    const candidates = this.findCandidates(request);
    if (candidates.length === 0) {
      return { supplierCode: "", result: err(new NotFoundError(`No supplier registered for capability "${request.capability}"`)) };
    }

    const [first, ...rest] = this.routingPolicy.order(candidates);
    let outcome = await this.attempt(first, request);
    if (!isErr(outcome.result)) return outcome;

    for (const supplier of rest) {
      outcome = await this.attempt(supplier, request);
      if (!isErr(outcome.result)) return outcome;
    }
    return outcome;
  }

  private async attempt<T>(supplier: Supplier, request: DispatchRequest<T>): Promise<DispatchResponse<T>> {
    const result = await this.executor.execute<T>(
      supplier,
      request.capability,
      request.operation,
      (signal) => request.call(supplier, signal),
      request.signal
    );
    return { supplierCode: supplier.code, result };
  }

  private findCandidates<T>(request: DispatchRequest<T>): Supplier[] {
    const byCapability = this.registry.getSuppliersByCapability(request.capability);
    if (!request.preferredSupplierCode) return byCapability;
    return byCapability.filter((supplier) => supplier.code === request.preferredSupplierCode);
  }
}
