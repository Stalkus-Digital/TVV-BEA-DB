import { err, ok, type PaginatedResult, type PaginationParams, type Result } from "@/shared/types";
import { NotFoundError, type AppError } from "@/shared/errors";
import { prisma } from "@/shared/database/prisma-client";
import type { PasswordReset as PrismaPasswordResetRow } from "@/generated/prisma/client";
import type { PasswordReset } from "../types/password-reset";
import type { PasswordResetRepository } from "./password-reset.repository";

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 20;

function toDomain(row: PrismaPasswordResetRow): PasswordReset {
  return { ...row, expiresAt: row.expiresAt.toISOString(), usedAt: row.usedAt?.toISOString() ?? null, createdAt: row.createdAt.toISOString() };
}

export class PrismaPasswordResetRepository implements PasswordResetRepository {
  async findById(id: string): Promise<Result<PasswordReset | null, AppError>> {
    const row = await prisma.passwordReset.findUnique({ where: { id } });
    return ok(row ? toDomain(row) : null);
  }

  async findByUser(userId: string): Promise<Result<PasswordReset[], AppError>> {
    const rows = await prisma.passwordReset.findMany({ where: { userId } });
    return ok(rows.map(toDomain));
  }

  async findMany(params: PaginationParams = {}): Promise<Result<PaginatedResult<PasswordReset>, AppError>> {
    const page = params.page ?? DEFAULT_PAGE;
    const pageSize = params.pageSize ?? DEFAULT_PAGE_SIZE;
    const [rows, total] = await Promise.all([
      prisma.passwordReset.findMany({ skip: (page - 1) * pageSize, take: pageSize }),
      prisma.passwordReset.count(),
    ]);
    return ok({ items: rows.map(toDomain), page, pageSize, total, totalPages: Math.max(1, Math.ceil(total / pageSize)) });
  }

  async create(data: Omit<PasswordReset, "id">): Promise<Result<PasswordReset, AppError>> {
    const row = await prisma.passwordReset.create({ data });
    return ok(toDomain(row));
  }

  async update(id: string, data: Partial<Omit<PasswordReset, "id">>): Promise<Result<PasswordReset, AppError>> {
    try {
      const row = await prisma.passwordReset.update({ where: { id }, data });
      return ok(toDomain(row));
    } catch {
      return err(new NotFoundError(`Password reset request "${id}" not found`));
    }
  }

  async delete(id: string): Promise<Result<void, AppError>> {
    try {
      await prisma.passwordReset.delete({ where: { id } });
      return ok(undefined);
    } catch {
      return err(new NotFoundError(`Password reset request "${id}" not found`));
    }
  }
}
