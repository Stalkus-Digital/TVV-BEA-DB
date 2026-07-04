import { err, isErr, ok, type PaginatedResult, type Result } from "@/shared/types";
import { BaseService, type ServiceContext } from "@/shared/services";
import { ConflictError, NotFoundError, type AppError } from "@/shared/errors";
import { AuditEventType } from "../types/audit-log";
import type { User } from "../types/user";
import type { UserListFilter, UserRepository } from "../repositories/user.repository";
import { validateRegister } from "../validation/auth.validation";
import { validateUpdateUser } from "../validation/user.validation";
import { hashPassword } from "./password.service";
import type { RoleService } from "../roles/role.service";
import type { AuditLogService } from "../audit/audit-log.service";

/**
 * Admin-facing user management — distinct from AuthService.register()
 * (public self-service signup, always CUSTOMER). This is how staff
 * accounts (SALES, OPERATIONS, etc.) actually get created: an existing
 * admin calls create() with an explicit roleId, gated by USERS:CREATE.
 */
export class UserService extends BaseService {
  constructor(
    context: ServiceContext,
    private readonly users: UserRepository,
    private readonly roleService: RoleService,
    private readonly auditLogService: AuditLogService
  ) {
    super(context);
  }

  async list(filter: UserListFilter = {}): Promise<Result<PaginatedResult<User>, AppError>> {
    return this.users.findByFilter(filter);
  }

  async getById(id: string): Promise<Result<User, AppError>> {
    const result = await this.users.findById(id);
    if (isErr(result)) return result;
    if (!result.value) return err(new NotFoundError(`User "${id}" not found`));
    return ok(result.value);
  }

  async create(input: unknown, roleId: string, actorUserId: string): Promise<Result<User, AppError>> {
    const validated = validateRegister(input);
    if (isErr(validated)) return validated;
    const value = validated.value;

    const role = await this.roleService.getById(roleId);
    if (isErr(role)) return role;

    const existing = await this.users.findByEmail(value.email);
    if (isErr(existing)) return existing;
    if (existing.value) return err(new ConflictError(`Email "${value.email}" is already registered`));

    const passwordHash = await hashPassword(value.password);
    const now = new Date().toISOString();
    const created = await this.users.create({
      email: value.email,
      passwordHash,
      fullName: value.fullName,
      isActive: true,
      failedLoginAttempts: 0,
      lockedUntil: null,
      lastLoginAt: null,
      createdAt: now,
      updatedAt: now,
    });
    if (isErr(created)) return created;

    await this.roleService.assignToUser(created.value.id, roleId);
    await this.auditLogService.record({ eventType: AuditEventType.USER_CREATED, actorUserId, targetUserId: created.value.id, details: { email: value.email, role: role.value.name } });

    this.logger.info("Staff user created by admin", { userId: created.value.id, actorUserId, role: role.value.name });
    return ok(created.value);
  }

  async update(id: string, input: unknown): Promise<Result<User, AppError>> {
    const existing = await this.getById(id);
    if (isErr(existing)) return existing;

    const validated = validateUpdateUser(input);
    if (isErr(validated)) return validated;

    return this.users.update(id, { ...validated.value, updatedAt: new Date().toISOString() });
  }

  /** Soft-deactivate, not a hard delete — same archive precedent every other module in this project follows for destructive-sounding operations. */
  async deactivate(id: string): Promise<Result<User, AppError>> {
    const existing = await this.getById(id);
    if (isErr(existing)) return existing;
    this.logger.info("Deactivating user", { id });
    return this.users.update(id, { isActive: false, updatedAt: new Date().toISOString() });
  }

  async assignRole(userId: string, roleId: string, actorUserId: string): Promise<Result<void, AppError>> {
    const user = await this.getById(userId);
    if (isErr(user)) return user;

    const result = await this.roleService.assignToUser(userId, roleId);
    if (isErr(result)) return result;

    await this.auditLogService.record({ eventType: AuditEventType.ROLE_CHANGED, actorUserId, targetUserId: userId, details: { action: "assigned", role: result.value.name } });
    return ok(undefined);
  }

  async revokeRole(userId: string, roleId: string, actorUserId: string): Promise<Result<void, AppError>> {
    const user = await this.getById(userId);
    if (isErr(user)) return user;

    const role = await this.roleService.getById(roleId);
    if (isErr(role)) return role;

    const result = await this.roleService.revokeFromUser(userId, roleId);
    if (isErr(result)) return result;

    await this.auditLogService.record({ eventType: AuditEventType.ROLE_CHANGED, actorUserId, targetUserId: userId, details: { action: "revoked", role: role.value.name } });
    return ok(undefined);
  }
}
