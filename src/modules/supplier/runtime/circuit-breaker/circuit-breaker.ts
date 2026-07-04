import { CircuitState, type CircuitBreakerConfig, type CircuitSnapshot } from "./circuit-state";

/**
 * One breaker instance per key (see `breakerKey()` — supplier+capability).
 * Standard three-state machine: CLOSED (normal) -> OPEN (tripped, rejects
 * immediately) -> HALF_OPEN (one trial request allowed after `cooldownMs`)
 * -> CLOSED again on `successThreshold` consecutive successes, or straight
 * back to OPEN on a single failure while HALF_OPEN. "Automatic recovery"
 * (this sprint's explicit requirement) is `canAttempt()`'s cooldown check —
 * nothing external needs to reset a breaker by hand.
 */
export class CircuitBreaker {
  private state: CircuitState = CircuitState.CLOSED;
  private consecutiveFailures = 0;
  private consecutiveSuccesses = 0;
  private openedAt: number | null = null;
  private lastTransitionAt = Date.now();

  constructor(
    private readonly key: string,
    private readonly config: CircuitBreakerConfig
  ) {}

  /** Called before attempting a call. Also where OPEN -> HALF_OPEN's automatic recovery actually happens, once the cooldown has elapsed. */
  canAttempt(): boolean {
    if (this.state !== CircuitState.OPEN) return true;
    if (this.openedAt !== null && Date.now() - this.openedAt >= this.config.cooldownMs) {
      this.transitionTo(CircuitState.HALF_OPEN);
      return true;
    }
    return false;
  }

  recordSuccess(): void {
    if (this.state === CircuitState.HALF_OPEN) {
      this.consecutiveSuccesses += 1;
      if (this.consecutiveSuccesses >= this.config.successThreshold) this.reset();
      return;
    }
    this.consecutiveFailures = 0;
    this.consecutiveSuccesses = 0;
  }

  recordFailure(): void {
    if (this.state === CircuitState.HALF_OPEN) {
      this.trip();
      return;
    }
    this.consecutiveFailures += 1;
    this.consecutiveSuccesses = 0;
    if (this.consecutiveFailures >= this.config.failureThreshold) this.trip();
  }

  getSnapshot(): CircuitSnapshot {
    return {
      key: this.key,
      state: this.state,
      consecutiveFailures: this.consecutiveFailures,
      consecutiveSuccesses: this.consecutiveSuccesses,
      openedAt: this.openedAt !== null ? new Date(this.openedAt).toISOString() : null,
      lastTransitionAt: new Date(this.lastTransitionAt).toISOString(),
    };
  }

  private trip(): void {
    this.state = CircuitState.OPEN;
    this.openedAt = Date.now();
    this.consecutiveFailures = 0;
    this.consecutiveSuccesses = 0;
    this.lastTransitionAt = Date.now();
  }

  private reset(): void {
    this.state = CircuitState.CLOSED;
    this.openedAt = null;
    this.consecutiveFailures = 0;
    this.consecutiveSuccesses = 0;
    this.lastTransitionAt = Date.now();
  }

  private transitionTo(next: CircuitState): void {
    this.state = next;
    this.lastTransitionAt = Date.now();
  }
}
