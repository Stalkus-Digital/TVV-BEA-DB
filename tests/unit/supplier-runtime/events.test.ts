import { describe, expect, it } from "vitest";
import { RuntimeEventBus } from "@/modules/supplier/runtime/events/runtime-event-bus";
import { RuntimeEventType, type RuntimeEvent } from "@/modules/supplier/runtime/events/runtime-events";

function event(overrides: Partial<RuntimeEvent> = {}): RuntimeEvent {
  return {
    type: RuntimeEventType.REQUEST_STARTED,
    correlationId: "corr-1",
    supplierCode: "tripjack",
    capability: "HOTELS",
    timestamp: new Date().toISOString(),
    ...overrides,
  };
}

describe("RuntimeEventBus", () => {
  it("notifies a subscriber of the exact event type published", () => {
    const bus = new RuntimeEventBus();
    const received: RuntimeEvent[] = [];
    bus.subscribe(RuntimeEventType.CIRCUIT_OPENED, (e) => received.push(e));

    bus.publish(event({ type: RuntimeEventType.REQUEST_STARTED }));
    bus.publish(event({ type: RuntimeEventType.CIRCUIT_OPENED }));

    expect(received).toHaveLength(1);
    expect(received[0].type).toBe(RuntimeEventType.CIRCUIT_OPENED);
  });

  it("keeps a bounded, most-recent-first ring buffer of published events", () => {
    const bus = new RuntimeEventBus(2);
    bus.publish(event({ correlationId: "1" }));
    bus.publish(event({ correlationId: "2" }));
    bus.publish(event({ correlationId: "3" }));

    const recent = bus.recentEvents();
    expect(recent.map((e) => e.correlationId)).toEqual(["3", "2"]);
  });

  it("recentEvents respects a custom limit", () => {
    const bus = new RuntimeEventBus();
    for (let i = 0; i < 5; i++) bus.publish(event({ correlationId: String(i) }));
    expect(bus.recentEvents(2)).toHaveLength(2);
  });
});
