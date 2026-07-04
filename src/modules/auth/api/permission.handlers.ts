import type { AppError } from "@/shared/errors";
import type { Result } from "@/shared/types";
import { getPermissionService } from "../module";
import type { Permission } from "../types/permission";

export async function listPermissionsHandler(): Promise<Result<Permission[], AppError>> {
  return getPermissionService().list();
}
