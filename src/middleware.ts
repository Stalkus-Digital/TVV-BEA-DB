import { NextResponse, type NextRequest } from "next/server";
import { isErr } from "@/shared/types";
import { jsonError } from "@/api";
import {
  AuditEventType,
  checkPermission,
  forwardAuthHeaders,
  getAuditLogService,
  isPublicPath,
  resolveAuthContext,
  resolveRoutePermission,
} from "@/modules/auth";
import { attachRequestContextHeaders, buildRequestContext, recordRequestSeen } from "@/modules/observability";
import { applyCorsHeaders, applyPreflightHeaders, isPreflightRequest, resolveAllowedOrigin } from "@/shared/cors";

/**
 * The one enforcement point for "Protect every Admin API. Website API
 * remains public." (this sprint's explicit instruction) — runs on every
 * /api/* request before it reaches any route handler. No business module
 * file was touched to wire this in; every existing route becomes protected
 * simply by this file now existing, per Next.js's middleware convention.
 *
 * Fail-closed by construction: isPublicPath() is an explicit allow-list
 * (see modules/auth/middleware/route-permission-map.ts) — anything not on
 * it requires at least a valid identity, and routes mapped to one of the 9
 * permission resources additionally require the specific resource:action
 * grant. There is no "unknown path defaults to public" branch anywhere in
 * this logic.
 *
 * Deliberately does NOT call ensureAuthModuleSeeded() here — verified live
 * that Next.js runs this file in a module context that does not share
 * this project's in-memory repositories with the route-handler process
 * (see modules/auth/middleware/auth-guard.ts's docstring for the full
 * finding), so seeding here would only populate a copy nothing else ever
 * reads. The real seeding happens on the route-handler side, triggered by
 * api/auth.handlers.ts. Everything this file actually depends on
 * (resolveAuthContext's JWT path, checkPermission) is pure/stateless and
 * needs no seeded data to begin with.
 *
 * Sprint 15 (Observability Platform) additions, all additive — zero change
 * to the auth/permission logic above: a request/correlation id is minted
 * for every request (public or not) and attached to both the forwarded
 * request headers (so a route handler can read them back via
 * `readRequestContextFromHeaders`) and the outgoing response (so a caller
 * can see its own request id), plus one metrics counter. This is the only
 * per-request timing middleware can honestly claim — it cannot see the
 * eventual route handler's response status or duration, since Next.js
 * middleware runs before the handler and never wraps its result (see
 * docs/34_OBSERVABILITY_PLATFORM.md's Remaining TODOs).
 *
 * Phase 1 Customer Integration addition, also additive: every response —
 * including the CORS preflight (`OPTIONS`) response, which must succeed
 * regardless of whether the target path requires auth, since a browser
 * never sends credentials on a preflight request — now carries
 * `Access-Control-*` headers for the configured, allow-listed origin only
 * (see `src/shared/cors`; docs/37's audit found zero CORS headers existed
 * anywhere before this, which silently broke every authenticated call from
 * the separately-hosted Website frontend in a real browser). The preflight
 * short-circuit runs first, before `isPublicPath`/auth/permission logic,
 * because it must never be gated by any of that.
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const allowedOrigin = resolveAllowedOrigin(request.headers.get("origin"));

  if (isPreflightRequest(request.method)) {
    const preflightResponse = new NextResponse(null, { status: 204 });
    applyCorsHeaders(preflightResponse.headers, allowedOrigin);
    applyPreflightHeaders(preflightResponse.headers);
    return preflightResponse;
  }

  const requestContext = buildRequestContext(request.headers.get("x-correlation-id"));
  recordRequestSeen(request.method);

  if (isPublicPath(pathname)) {
    const forwardedHeaders = new Headers(request.headers);
    attachRequestContextHeaders(forwardedHeaders, requestContext);
    const response = NextResponse.next({ request: { headers: forwardedHeaders } });
    attachRequestContextHeaders(response.headers, requestContext);
    applyCorsHeaders(response.headers, allowedOrigin);
    return response;
  }

  const authResult = await resolveAuthContext(request.headers.get("authorization"));
  if (isErr(authResult)) {
    const response = jsonError(authResult.error);
    attachRequestContextHeaders(response.headers, requestContext);
    applyCorsHeaders(response.headers, allowedOrigin);
    return response;
  }

  const required = resolveRoutePermission(pathname, request.method);
  const permissionResult = checkPermission(authResult.value, required);
  if (isErr(permissionResult)) {
    // Written to middleware's own isolated AuditLogRepository — will not
    // appear in GET /api/audit-logs until the database migration gives
    // both contexts a shared store (see this file's top docstring). Left
    // in place because the logic is correct and starts working then.
    await getAuditLogService().record({
      eventType: AuditEventType.PERMISSION_DENIED,
      actorUserId: authResult.value.userId,
      details: { pathname, method: request.method, requiredResource: required.resource, requiredAction: required.action },
    });
    const response = jsonError(permissionResult.error);
    attachRequestContextHeaders(response.headers, requestContext);
    applyCorsHeaders(response.headers, allowedOrigin);
    return response;
  }

  const forwardedHeaders = new Headers(request.headers);
  forwardAuthHeaders(forwardedHeaders, authResult.value);
  attachRequestContextHeaders(forwardedHeaders, requestContext);
  const response = NextResponse.next({ request: { headers: forwardedHeaders } });
  attachRequestContextHeaders(response.headers, requestContext);
  applyCorsHeaders(response.headers, allowedOrigin);
  return response;
}

export const config = {
  matcher: ["/api/:path*"],
  // Node.js middleware runtime (not the default Edge runtime) — required
  // because JwtService/password hashing/HMAC use node:crypto, which the
  // Edge runtime's bundler cannot resolve. Fluid Compute runs Node.js
  // middleware natively, so this is a supported, not experimental, choice.
  runtime: "nodejs",
};
