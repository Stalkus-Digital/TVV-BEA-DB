/** The 6 events this sprint explicitly names. */
export const RuntimeEventType = {
  REQUEST_STARTED: "REQUEST_STARTED",
  REQUEST_COMPLETED: "REQUEST_COMPLETED",
  REQUEST_FAILED: "REQUEST_FAILED",
  REQUEST_TIMED_OUT: "REQUEST_TIMED_OUT",
  REQUEST_RETRIED: "REQUEST_RETRIED",
  CIRCUIT_OPENED: "CIRCUIT_OPENED",
} as const;

export type RuntimeEventType = (typeof RuntimeEventType)[keyof typeof RuntimeEventType];

export interface RuntimeEvent {
  type: RuntimeEventType;
  correlationId: string;
  supplierCode: string;
  capability: string;
  timestamp: string;
  details?: Record<string, unknown>;
}
