export const CircuitState = {
  CLOSED: "CLOSED",
  OPEN: "OPEN",
  HALF_OPEN: "HALF_OPEN",
} as const;

export type CircuitState = (typeof CircuitState)[keyof typeof CircuitState];

export interface CircuitBreakerConfig {
  /** Consecutive failures (while CLOSED) before tripping to OPEN. */
  failureThreshold: number;
  /** How long to stay OPEN before allowing one trial request (HALF_OPEN). */
  cooldownMs: number;
  /** Consecutive successes (while HALF_OPEN) before resetting to CLOSED. */
  successThreshold: number;
}

export interface CircuitSnapshot {
  key: string;
  state: CircuitState;
  consecutiveFailures: number;
  consecutiveSuccesses: number;
  openedAt: string | null;
  lastTransitionAt: string;
}
