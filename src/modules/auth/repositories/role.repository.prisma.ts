import { err, ok, type PaginatedResult, type PaginationParams, type Result } from "@/shared/types";
import { NotFoundError, type AppError } from "@/shared/errors";
import { prisma } from "@/shared/database/prisma-client";
import type { Role as PrismaRoleRow } from "@/generated/prisma/client";
import type { Role, RoleName } from "../types/role";
import type { RoleRepository } from "./role.repository";

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 20;

function toDomain(row: PrismaRoleRow): Role {
  return { ...row, name: row.name as RoleName, createdAt: row.createdAt.toISOString(), updatedAt: row.updatedAt.toISOString() };
}

export class PrismaRoleRepository implements RoleRepository {
  async findById(id: string): Promise<Result<Role | null, AppError>> {
    const row = await prisma.role.findUnique({ where: { id } });
    return ok(row ? toDomain(row) : null);
  }

  async findByName(name: RoleName): Promise<Result<Role | null, AppError>> {
    const row = await prisma.role.findUnique({ where: { name } });
    return ok(row ? toDomain(row) : null);
  }

  async findAll(): Promise<Result<Role[], AppError>> {
    const rows = await prisma.role.findMany();
    return ok(rows.map(toDomain));
  }

  async findMany(params: PaginationParams = {}): Promise<Result<PaginatedResult<Role>, AppError>> {
    const page = params.page ?? DEFAULT_PAGE;
    const pageSize = params.pageSize ?? DEFAULT_PAGE_SIZE;
    const [rows, total] = await Promise.all([prisma.role.findMany({ skip: (page - 1) * pageSize, take: pageSize }), prisma.role.count()]);
    return ok({ items: rows.map(toDomain), page, pageSize, total, totalPages: Math.max(1, Math.ceil(total / pageSize)) });
  }

  async create(data: Omit<Role, "id">): Promise<Result<Role, AppError>> {
    const row = await prisma.role.create({ data });
    return ok(toDomain(row));
  }

  async update(id: string, data: Partial<Omit<Role, "id">>): Promise<Result<Role, AppError>> {
    try {
      const row = await prisma.role.update({ where: { id }, data });
      return ok(toDomain(row));
    } catch {
      return err(new NotFoundError(`Role "${id}" not found`));
    }
  }

  async delete(id: string): Promise<Result<void, AppError>> {
    try {
      await prisma.role.delete({ where: { id } });
      return ok(undefined);
    } catch {
      return err(new NotFoundError(`Role "${id}" not found`));
    }
  }
}
