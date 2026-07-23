import { err, isErr, ok, type Result } from "@/shared/types";
import { UnauthorizedError, type AppError } from "@/shared/errors";
import type { AuthContext } from "../types/auth-context";
import { getApiKeyService, getJwtService, getPermissionService, getRoleService } from "../module";
import { prisma } from "@/shared/database/prisma-client";
import crypto from "crypto";

function extractBearerToken(authorizationHeader: string | null): string | null {
  if (!authorizationHeader) return null;
  const match = authorizationHeader.match(/^Bearer\s+(.+)$/i);
  return match ? match[1] : null;
}

/** JWTs have exactly two dots (header.payload.signature); this project's API keys never contain a dot (see services/api-key.service.ts's `tvv_<prefix>_<secret>` format) — an unambiguous way to route to the right verification path without a format flag. */
function looksLikeJwt(token: string): boolean {
  return token.split(".").length === 3;
}

/**
 * Resolves a request's Authorization header into an AuthContext.
 *
 * IMPORTANT, discovered via live testing (not assumed): Next.js executes
 * `src/middleware.ts` in an isolated module/execution context that does
 * NOT share this project's in-memory `Map`-backed repositories with the
 * route-handler process — verified live: a Session created by a route
 * handler (POST /api/auth/login) was immediately unreachable from
 * middleware's own SessionRepository lookup, even milliseconds later in
 * the same running server. This is a direct, unavoidable consequence of
 * this sprint's "no database yet, in-memory only" constraint, not a code
 * bug — a real external database (docs/16) is reachable identically from
 * both contexts and makes this limitation disappear entirely, since both
 * sides would be querying the same Postgres instance rather than two
 * separate in-process Maps.
 *
 * What DOES work reliably in middleware today, and is what this function
 * relies on: JWT signature/expiry verification (needs only the shared
 * secret, itself read from `process.env` — which IS shared across both
 * contexts, unlike an in-memory Map) and permission resolution via the
 * static, hardcoded ROLE_PERMISSION_MATRIX (pure data, identical in every
 * module instance). Neither needs a repository lookup.
 *
 * Known consequence, flagged not hidden: logout revokes the session and
 * refresh token (verified live: refreshing after logout correctly fails),
 * but an already-issued access token remains usable in middleware until
 * its own short expiry (15 minutes by default) — the standard, well-
 * understood stateless-JWT tradeoff. API key verification has the exact
 * same limitation (ApiKeyRepository is equally unreachable from
 * middleware's isolated context) — API keys are accepted as a credential
 * format here but will not actually authenticate correctly until the
 * database migration lands. See docs/22's Remaining TODOs.
 */
function extractApiKeyToken(authorizationHeader: string | null, apiKeyHeader: string | null): string | null {
  const bearer = extractBearerToken(authorizationHeader);
  if (bearer?.trim()) return bearer.trim();
  const apiKey = apiKeyHeader?.trim();
  return apiKey || null;
}

export async function resolveAuthContext(
  authorizationHeader: string | null,
  apiKeyHeader: string | null = null,
): Promise<Result<AuthContext, AppError>> {
  const token = extractApiKeyToken(authorizationHeader, apiKeyHeader);
  if (!token) return err(new UnauthorizedError("Missing or malformed Authorization header"));

  if (looksLikeJwt(token)) {
    const verified = getJwtService().verify(token);
    if (isErr(verified)) return verified;
    const payload = verified.value;

    // SECURITY-003B: Check if JWT is revoked in the database.
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    const revoked = await prisma.revokedJwt.findUnique({
      where: { tokenHash },
    });
    if (revoked) {
      return err(new UnauthorizedError("Token has been revoked"));
    }

    return ok({
      userId: payload.sub,
      email: payload.email,
      sessionId: payload.sessionId,
      roles: payload.roles,
      permissionKeys: getPermissionService().getPermissionKeysForRoles(payload.roles),
    });
  }

  // NOTE: not reliable until the database migration lands — see this
  // function's docstring above. Left implemented (not removed) because the
  // logic itself is correct and will start working the moment
  // ApiKeyRepository is backed by a real, shared database.
  const apiKey = await getApiKeyService().verify(token);
  if (isErr(apiKey)) return err(new UnauthorizedError("Invalid API key"));

  const role = await getRoleService().getById(apiKey.value.roleId);
  if (isErr(role)) return err(new UnauthorizedError("API key's role no longer exists"));

  return ok({
    userId: `api-key:${apiKey.value.id}`,
    email: apiKey.value.name,
    sessionId: `api-key:${apiKey.value.id}`,
    roles: [role.value.name],
    permissionKeys: getPermissionService().getPermissionKeysForRoles([role.value.name]),
  });
}

const IDENTITY_HEADERS = { userId: "x-tvv-user-id", email: "x-tvv-email", sessionId: "x-tvv-session-id", roles: "x-tvv-roles" } as const;

/** src/middleware.ts calls this once it has a verified AuthContext, forwarding identity to the route handler via headers — the standard way to pass middleware-resolved state downstream in Next.js (no shared request-scoped store otherwise). Route handlers never re-verify the token; they trust these headers because they only ever reach a handler after passing through our own middleware. */
export function forwardAuthHeaders(headers: Headers, context: AuthContext): void {
  headers.set(IDENTITY_HEADERS.userId, context.userId);
  headers.set(IDENTITY_HEADERS.email, context.email);
  headers.set(IDENTITY_HEADERS.sessionId, context.sessionId);
  headers.set(IDENTITY_HEADERS.roles, context.roles.join(","));
}

/** The route-handler-side counterpart to forwardAuthHeaders() — re-derives permissionKeys from the static matrix rather than forwarding a long header value. Returns null for a public route the middleware let through without an identity (e.g. /api/auth/login itself). */
export function readAuthContextFromHeaders(headers: Headers): AuthContext | null {
  const userId = headers.get(IDENTITY_HEADERS.userId);
  const email = headers.get(IDENTITY_HEADERS.email);
  const sessionId = headers.get(IDENTITY_HEADERS.sessionId);
  const rolesHeader = headers.get(IDENTITY_HEADERS.roles);
  if (!userId || !email || !sessionId || !rolesHeader) return null;

  const roles = rolesHeader.split(",").filter(Boolean) as AuthContext["roles"];
  return { userId, email, sessionId, roles, permissionKeys: getPermissionService().getPermissionKeysForRoles(roles) };
}
