import { PermissionAction, PermissionResource } from "../types/permission";

/**
 * Exact matches — genuinely public, zero authentication required.
 * Everything else under /api/* requires at least a valid identity
 * (fail-closed default), per this sprint's "Protect every Admin API"
 * instruction. `/api/v1/auth/login` and `/api/v1/auth/register` are the
 * Frontend Compatibility Layer's (Sprint 13) legacy-path equivalents of
 * the two entries directly above them — an anonymous visitor must be able
 * to reach both, same as the real `/api/auth/*` ones.
 * `/api/v1/auth/me` is deliberately NOT here — same authentication
 * requirement as `/api/auth/me`. See docs/30_FRONTEND_COMPATIBILITY_LAYER.md.
 * `/api/enquiries` (Sprint 13 — Customer Experience Platform) is public
 * lead-capture — an anonymous visitor must be able to submit one. Its own
 * route handler resolves the Authorization header directly (not via this
 * file's forwarded-context mechanism, which public paths never get) so a
 * logged-in customer's `userId` still gets attached when present.
 * `/api/storage/download` (Sprint 14 — Storage Platform) is public for a
 * different reason: it is never reached without a valid, time-limited HMAC
 * signature in its own query params (see signed-urls/signed-url.service.ts)
 * — that signature IS the credential, so requiring a JWT on top of it would
 * add nothing. Every other `/api/storage/*` route is left unmapped below,
 * which still means "authenticated-only" (the fail-closed default), same
 * tier as `/api/suppliers`.
 * `/api/system/health` (Sprint 15 — Observability Platform) is public,
 * same reasoning and same tier as the existing `/api/health` right above
 * it — a load balancer or uptime monitor needs to reach it without a
 * credential. Every other `/api/system/*` route (metrics, logs,
 * performance, modules, version) is deliberately NOT here — those expose
 * internal architecture/log detail an anonymous caller has no business
 * reading, so they stay authenticated-only under the fail-closed default,
 * same tier as `/api/suppliers` and most of `/api/storage/*`.
 */
export const PUBLIC_EXACT_PATHS = [
  "/api/health",
  "/api/system/health",
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/refresh",
  "/api/auth/request-password-reset",
  "/api/auth/reset-password",
  "/api/v1/auth/login",
  "/api/v1/auth/register",
  "/api/enquiries",
  "/api/storage/download",
  "/api/seed",
];

/**
 * Prefix match — the entire Website BFF surface stays public per docs/17
 * ("Website API Auth" — no security benefit to gating data that's public
 * by design). `/api/v1/packages` and `/api/v1/search` are the Frontend
 * Compatibility Layer's legacy-path mirrors of that same public data
 * (docs/30). The six `/api/v1/{ferry,flights,guides,experiences,reviews,
 * calculator}` prefixes are NOT_IMPLEMENTED stubs, not admin data — they
 * stay public so an anonymous site visitor gets a clean 501 instead of a
 * 401 for content types Travel OS doesn't model yet.
 */
export const PUBLIC_PREFIXES = [
  "/api/website",
  "/api/v1/packages",
  "/api/v1/search",
  "/api/v1/ferry",
  "/api/v1/flights",
  "/api/v1/guides",
  "/api/v1/experiences",
  "/api/v1/reviews",
  "/api/v1/calculator",
];

/**
 * Path prefix → the permission resource that guards write/read access to
 * it. Geography is folded into DESTINATION (same module ownership, per
 * docs/06: "two hierarchies... both owned by Destination Engine").
 * `/api/suppliers` has no dedicated resource in this sprint's 9-resource
 * list — authenticated-only (any valid identity may read it), not
 * permission-checked, same "no PERMISSIONS-resource CRUD this sprint"
 * scope boundary already applied to /api/permissions below.
 */
const RESOURCE_PREFIX_MAP: { prefix: string; resource: PermissionResource }[] = [
  { prefix: "/api/inventory", resource: PermissionResource.INVENTORY },
  { prefix: "/api/destinations", resource: PermissionResource.DESTINATION },
  { prefix: "/api/geography", resource: PermissionResource.DESTINATION },
  { prefix: "/api/packages", resource: PermissionResource.PACKAGE },
  { prefix: "/api/quotes", resource: PermissionResource.QUOTE },
  { prefix: "/api/admin/enquiries", resource: PermissionResource.QUOTE },
  { prefix: "/api/bookings", resource: PermissionResource.BOOKING },
  { prefix: "/api/users", resource: PermissionResource.USERS },
  { prefix: "/api/roles", resource: PermissionResource.ROLES },
  { prefix: "/api/permissions", resource: PermissionResource.ROLES },
  { prefix: "/api/audit-logs", resource: PermissionResource.SETTINGS },
  { prefix: "/api/api-keys", resource: PermissionResource.SETTINGS },
];

const METHOD_ACTION_MAP: Record<string, PermissionAction> = {
  GET: PermissionAction.READ,
  POST: PermissionAction.CREATE,
  PATCH: PermissionAction.UPDATE,
  PUT: PermissionAction.UPDATE,
  DELETE: PermissionAction.DELETE,
};

export function isPublicPath(pathname: string): boolean {
  return PUBLIC_EXACT_PATHS.includes(pathname) || PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

export interface ResolvedRoutePermission {
  resource: PermissionResource | null; // null = authenticated-only, no granular permission check for this path
  action: PermissionAction;
}

/** Every non-public path resolves to at least {resource: null, action}, meaning "any authenticated identity" — permission checks are additive on top of that floor, never a substitute for it. */
export function resolveRoutePermission(pathname: string, method: string): ResolvedRoutePermission {
  const action = METHOD_ACTION_MAP[method.toUpperCase()] ?? PermissionAction.READ;
  const match = RESOURCE_PREFIX_MAP.find((entry) => pathname.startsWith(entry.prefix));
  return { resource: match?.resource ?? null, action };
}
