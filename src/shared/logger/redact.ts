/**
 * Automatic redaction for sensitive values in log metadata. Applied once,
 * inside ConsoleLogger.write(), so every call site in the app is covered
 * without each one having to remember to scrub its own `meta` object —
 * the same "one choke point" discipline as Logger/DI/Config elsewhere in
 * this project.
 *
 * Matches by key name (case-insensitive substring), not by value shape, so
 * it catches the field regardless of what it's called downstream of the
 * base word — `resetToken`, `verificationToken`, `refreshToken`,
 * `currentPassword`, `keySecret`, `apiSecret` all match without needing an
 * exhaustive exact-name list.
 */
const SENSITIVE_KEY_PATTERNS = ["password", "token", "apikey", "secret", "authorization"];

const REDACTED = "[REDACTED]";
const MAX_DEPTH = 8;

function isSensitiveKey(key: string): boolean {
  const lower = key.toLowerCase();
  return SENSITIVE_KEY_PATTERNS.some((pattern) => lower.includes(pattern));
}

function redactValue(value: unknown, depth: number, seen: WeakSet<object>): unknown {
  if (value === null || typeof value !== "object") return value;
  if (depth >= MAX_DEPTH) return "[REDACTED:MAX_DEPTH]";
  if (seen.has(value)) return "[REDACTED:CIRCULAR]";
  seen.add(value);

  if (Array.isArray(value)) {
    return value.map((item) => redactValue(item, depth + 1, seen));
  }

  const result: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
    result[key] = isSensitiveKey(key) ? REDACTED : redactValue(val, depth + 1, seen);
  }
  return result;
}

/** Never throws — a logging call must never be the thing that crashes the caller. */
export function redactSensitive<T>(meta: T): T {
  try {
    return redactValue(meta, 0, new WeakSet()) as T;
  } catch {
    return meta;
  }
}
