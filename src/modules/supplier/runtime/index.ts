/**
 * Public surface of the Supplier Runtime — a sibling to, not a change to,
 * `src/modules/supplier/index.ts` (that file is untouched by this sprint).
 * Route files import from here directly (`@/modules/supplier/runtime`),
 * never from the parent Supplier Engine's barrel, and never reach into an
 * internal file like `dispatcher/supplier-dispatcher.ts` directly.
 */
export * from "./api";
export {
  getSupplierDispatcher,
  getSupplierHealthMonitor,
  getRuntimeMetricsRegistry,
  getRuntimeEventBus,
  getCircuitBreakerRegistry,
  getRuntimeCache,
} from "./module";
export type { DispatchRequest, DispatchResponse } from "./dispatcher/supplier-dispatcher";
export type { SupplierOperation } from "./timeouts/timeout-policy";
