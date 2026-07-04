import { describe, expect, it } from "vitest";
import { MetricsRegistry } from "@/modules/observability/metrics/metrics-registry";

describe("MetricsRegistry", () => {
  it("starts every counter at zero", () => {
    const registry = new MetricsRegistry();
    expect(registry.get("requests.seen.total")).toBe(0);
  });

  it("increments by 1 by default", () => {
    const registry = new MetricsRegistry();
    registry.increment("requests.seen.total");
    registry.increment("requests.seen.total");
    expect(registry.get("requests.seen.total")).toBe(2);
  });

  it("increments by a custom amount", () => {
    const registry = new MetricsRegistry();
    registry.increment("errors", 5);
    expect(registry.get("errors")).toBe(5);
  });

  it("getSnapshot returns all counters sorted by name", () => {
    const registry = new MetricsRegistry();
    registry.increment("zeta");
    registry.increment("alpha");
    const snapshot = registry.getSnapshot();
    expect(snapshot.counters.map((c) => c.name)).toEqual(["alpha", "zeta"]);
    expect(snapshot.generatedAt).toBeTruthy();
  });

  it("reset clears every counter", () => {
    const registry = new MetricsRegistry();
    registry.increment("x");
    registry.reset();
    expect(registry.get("x")).toBe(0);
    expect(registry.getSnapshot().counters).toHaveLength(0);
  });
});
