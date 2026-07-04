import { isErr, type Result } from "@/shared/types";
import { BaseService, type ServiceContext } from "@/shared/services";
import type { AppError } from "@/shared/errors";
import type { Permission } from "../types/permission";
import type { RoleName } from "../types/role";
import type { PermissionRepository } from "../repositories/permission.repository";
import { PERMISSION_SEED_DATA, ROLE_PERMISSION_MATRIX } from "./permission-seed";

export class PermissionService extends BaseService {
  constructor(
    context: ServiceContext,
    private readonly permissions: PermissionRepository
  ) {
    super(context);
  }

  /** Idempotent — called once from module.ts's registration. Safe to call again (e.g. under HMR) since it only inserts missing keys. */
  async ensureSeeded(): Promise<void> {
    for (const entry of PERMISSION_SEED_DATA) {
      const key = `${entry.resource}:${entry.action}`;
      const existing = await this.permissions.findByKey(key);
      if (isErr(existing) || existing.value) continue;
      await this.permissions.create({ resource: entry.resource, action: entry.action, key, description: entry.description, createdAt: new Date().toISOString() });
    }
    const all = await this.permissions.findAll();
    this.logger.info("Permissions seeded", { count: isErr(all) ? 0 : all.value.length });
  }

  async list(): Promise<Result<Permission[], AppError>> {
    return this.permissions.findAll();
  }

  /** The static, system-defined grant for a role — permissions aren't a dynamically editable join table this sprint (see permission-seed.ts's docstring). */
  getPermissionKeysForRoles(roleNames: RoleName[]): string[] {
    const keys = new Set<string>();
    for (const name of roleNames) {
      for (const key of ROLE_PERMISSION_MATRIX[name] ?? []) keys.add(key);
    }
    return Array.from(keys);
  }
}
