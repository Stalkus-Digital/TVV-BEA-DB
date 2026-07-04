import { err, ok, type PaginatedResult, type PaginationParams, type Result } from "@/shared/types";
import { NotFoundError, type AppError } from "@/shared/errors";
import { prisma } from "@/shared/database/prisma-client";
import type { ApiKey as PrismaApiKeyRow } from "@/generated/prisma/client";
import type { ApiKey } from "../types/api-key";
import type { ApiKeyRepository } from "./api-key.repository";

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 20;

function toDomain(row: PrismaApiKeyRow): ApiKey {
  return {
    ...row,
    lastUsedAt: row.lastUsedAt?.toISOString() ?? null,
    expiresAt: row.expiresAt?.toISOString() ?? null,
    revokedAt: row.revokedAt?.toISOString() ?? null,
    createdAt: row.createdAt.toISOString(),
  };
}

export class PrismaApiKeyRepository implements ApiKeyRepository {
  async findById(id: string): Promise<Result<ApiKey | null, AppError>> {
    const row = await prisma.apiKey.findUnique({ where: { id } });
    return ok(row ? toDomain(row) : null);
  }

  async findAll(): Promise<Result<ApiKey[], AppError>> {
    const rows = await prisma.apiKey.findMany();
    return ok(rows.map(toDomain));
  }

  async findMany(params: PaginationParams = {}): Promise<Result<PaginatedResult<ApiKey>, AppError>> {
    const page = params.page ?? DEFAULT_PAGE;
    const pageSize = params.pageSize ?? DEFAULT_PAGE_SIZE;
    const [rows, total] = await Promise.all([prisma.apiKey.findMany({ skip: (page - 1) * pageSize, take: pageSize }), prisma.apiKey.count()]);
    return ok({ items: rows.map(toDomain), page, pageSize, total, totalPages: Math.max(1, Math.ceil(total / pageSize)) });
  }

  async create(data: Omit<ApiKey, "id">): Promise<Result<ApiKey, AppError>> {
    const row = await prisma.apiKey.create({ data });
    return ok(toDomain(row));
  }

  async update(id: string, data: Partial<Omit<ApiKey, "id">>): Promise<Result<ApiKey, AppError>> {
    try {
      const row = await prisma.apiKey.update({ where: { id }, data });
      return ok(toDomain(row));
    } catch {
      return err(new NotFoundError(`API key "${id}" not found`));
    }
  }

  async delete(id: string): Promise<Result<void, AppError>> {
    try {
      await prisma.apiKey.delete({ where: { id } });
      return ok(undefined);
    } catch {
      return err(new NotFoundError(`API key "${id}" not found`));
    }
  }
}
