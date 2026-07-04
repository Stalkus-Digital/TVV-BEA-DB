import { err, ok, type PaginatedResult, type PaginationParams, type Result } from "@/shared/types";
import { NotFoundError, type AppError } from "@/shared/errors";
import { prisma } from "@/shared/database/prisma-client";
import type { Permission as PrismaPermissionRow } from "@/generated/prisma/client";
import type { Permission, PermissionAction, PermissionResource } from "../types/permission";
import type { PermissionRepository } from "./permission.repository";

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 20;

function toDomain(row: PrismaPermissionRow): Permission {
  return { ...row, resource: row.resource as PermissionResource, action: row.action as PermissionAction, createdAt: row.createdAt.toISOString() };
}

export class PrismaPermissionRepository implements PermissionRepository {
  async findById(id: string): Promise<Result<Permission | null, AppError>> {
    const row = await prisma.permission.findUnique({ where: { id } });
    return ok(row ? toDomain(row) : null);
  }

  async findByKey(key: string): Promise<Result<Permission | null, AppError>> {
    const row = await prisma.permission.findUnique({ where: { key } });
    return ok(row ? toDomain(row) : null);
  }

  async findAll(): Promise<Result<Permission[], AppError>> {
    const rows = await prisma.permission.findMany();
    return ok(rows.map(toDomain));
  }

  async findMany(params: PaginationParams = {}): Promise<Result<PaginatedResult<Permission>, AppError>> {
    const page = params.page ?? DEFAULT_PAGE;
    const pageSize = params.pageSize ?? DEFAULT_PAGE_SIZE;
    const [rows, total] = await Promise.all([
      prisma.permission.findMany({ skip: (page - 1) * pageSize, take: pageSize }),
      prisma.permission.count(),
    ]);
    return ok({ items: rows.map(toDomain), page, pageSize, total, totalPages: Math.max(1, Math.ceil(total / pageSize)) });
  }

  async create(data: Omit<Permission, "id">): Promise<Result<Permission, AppError>> {
    const row = await prisma.permission.create({ data });
    return ok(toDomain(row));
  }

  async update(id: string, data: Partial<Omit<Permission, "id">>): Promise<Result<Permission, AppError>> {
    try {
      const row = await prisma.permission.update({ where: { id }, data });
      return ok(toDomain(row));
    } catch {
      return err(new NotFoundError(`Permission "${id}" not found`));
    }
  }

  async delete(id: string): Promise<Result<void, AppError>> {
    try {
      await prisma.permission.delete({ where: { id } });
      return ok(undefined);
    } catch {
      return err(new NotFoundError(`Permission "${id}" not found`));
    }
  }
}
