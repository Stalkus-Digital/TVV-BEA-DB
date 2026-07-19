import { err, ok, type PaginatedResult, type PaginationParams, type Result } from "@/shared/types";
import { NotFoundError, type AppError } from "@/shared/errors";
import { prisma } from "@/shared/database/prisma-client";
import type { EmailVerification as PrismaEmailVerificationRow } from "@/generated/prisma/client";
import type { EmailVerification } from "../types/email-verification";
import type { EmailVerificationRepository } from "./email-verification.repository";

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 20;

function toDomain(row: PrismaEmailVerificationRow): EmailVerification {
  return {
    ...row,
    expiresAt: row.expiresAt.toISOString(),
    usedAt: row.usedAt?.toISOString() ?? null,
    createdAt: row.createdAt.toISOString(),
  };
}

export class PrismaEmailVerificationRepository implements EmailVerificationRepository {
  async findById(id: string): Promise<Result<EmailVerification | null, AppError>> {
    const row = await prisma.emailVerification.findUnique({ where: { id } });
    return ok(row ? toDomain(row) : null);
  }

  async findByUser(userId: string): Promise<Result<EmailVerification[], AppError>> {
    const rows = await prisma.emailVerification.findMany({ where: { userId } });
    return ok(rows.map(toDomain));
  }

  async findMany(params: PaginationParams = {}): Promise<Result<PaginatedResult<EmailVerification>, AppError>> {
    const page = params.page ?? DEFAULT_PAGE;
    const pageSize = params.pageSize ?? DEFAULT_PAGE_SIZE;
    const [rows, total] = await Promise.all([
      prisma.emailVerification.findMany({ skip: (page - 1) * pageSize, take: pageSize }),
      prisma.emailVerification.count(),
    ]);
    return ok({ items: rows.map(toDomain), page, pageSize, total, totalPages: Math.max(1, Math.ceil(total / pageSize)) });
  }

  async create(data: Omit<EmailVerification, "id">): Promise<Result<EmailVerification, AppError>> {
    const row = await prisma.emailVerification.create({ data });
    return ok(toDomain(row));
  }

  async update(id: string, data: Partial<Omit<EmailVerification, "id">>): Promise<Result<EmailVerification, AppError>> {
    try {
      const row = await prisma.emailVerification.update({ where: { id }, data });
      return ok(toDomain(row));
    } catch {
      return err(new NotFoundError(`Email verification request "${id}" not found`));
    }
  }

  async delete(id: string): Promise<Result<void, AppError>> {
    try {
      await prisma.emailVerification.delete({ where: { id } });
      return ok(undefined);
    } catch {
      return err(new NotFoundError(`Email verification request "${id}" not found`));
    }
  }
}
