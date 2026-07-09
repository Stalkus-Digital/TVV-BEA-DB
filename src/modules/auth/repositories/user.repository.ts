import { DEFAULT_PAGINATION, ok, toPaginatedResult, type PaginatedResult, type PaginationParams, type Result } from "@/shared/types";
import type { BaseRepository } from "@/shared/repositories";
import type { AppError } from "@/shared/errors";
import type { User } from "../types/user";
import { PrismaStore } from "@/shared/database/prisma-store";
import { prisma } from "@/shared/database/prisma-client";

export interface UserListFilter extends PaginationParams {
  isActive?: boolean;
}

export interface UserRepository extends BaseRepository<User, string> {
  findByEmail(email: string): Promise<Result<User | null, AppError>>;
  findByFilter(filter: UserListFilter): Promise<Result<PaginatedResult<User>, AppError>>;
}

export class PrismaUserRepository extends PrismaStore<any> implements UserRepository {
  constructor() {
    super(prisma.user);
  }

  async findByEmail(email: string): Promise<Result<User | null, AppError>> {
    const user = await this.delegate.findFirst({
      where: { email: { equals: email, mode: 'insensitive' } }
    });
    return ok(user ?? null);
  }

  async findByFilter(filter: UserListFilter): Promise<Result<PaginatedResult<User>, AppError>> {
    const page = filter.page ?? DEFAULT_PAGINATION.page;
    const pageSize = filter.pageSize ?? DEFAULT_PAGINATION.pageSize;
    const skip = (page - 1) * pageSize;

    const where: any = {};
    if (filter.isActive !== undefined) {
      where.isActive = filter.isActive;
    }

    const [items, total] = await Promise.all([
      this.delegate.findMany({ where, skip, take: pageSize }),
      this.delegate.count({ where })
    ]);

    return ok(toPaginatedResult(items, total, { page, pageSize }));
  }
}
