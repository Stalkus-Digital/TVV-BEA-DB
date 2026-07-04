import { err, ok, type PaginatedResult, type PaginationParams, type Result } from "@/shared/types";
import { NotFoundError, type AppError } from "@/shared/errors";
import { prisma } from "@/shared/database/prisma-client";
import type { RefreshToken as PrismaRefreshTokenRow } from "@/generated/prisma/client";
import type { RefreshToken } from "../types/refresh-token";
import type { RefreshTokenRepository } from "./refresh-token.repository";

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 20;

function toDomain(row: PrismaRefreshTokenRow): RefreshToken {
  return { ...row, expiresAt: row.expiresAt.toISOString(), revokedAt: row.revokedAt?.toISOString() ?? null, createdAt: row.createdAt.toISOString() };
}

export class PrismaRefreshTokenRepository implements RefreshTokenRepository {
  async findById(id: string): Promise<Result<RefreshToken | null, AppError>> {
    const row = await prisma.refreshToken.findUnique({ where: { id } });
    return ok(row ? toDomain(row) : null);
  }

  async findBySession(sessionId: string): Promise<Result<RefreshToken[], AppError>> {
    const rows = await prisma.refreshToken.findMany({ where: { sessionId } });
    return ok(rows.map(toDomain));
  }

  async findMany(params: PaginationParams = {}): Promise<Result<PaginatedResult<RefreshToken>, AppError>> {
    const page = params.page ?? DEFAULT_PAGE;
    const pageSize = params.pageSize ?? DEFAULT_PAGE_SIZE;
    const [rows, total] = await Promise.all([
      prisma.refreshToken.findMany({ skip: (page - 1) * pageSize, take: pageSize }),
      prisma.refreshToken.count(),
    ]);
    return ok({ items: rows.map(toDomain), page, pageSize, total, totalPages: Math.max(1, Math.ceil(total / pageSize)) });
  }

  async create(data: Omit<RefreshToken, "id">): Promise<Result<RefreshToken, AppError>> {
    const row = await prisma.refreshToken.create({ data });
    return ok(toDomain(row));
  }

  async update(id: string, data: Partial<Omit<RefreshToken, "id">>): Promise<Result<RefreshToken, AppError>> {
    try {
      const row = await prisma.refreshToken.update({ where: { id }, data });
      return ok(toDomain(row));
    } catch {
      return err(new NotFoundError(`Refresh token "${id}" not found`));
    }
  }

  async delete(id: string): Promise<Result<void, AppError>> {
    try {
      await prisma.refreshToken.delete({ where: { id } });
      return ok(undefined);
    } catch {
      return err(new NotFoundError(`Refresh token "${id}" not found`));
    }
  }
}
