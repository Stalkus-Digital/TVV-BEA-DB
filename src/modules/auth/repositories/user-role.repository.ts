import { ok, type PaginationParams, type Result } from "@/shared/types";
import type { BaseRepository } from "@/shared/repositories";
import type { AppError } from "@/shared/errors";
import type { UserRole } from "../types/user-role";
import { PrismaStore } from "@/shared/database/prisma-store";
import { prisma } from "@/shared/database/prisma-client";

export interface UserRoleRepository extends BaseRepository<UserRole, string> {
  findByUser(userId: string): Promise<Result<UserRole[], AppError>>;
  findByUserAndRole(userId: string, roleId: string): Promise<Result<UserRole | null, AppError>>;
  deleteByUserAndRole(userId: string, roleId: string): Promise<Result<void, AppError>>;
}

export class PrismaUserRoleRepository extends PrismaStore<any> implements UserRoleRepository {
  constructor() {
    super(prisma.userRole);
  }

  async findByUser(userId: string): Promise<Result<UserRole[], AppError>> {
    return ok((await this.delegate.findMany()).filter(( ur: any ) => ur.userId === userId));
  }

  async findByUserAndRole(userId: string, roleId: string): Promise<Result<UserRole | null, AppError>> {
    return ok((await this.delegate.findMany()).find(( ur: any ) => ur.userId === userId && ur.roleId === roleId) ?? null);
  }

  async deleteByUserAndRole(userId: string, roleId: string): Promise<Result<void, AppError>> {
    const existing = (await this.delegate.findMany()).find(( ur: any ) => ur.userId === userId && ur.roleId === roleId);
    if (existing) await this.delegate.delete(existing.id);
    return ok(undefined);
  }
}
