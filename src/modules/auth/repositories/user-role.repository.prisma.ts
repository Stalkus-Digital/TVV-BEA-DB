import { err, ok, type PaginatedResult, type PaginationParams, type Result } from "@/shared/types";
import { NotFoundError, type AppError } from "@/shared/errors";
import { prisma } from "@/shared/database/prisma-client";
import type { UserRole as PrismaUserRoleRow } from "@/generated/prisma/client";
import type { UserRole } from "../types/user-role";
import type { UserRoleRepository } from "./user-role.repository";

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 20;

function toDomain(row: PrismaUserRoleRow): UserRole {
  return { ...row, assignedAt: row.assignedAt.toISOString() };
}

export class PrismaUserRoleRepository implements UserRoleRepository {
  async findById(id: string): Promise<Result<UserRole | null, AppError>> {
    const row = await prisma.userRole.findUnique({ where: { id } });
    return ok(row ? toDomain(row) : null);
  }

  async findByUser(userId: string): Promise<Result<UserRole[], AppError>> {
    const rows = await prisma.userRole.findMany({ where: { userId } });
    return ok(rows.map(toDomain));
  }

  async findByUserAndRole(userId: string, roleId: string): Promise<Result<UserRole | null, AppError>> {
    const row = await prisma.userRole.findUnique({ where: { userId_roleId: { userId, roleId } } });
    return ok(row ? toDomain(row) : null);
  }

  async deleteByUserAndRole(userId: string, roleId: string): Promise<Result<void, AppError>> {
    await prisma.userRole.deleteMany({ where: { userId, roleId } });
    return ok(undefined);
  }

  async findMany(params: PaginationParams = {}): Promise<Result<PaginatedResult<UserRole>, AppError>> {
    const page = params.page ?? DEFAULT_PAGE;
    const pageSize = params.pageSize ?? DEFAULT_PAGE_SIZE;
    const [rows, total] = await Promise.all([
      prisma.userRole.findMany({ skip: (page - 1) * pageSize, take: pageSize }),
      prisma.userRole.count(),
    ]);
    return ok({ items: rows.map(toDomain), page, pageSize, total, totalPages: Math.max(1, Math.ceil(total / pageSize)) });
  }

  async create(data: Omit<UserRole, "id">): Promise<Result<UserRole, AppError>> {
    const row = await prisma.userRole.create({ data });
    return ok(toDomain(row));
  }

  async update(id: string, data: Partial<Omit<UserRole, "id">>): Promise<Result<UserRole, AppError>> {
    try {
      const row = await prisma.userRole.update({ where: { id }, data });
      return ok(toDomain(row));
    } catch {
      return err(new NotFoundError(`User role assignment "${id}" not found`));
    }
  }

  async delete(id: string): Promise<Result<void, AppError>> {
    try {
      await prisma.userRole.delete({ where: { id } });
      return ok(undefined);
    } catch {
      return err(new NotFoundError(`User role assignment "${id}" not found`));
    }
  }
}
