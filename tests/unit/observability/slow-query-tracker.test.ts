import { describe, expect, it } from "vitest";
import { SlowQueryTracker } from "@/modules/observability/performance/slow-query-tracker";

describe("SlowQueryTracker", () => {
  it("marks a query at/above the threshold as slow", () => {
    const tracker = new SlowQueryTracker(100, 200);
    tracker.record("SELECT 1", 250);
    expect(tracker.listSlow()).toHaveLength(1);
    expect(tracker.listSlow()[0].isSlow).toBe(true);
  });

  it("does not mark a fast query as slow", () => {
    const tracker = new SlowQueryTracker(100, 200);
    tracker.record("SELECT 1", 10);
    expect(tracker.listSlow()).toHaveLength(0);
    expect(tracker.listAll()).toHaveLength(1);
  });

  it("listSlow excludes fast queries but listAll includes everything", () => {
    const tracker = new SlowQueryTracker(100, 200);
    tracker.record("fast", 10);
    tracker.record("slow", 500);
    expect(tracker.listAll()).toHaveLength(2);
    expect(tracker.listSlow()).toHaveLength(1);
    expect(tracker.listSlow()[0].query).toBe("slow");
  });

  it("respects capacity as a ring buffer", () => {
    const tracker = new SlowQueryTracker(2, 200);
    tracker.record("a", 10);
    tracker.record("b", 10);
    tracker.record("c", 10);
    expect(tracker.totalTracked).toBe(2);
    expect(tracker.listAll().map((q) => q.query)).toEqual(["c", "b"]);
  });

  it("exposes its configured threshold", () => {
    const tracker = new SlowQueryTracker(100, 350);
    expect(tracker.threshold).toBe(350);
  });
});
