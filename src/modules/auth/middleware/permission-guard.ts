import { err, ok, type Result } from "@/shared/types";
import { ForbiddenError, type AppError } from "@/shared/errors";
import type { AuthContext } from "../types/auth-context";
import { permissionKey } from "../permissions/permission-seed";
import type { ResolvedRoutePermission } from "./route-permission-map";

/**
 * `resource: null` normally means "authenticated-only" (see
 * route-permission-map.ts) — already satisfied by resolveAuthContext()
 * succeeding, nothing further to check. SECURITY-002B: `defaultDeny`
 * overrides that for admin paths with no explicit permission mapping —
 * checked first, since an unmapped admin route must never fall through to
 * "any authenticated identity".
 */
export function checkPermission(context: AuthContext, required: ResolvedRoutePermission): Result<void, AppError> {
  if (required.defaultDeny) {
    return err(new ForbiddenError("This route has no permission mapping configured — denied by default"));
  }
  if (!required.resource) return ok(undefined);

  const key = permissionKey(required.resource, required.action);
  if (!context.permissionKeys.includes(key)) {
    return err(new ForbiddenError(`Missing required permission: ${key}`));
  }
  return ok(undefined);
}
