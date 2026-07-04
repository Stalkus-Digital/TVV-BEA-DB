import { err, ok, type PaginatedResult, type PaginationParams, type Result } from "@/shared/types";
import { NotFoundError, type AppError } from "@/shared/errors";
import { prisma } from "@/shared/database/prisma-client";
import type { Session as PrismaSessionRow } from "@/generated/prisma/client";
import type { Session } from "../types/session";
import type { SessionRepository } from "./session.repository";

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 20;

function toDomain(row: PrismaSessionRow): Session {
  return {
    ...row,
    expiresAt: row.expiresAt.toISOString(),
    revokedAt: row.revokedAt?.toISOString() ?? null,
    lastActivityAt: row.lastActivityAt.toISOString(),
    createdAt: row.createdAt.toISOString(),
  };
}

export class PrismaSessionRepository implements SessionRepository {
  async findById(id: string): Promise<Result<Session | null, AppError>> {
    const row = await prisma.session.findUnique({ where: { id } });
    return ok(row ? toDomain(row) : null);
  }

  async findByUser(userId: string): Promise<Result<Session[], AppError>> {
    const rows = await prisma.session.findMany({ where: { userId } });
    return ok(rows.map(toDomain));
  }

  async findMany(params: PaginationParams = {}): Promise<Result<PaginatedResult<Session>, AppError>> {
    const page = params.page ?? DEFAULT_PAGE;
    const pageSize = params.pageSize ?? DEFAULT_PAGE_SIZE;
    const [rows, total] = await Promise.all([
      prisma.session.findMany({ skip: (page - 1) * pageSize, take: pageSize }),
      prisma.session.count(),
    ]);
    return ok({ items: rows.map(toDomain), page, pageSize, total, totalPages: Math.max(1, Math.ceil(total / pageSize)) });
  }

  async create(data: Omit<Session, "id">): Promise<Result<Session, AppError>> {
    const row = await prisma.session.create({ data });
    return ok(toDomain(row));
  }

  async update(id: string, data: Partial<Omit<Session, "id">>): Promise<Result<Session, AppError>> {
    try {
      const row = await prisma.session.update({ where: { id }, data });
      return ok(toDomain(row));
    } catch {
      return err(new NotFoundError(`Session "${id}" not found`));
    }
  }

  async delete(id: string): Promise<Result<void, AppError>> {
    try {
      await prisma.session.delete({ where: { id } });
      return ok(undefined);
    } catch {
      return err(new NotFoundError(`Session "${id}" not found`));
    }
  }
}
