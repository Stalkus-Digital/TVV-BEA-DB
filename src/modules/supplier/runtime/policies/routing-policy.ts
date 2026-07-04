import type { Supplier } from "../../types/supplier.port";

/**
 * Decides the ORDER the dispatcher tries capability-matching suppliers in
 * — nothing about eligibility (that's the circuit breaker's job, checked
 * per-supplier right before each attempt, not baked into an ordering
 * decision made once up front). Kept as an interface so a future
 * weighted/least-latency policy can replace `DefaultRoutingPolicy` without
 * the dispatcher itself changing.
 */
export interface RoutingPolicy {
  order(suppliers: Supplier[]): Supplier[];
}

/** Tries suppliers in the exact order the registry returned them — "first available wins." `Supplier` carries no priority/weight field (and this sprint doesn't add one to that port), so this is the only ordering that doesn't invent data the port doesn't have. */
export class DefaultRoutingPolicy implements RoutingPolicy {
  order(suppliers: Supplier[]): Supplier[] {
    return [...suppliers];
  }
}
