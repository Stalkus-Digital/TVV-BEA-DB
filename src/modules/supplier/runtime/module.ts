import { container, createToken, moduleRegistry, type ModuleDefinition } from "@/shared/di";
import { healthCheckRegistry } from "@/shared/health";
import { createLogger } from "@/shared/logger";
import { getSupplierRegistry } from "../module";
import { RuntimeConfigService } from "./config.service";
import { CircuitBreakerRegistry } from "./circuit-breaker/circuit-breaker-registry";
import { RuntimeMetricsRegistry } from "./metrics/runtime-metrics-registry";
import { RuntimeEventBus } from "./events/runtime-event-bus";
import { InMemoryRuntimeCache } from "./cache/in-memory-runtime-cache";
import type { RuntimeCache } from "./cache/runtime-cache";
import { DefaultRoutingPolicy, type RoutingPolicy } from "./policies/routing-policy";
import { SupplierExecutor } from "./executor/supplier-executor";
import { SupplierDispatcher } from "./dispatcher/supplier-dispatcher";
import { SupplierHealthMonitor } from "./health/supplier-health-monitor";
import { SupplierRuntimeHealthCheck } from "./health/supplier-runtime-health-check";

export const CIRCUIT_BREAKER_REGISTRY_TOKEN = createToken<CircuitBreakerRegistry>("supplier.runtime.circuitBreakerRegistry");
export const RUNTIME_METRICS_REGISTRY_TOKEN = createToken<RuntimeMetricsRegistry>("supplier.runtime.metricsRegistry");
export const RUNTIME_EVENT_BUS_TOKEN = createToken<RuntimeEventBus>("supplier.runtime.eventBus");
export const RUNTIME_CACHE_TOKEN = createToken<RuntimeCache>("supplier.runtime.cache");
export const ROUTING_POLICY_TOKEN = createToken<RoutingPolicy>("supplier.runtime.routingPolicy");
export const SUPPLIER_EXECUTOR_TOKEN = createToken<SupplierExecutor>("supplier.runtime.executor");
export const SUPPLIER_DISPATCHER_TOKEN = createToken<SupplierDispatcher>("supplier.runtime.dispatcher");
export const SUPPLIER_HEALTH_MONITOR_TOKEN = createToken<SupplierHealthMonitor>("supplier.runtime.healthMonitor");

/**
 * Registered as its OWN module ("supplier-runtime"), separate from
 * "supplier" — this is the whole mechanism behind "Supplier Engine
 * unchanged": nothing in `src/modules/supplier/module.ts` (or any other
 * existing file in the Supplier Engine or TripJack connector) is edited to
 * wire this in. `getSupplierRegistry()` is that existing module's own
 * public accessor — the same public-service-boundary discipline every
 * other cross-module read in this project already follows, just within
 * two sibling module.ts files instead of two separate top-level modules.
 */
export const supplierRuntimeModule: ModuleDefinition = {
  name: "supplier-runtime",
  register(c) {
    c.registerFactory(CIRCUIT_BREAKER_REGISTRY_TOKEN, () => {
      const config = RuntimeConfigService.getInstance();
      return new CircuitBreakerRegistry({
        failureThreshold: config.get("breakerFailureThreshold"),
        cooldownMs: config.get("breakerCooldownMs"),
        successThreshold: config.get("breakerSuccessThreshold"),
      });
    });
    c.registerFactory(RUNTIME_METRICS_REGISTRY_TOKEN, () => new RuntimeMetricsRegistry());
    c.registerFactory(RUNTIME_EVENT_BUS_TOKEN, () => new RuntimeEventBus());
    c.registerFactory(RUNTIME_CACHE_TOKEN, () => new InMemoryRuntimeCache());
    c.registerFactory(ROUTING_POLICY_TOKEN, () => new DefaultRoutingPolicy());

    c.registerFactory(
      SUPPLIER_EXECUTOR_TOKEN,
      () =>
        new SupplierExecutor({
          breakerRegistry: c.resolve(CIRCUIT_BREAKER_REGISTRY_TOKEN),
          metricsRegistry: c.resolve(RUNTIME_METRICS_REGISTRY_TOKEN),
          eventBus: c.resolve(RUNTIME_EVENT_BUS_TOKEN),
          logger: createLogger("supplier.runtime.executor"),
        })
    );
    c.registerFactory(
      SUPPLIER_DISPATCHER_TOKEN,
      () => new SupplierDispatcher(getSupplierRegistry(), c.resolve(ROUTING_POLICY_TOKEN), c.resolve(SUPPLIER_EXECUTOR_TOKEN))
    );
    c.registerFactory(
      SUPPLIER_HEALTH_MONITOR_TOKEN,
      () => new SupplierHealthMonitor(c.resolve(RUNTIME_METRICS_REGISTRY_TOKEN), c.resolve(CIRCUIT_BREAKER_REGISTRY_TOKEN))
    );
  },
};

if (!moduleRegistry.getModule(supplierRuntimeModule.name)) {
  moduleRegistry.registerModule(supplierRuntimeModule);
  supplierRuntimeModule.register(container);
  healthCheckRegistry.register(new SupplierRuntimeHealthCheck(container.resolve(SUPPLIER_HEALTH_MONITOR_TOKEN)));
}

export function getSupplierDispatcher(): SupplierDispatcher {
  return container.resolve(SUPPLIER_DISPATCHER_TOKEN);
}
export function getSupplierHealthMonitor(): SupplierHealthMonitor {
  return container.resolve(SUPPLIER_HEALTH_MONITOR_TOKEN);
}
export function getRuntimeMetricsRegistry(): RuntimeMetricsRegistry {
  return container.resolve(RUNTIME_METRICS_REGISTRY_TOKEN);
}
export function getRuntimeEventBus(): RuntimeEventBus {
  return container.resolve(RUNTIME_EVENT_BUS_TOKEN);
}
export function getCircuitBreakerRegistry(): CircuitBreakerRegistry {
  return container.resolve(CIRCUIT_BREAKER_REGISTRY_TOKEN);
}
export function getRuntimeCache(): RuntimeCache {
  return container.resolve(RUNTIME_CACHE_TOKEN);
}
