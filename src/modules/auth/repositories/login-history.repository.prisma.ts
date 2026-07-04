import { err, ok, type PaginatedResult, type PaginationParams, type Result } from "@/shared/types";
import { NotFoundError, type AppError } from "@/shared/errors";
import { prisma } from "@/shared/database/prisma-client";
import type { LoginHistory as PrismaLoginHistoryRow } from "@/generated/prisma/client";
import type { LoginHistory } from "../types/login-history";
import type { LoginHistoryRepository } from "./login-history.repository";

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 20;

function toDomain(row: PrismaLoginHistoryRow): LoginHistory {
  return { ...row, eventType: row.eventType as LoginHistory["eventType"], occurredAt: row.occurredAt.toISOString() };
}

export class PrismaLoginHistoryRepository implements LoginHistoryRepository {
  async findById(id: string): Promise<Result<LoginHistory | null, AppError>> {
    const row = await prisma.loginHistory.findUnique({ where: { id } });
    return ok(row ? toDomain(row) : null);
  }

  async findByUser(userId: string): Promise<Result<LoginHistory[], AppError>> {
    const rows = await prisma.loginHistory.findMany({ where: { userId }, orderBy: { occurredAt: "desc" } });
    return ok(rows.map(toDomain));
  }

  async findMany(params: PaginationParams = {}): Promise<Result<PaginatedResult<LoginHistory>, AppError>> {
    const page = params.page ?? DEFAULT_PAGE;
    const pageSize = params.pageSize ?? DEFAULT_PAGE_SIZE;
    const [rows, total] = await Promise.all([
      prisma.loginHistory.findMany({ skip: (page - 1) * pageSize, take: pageSize }),
      prisma.loginHistory.count(),
    ]);
    return ok({ items: rows.map(toDomain), page, pageSize, total, totalPages: Math.max(1, Math.ceil(total / pageSize)) });
  }

  async create(data: Omit<LoginHistory, "id">): Promise<Result<LoginHistory, AppError>> {
    const row = await prisma.loginHistory.create({ data });
    return ok(toDomain(row));
  }

  async update(id: string, data: Partial<Omit<LoginHistory, "id">>): Promise<Result<LoginHistory, AppError>> {
    try {
      const row = await prisma.loginHistory.update({ where: { id }, data });
      return ok(toDomain(row));
    } catch {
      return err(new NotFoundError(`Login history entry "${id}" not found`));
    }
  }

  async delete(id: string): Promise<Result<void, AppError>> {
    try {
      await prisma.loginHistory.delete({ where: { id } });
      return ok(undefined);
    } catch {
      return err(new NotFoundError(`Login history entry "${id}" not found`));
    }
  }
}
