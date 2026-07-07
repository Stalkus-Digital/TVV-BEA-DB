import { ok, type PaginationParams, type Result } from "@/shared/types";
import type { BaseRepository } from "@/shared/repositories";
import type { AppError } from "@/shared/errors";
import type { PasswordReset } from "../types/password-reset";
import { PrismaStore } from "@/shared/database/prisma-store";
import { prisma } from "@/shared/database/prisma-client";

export interface PasswordResetRepository extends BaseRepository<PasswordReset, string> {
  findByUser(userId: string): Promise<Result<PasswordReset[], AppError>>;
}

export class PrismaPasswordResetRepository extends PrismaStore<any> implements PasswordResetRepository {
  constructor() {
    super(prisma.passwordReset);
  }

  async findByUser(userId: string): Promise<Result<PasswordReset[], AppError>> {
    return ok((await this.delegate.findMany()).filter(( r: any ) => r.userId === userId));
  }
}
