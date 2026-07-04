import { EventEmitter } from "node:events";
import type { RuntimeEvent, RuntimeEventType } from "./runtime-events";

const DEFAULT_CAPACITY = 200;

/**
 * `node:events`' `EventEmitter` wrapped for typed emit/subscribe — no new
 * dependency, same zero-dependency discipline as every other hand-rolled
 * piece of shared infra in this project. Also keeps a bounded ring buffer
 * of recently-emitted events (same pattern as Observability's `LogStore`)
 * so `/api/supplier-runtime/events` has something to read without any
 * caller needing to have subscribed in advance.
 */
export class RuntimeEventBus {
  private readonly emitter = new EventEmitter();
  private readonly recent: RuntimeEvent[] = [];

  constructor(private readonly capacity: number = DEFAULT_CAPACITY) {
    this.emitter.setMaxListeners(50);
  }

  publish(event: RuntimeEvent): void {
    this.recent.push(event);
    if (this.recent.length > this.capacity) this.recent.shift();
    this.emitter.emit(event.type, event);
  }

  subscribe(type: RuntimeEventType, listener: (event: RuntimeEvent) => void): void {
    this.emitter.on(type, listener);
  }

  recentEvents(limit = 50): RuntimeEvent[] {
    return this.recent.slice(-limit).reverse();
  }
}
