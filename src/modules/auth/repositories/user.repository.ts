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
    return ok((await this.delegate.findMany()).find(( u: any ) => u.email.toLowerCase() === email.toLowerCase()) ?? null);
  }

  async findByFilter(filter: UserListFilter): Promise<Result<PaginatedResult<User>, AppError>> {
    let items = (await this.delegate.findMany());
    if (filter.isActive !== undefined) items = items.filter(( u: any ) => u.isActive === filter.isActive);
    const page = filter.page ?? DEFAULT_PAGINATION.page;
    const pageSize = filter.pageSize ?? DEFAULT_PAGINATION.pageSize;
    const start = (page - 1) * pageSize;
    return ok(toPaginatedResult(items.slice(start, start + pageSize), items.length, { page, pageSize }));
  }
}
