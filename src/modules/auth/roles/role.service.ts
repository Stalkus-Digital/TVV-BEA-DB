import { err, isErr, ok, type Result } from "@/shared/types";
import { BaseService, type ServiceContext } from "@/shared/services";
import { ConflictError, NotFoundError, type AppError } from "@/shared/errors";
import type { Role, RoleName } from "../types/role";
import type { RoleRepository } from "../repositories/role.repository";
import type { UserRoleRepository } from "../repositories/user-role.repository";
import { ROLE_SEED_DATA } from "./role-seed";

export class RoleService extends BaseService {
  constructor(
    context: ServiceContext,
    private readonly roles: RoleRepository,
    private readonly userRoles: UserRoleRepository
  ) {
    super(context);
  }

  /** Idempotent — same pattern as PermissionService.ensureSeeded(). */
  async ensureSeeded(): Promise<void> {
    for (const entry of ROLE_SEED_DATA) {
      const existing = await this.roles.findByName(entry.name);
      if (isErr(existing) || existing.value) continue;
      const now = new Date().toISOString();
      await this.roles.create({ name: entry.name, description: entry.description, isSystem: true, createdAt: now, updatedAt: now });
    }
    const all = await this.roles.findAll();
    this.logger.info("Roles seeded", { count: isErr(all) ? 0 : all.value.length });
  }

  async list(): Promise<Result<Role[], AppError>> {
    return this.roles.findAll();
  }

  async getById(id: string): Promise<Result<Role, AppError>> {
    const result = await this.roles.findById(id);
    if (isErr(result)) return result;
    if (!result.value) return err(new NotFoundError(`Role "${id}" not found`));
    return ok(result.value);
  }

  async getByName(name: RoleName): Promise<Result<Role, AppError>> {
    const result = await this.roles.findByName(name);
    if (isErr(result)) return result;
    if (!result.value) return err(new NotFoundError(`Role "${name}" not found`));
    return ok(result.value);
  }

  async getRolesForUser(userId: string): Promise<Result<Role[], AppError>> {
    const assignments = await this.userRoles.findByUser(userId);
    if (isErr(assignments)) return assignments;

    const roles: Role[] = [];
    for (const assignment of assignments.value) {
      const role = await this.roles.findById(assignment.roleId);
      if (isErr(role)) return role;
      if (role.value) roles.push(role.value);
    }
    return ok(roles);
  }

  async assignToUser(userId: string, roleId: string): Promise<Result<Role, AppError>> {
    const role = await this.getById(roleId);
    if (isErr(role)) return role;

    const existing = await this.userRoles.findByUserAndRole(userId, roleId);
    if (isErr(existing)) return existing;
    if (existing.value) return err(new ConflictError(`User "${userId}" already has role "${role.value.name}"`));

    this.logger.info("Assigning role to user", { userId, roleId, roleName: role.value.name });
    const created = await this.userRoles.create({ userId, roleId, assignedAt: new Date().toISOString() });
    if (isErr(created)) return created;
    return ok(role.value);
  }

  async revokeFromUser(userId: string, roleId: string): Promise<Result<void, AppError>> {
    this.logger.info("Revoking role from user", { userId, roleId });
    return this.userRoles.deleteByUserAndRole(userId, roleId);
  }
}
