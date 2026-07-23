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
    try {
      const records = await this.delegate.findMany({ where: { userId } });
      // Use the generic toPrismaData/fromPrismaData logic manually or just return since Date objects are often fine, 
      // but to be perfectly safe with the interface, we map the dates.
      const mapped = records.map((r: any) => ({
        ...r,
        assignedAt: r.assignedAt instanceof Date ? r.assignedAt.toISOString() : r.assignedAt
      }));
      return ok(mapped);
    } catch (error) {
      return ok([]);
    }
  }

  async findByUserAndRole(userId: string, roleId: string): Promise<Result<UserRole | null, AppError>> {
    try {
      const record = await this.delegate.findUnique({
        where: { userId_roleId: { userId, roleId } }
      });
      if (!record) return ok(null);
      return ok({
        ...record,
        assignedAt: record.assignedAt instanceof Date ? record.assignedAt.toISOString() : record.assignedAt
      });
    } catch (error) {
      return ok(null);
    }
  }

  async deleteByUserAndRole(userId: string, roleId: string): Promise<Result<void, AppError>> {
    const existing = (await this.delegate.findMany()).find(( ur: any ) => ur.userId === userId && ur.roleId === roleId);
    if (existing) await this.delegate.delete(existing.id);
    return ok(undefined);
  }
}
