import { err, ok, type Result } from "@/shared/types";
import { ForbiddenError, type AppError } from "@/shared/errors";
import type { AuthContext } from "../types/auth-context";
import { permissionKey } from "../permissions/permission-seed";
import type { ResolvedRoutePermission } from "./route-permission-map";

/** `resource: null` means "authenticated-only" (see route-permission-map.ts) — already satisfied by resolveAuthContext() succeeding; nothing further to check here. */
export function checkPermission(context: AuthContext, required: ResolvedRoutePermission): Result<void, AppError> {
  if (!required.resource) return ok(undefined);

  const key = permissionKey(required.resource, required.action);
  if (!context.permissionKeys.includes(key)) {
    return err(new ForbiddenError(`Missing required permission: ${key}`));
  }
  return ok(undefined);
}
