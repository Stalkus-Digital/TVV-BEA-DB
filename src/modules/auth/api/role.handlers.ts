import type { AppError } from "@/shared/errors";
import { ok, type Result } from "@/shared/types";
import { getPermissionService, getRoleService } from "../module";
import type { Permission } from "../types/permission";
import type { Role } from "../types/role";

export async function listRolesHandler(): Promise<Result<Role[], AppError>> {
  return getRoleService().list();
}

export async function getRoleHandler(id: string): Promise<Result<Role, AppError>> {
  return getRoleService().getById(id);
}

export async function getRolePermissionsHandler(id: string): Promise<Result<Permission[], AppError>> {
  const role = await getRoleService().getById(id);
  if (!role.ok) return role;
  const keys = new Set(getPermissionService().getPermissionKeysForRoles([role.value.name]));
  const allPermissions = await getPermissionService().list();
  if (!allPermissions.ok) return allPermissions;
  return ok(allPermissions.value.filter((p) => keys.has(p.key)));
}
