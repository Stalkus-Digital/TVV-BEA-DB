import { CircuitBreaker } from "./circuit-breaker";
import type { CircuitBreakerConfig, CircuitSnapshot } from "./circuit-state";
import type { SupplierCapability } from "../../types/supplier-capability";

/** Keyed by supplier+capability (not supplier alone) — a supplier can be healthy for Hotels while its Flights endpoint is struggling, and this sprint's Health section asks for both "Per Supplier" and "Per Capability" dimensions. */
export function breakerKey(supplierCode: string, capability: SupplierCapability): string {
  return `${supplierCode}:${capability}`;
}

export class CircuitBreakerRegistry {
  private readonly breakers = new Map<string, CircuitBreaker>();

  constructor(private readonly config: CircuitBreakerConfig) {}

  getOrCreate(key: string): CircuitBreaker {
    let breaker = this.breakers.get(key);
    if (!breaker) {
      breaker = new CircuitBreaker(key, this.config);
      this.breakers.set(key, breaker);
    }
    return breaker;
  }

  getAllSnapshots(): CircuitSnapshot[] {
    return Array.from(this.breakers.values())
      .map((breaker) => breaker.getSnapshot())
      .sort((a, b) => a.key.localeCompare(b.key));
  }
}
