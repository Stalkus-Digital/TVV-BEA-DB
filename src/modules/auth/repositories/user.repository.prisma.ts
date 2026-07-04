import { err, ok, type PaginatedResult, type PaginationParams, type Result } from "@/shared/types";
import { NotFoundError, type AppError } from "@/shared/errors";
import { prisma } from "@/shared/database/prisma-client";
import type { User as PrismaUserRow } from "@/generated/prisma/client";
import type { User } from "../types/user";
import type { UserListFilter, UserRepository } from "./user.repository";

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 20;

function toDomain(row: PrismaUserRow): User {
  return {
    ...row,
    lockedUntil: row.lockedUntil?.toISOString() ?? null,
    lastLoginAt: row.lastLoginAt?.toISOString() ?? null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export class PrismaUserRepository implements UserRepository {
  async findById(id: string): Promise<Result<User | null, AppError>> {
    const row = await prisma.user.findUnique({ where: { id } });
    return ok(row ? toDomain(row) : null);
  }

  async findByEmail(email: string): Promise<Result<User | null, AppError>> {
    const row = await prisma.user.findFirst({ where: { email: { equals: email, mode: "insensitive" } } });
    return ok(row ? toDomain(row) : null);
  }

  async findMany(params: PaginationParams = {}): Promise<Result<PaginatedResult<User>, AppError>> {
    return this.findByFilter(params);
  }

  async findByFilter(filter: UserListFilter): Promise<Result<PaginatedResult<User>, AppError>> {
    const page = filter.page ?? DEFAULT_PAGE;
    const pageSize = filter.pageSize ?? DEFAULT_PAGE_SIZE;
    const where = filter.isActive !== undefined ? { isActive: filter.isActive } : {};
    const [rows, total] = await Promise.all([
      prisma.user.findMany({ where, skip: (page - 1) * pageSize, take: pageSize, orderBy: { createdAt: "desc" } }),
      prisma.user.count({ where }),
    ]);
    return ok({ items: rows.map(toDomain), page, pageSize, total, totalPages: Math.max(1, Math.ceil(total / pageSize)) });
  }

  async create(data: Omit<User, "id">): Promise<Result<User, AppError>> {
    const row = await prisma.user.create({ data });
    return ok(toDomain(row));
  }

  async update(id: string, data: Partial<Omit<User, "id">>): Promise<Result<User, AppError>> {
    try {
      const row = await prisma.user.update({ where: { id }, data });
      return ok(toDomain(row));
    } catch {
      return err(new NotFoundError(`User "${id}" not found`));
    }
  }

  async delete(id: string): Promise<Result<void, AppError>> {
    try {
      await prisma.user.delete({ where: { id } });
      return ok(undefined);
    } catch {
      return err(new NotFoundError(`User "${id}" not found`));
    }
  }
}
