import { CorsConfigService } from "./cors-config.service";

const ALLOWED_METHODS = "GET, POST, PATCH, PUT, DELETE, OPTIONS";
const ALLOWED_HEADERS = "Content-Type, Authorization, Accept";
const PREFLIGHT_MAX_AGE_SECONDS = 600;

/**
 * Resolves the request's `Origin` header against the configured allow-list
 * — returns the exact origin to echo back (never a wildcard) if it's
 * allowed, `null` otherwise. Per the CORS spec, `Access-Control-Allow-
 * Origin` must be a single specific origin (not `*`) whenever `Access-
 * Control-Allow-Credentials: true` is also sent, which this project always
 * sends — so this function's `null`-or-exact-origin return shape is not
 * an implementation choice, it's the only spec-correct option here.
 */
export function resolveAllowedOrigin(requestOrigin: string | null): string | null {
  if (!requestOrigin) return null;
  return CorsConfigService.getInstance().isAllowedOrigin(requestOrigin) ? requestOrigin : null;
}

export function isPreflightRequest(method: string): boolean {
  return method.toUpperCase() === "OPTIONS";
}

/**
 * Applied to every response (success, error, or preflight) for an allowed
 * origin. Deliberately does nothing (returns headers unchanged) when
 * `allowedOrigin` is `null` — an origin that isn't on the allow-list gets
 * no CORS headers at all, which is what makes the browser reject it; this
 * is the enforcement mechanism, not a bug in some other path.
 */
export function applyCorsHeaders(headers: Headers, allowedOrigin: string | null): void {
  if (!allowedOrigin) return;
  headers.set("Access-Control-Allow-Origin", allowedOrigin);
  headers.set("Access-Control-Allow-Credentials", "true");
  headers.set("Vary", appendVary(headers.get("Vary"), "Origin"));
}

/** Only needed on the OPTIONS preflight response — the actual request doesn't need Methods/Headers/Max-Age repeated on it. */
export function applyPreflightHeaders(headers: Headers): void {
  headers.set("Access-Control-Allow-Methods", ALLOWED_METHODS);
  headers.set("Access-Control-Allow-Headers", ALLOWED_HEADERS);
  headers.set("Access-Control-Max-Age", String(PREFLIGHT_MAX_AGE_SECONDS));
}

function appendVary(existing: string | null, value: string): string {
  if (!existing) return value;
  const values = existing.split(",").map((v) => v.trim());
  return values.includes(value) ? existing : `${existing}, ${value}`;
}
