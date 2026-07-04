/** Pure decision logic, no I/O — auth.service.ts calls this, then persists whatever it returns. Kept separate and testable, same pattern as booking/status/booking-status-machine.ts. */

export interface LockState {
  failedLoginAttempts: number;
  lockedUntil: string | null;
}

export function isAccountLocked(lockedUntil: string | null, now: Date = new Date()): boolean {
  if (!lockedUntil) return false;
  return new Date(lockedUntil).getTime() > now.getTime();
}

/** Called after a failed password check — increments the counter and locks the account once it reaches maxFailedAttempts. */
export function recordFailedAttempt(current: LockState, maxFailedAttempts: number, lockDurationSeconds: number, now: Date = new Date()): LockState {
  const failedLoginAttempts = current.failedLoginAttempts + 1;
  if (failedLoginAttempts >= maxFailedAttempts) {
    return { failedLoginAttempts, lockedUntil: new Date(now.getTime() + lockDurationSeconds * 1000).toISOString() };
  }
  return { failedLoginAttempts, lockedUntil: current.lockedUntil };
}

/** Called after a successful login — the counter and any lock are cleared. */
export function resetLockState(): LockState {
  return { failedLoginAttempts: 0, lockedUntil: null };
}
