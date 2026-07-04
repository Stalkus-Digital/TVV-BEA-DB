import { ok, type PaginationParams, type Result } from "@/shared/types";
import type { BaseRepository } from "@/shared/repositories";
import type { AppError } from "@/shared/errors";
import type { UserRole } from "../types/user-role";
import { InMemoryStore } from "./in-memory-store";

export interface UserRoleRepository extends BaseRepository<UserRole, string> {
  findByUser(userId: string): Promise<Result<UserRole[], AppError>>;
  findByUserAndRole(userId: string, roleId: string): Promise<Result<UserRole | null, AppError>>;
  deleteByUserAndRole(userId: string, roleId: string): Promise<Result<void, AppError>>;
}

export class InMemoryUserRoleRepository implements UserRoleRepository {
  private readonly store = new InMemoryStore<UserRole>("User role assignment");

  findById = (id: string) => this.store.findById(id);
  findMany = (params?: PaginationParams) => this.store.findMany(params);
  create = (data: Omit<UserRole, "id">) => this.store.create(data);
  update = (id: string, data: Partial<Omit<UserRole, "id">>) => this.store.update(id, data);
  delete = (id: string) => this.store.delete(id);

  async findByUser(userId: string): Promise<Result<UserRole[], AppError>> {
    return ok(this.store.all().filter((ur) => ur.userId === userId));
  }

  async findByUserAndRole(userId: string, roleId: string): Promise<Result<UserRole | null, AppError>> {
    return ok(this.store.all().find((ur) => ur.userId === userId && ur.roleId === roleId) ?? null);
  }

  async deleteByUserAndRole(userId: string, roleId: string): Promise<Result<void, AppError>> {
    const existing = this.store.all().find((ur) => ur.userId === userId && ur.roleId === roleId);
    if (existing) await this.store.delete(existing.id);
    return ok(undefined);
  }
}
