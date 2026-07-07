import { ok, type PaginationParams, type Result } from "@/shared/types";
import type { BaseRepository } from "@/shared/repositories";
import type { AppError } from "@/shared/errors";
import type { LoginHistory } from "../types/login-history";
import { PrismaStore } from "@/shared/database/prisma-store";
import { prisma } from "@/shared/database/prisma-client";

export interface LoginHistoryRepository extends BaseRepository<LoginHistory, string> {
  findByUser(userId: string): Promise<Result<LoginHistory[], AppError>>;
}

export class PrismaLoginHistoryRepository extends PrismaStore<any> implements LoginHistoryRepository {
  constructor() {
    super(prisma.loginHistory);
  }

  async findByUser(userId: string): Promise<Result<LoginHistory[], AppError>> {
    return ok(
      (await this.delegate.findMany())
        .filter(( h: any ) => h.userId === userId)
        .sort(( a: any, b: any ) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime())
    );
  }
}
