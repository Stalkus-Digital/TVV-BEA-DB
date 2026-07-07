import { ok, type PaginationParams, type Result } from "@/shared/types";
import type { BaseRepository } from "@/shared/repositories";
import type { AppError } from "@/shared/errors";
import type { RefreshToken } from "../types/refresh-token";
import { PrismaStore } from "@/shared/database/prisma-store";
import { prisma } from "@/shared/database/prisma-client";

export interface RefreshTokenRepository extends BaseRepository<RefreshToken, string> {
  findBySession(sessionId: string): Promise<Result<RefreshToken[], AppError>>;
}

export class PrismaRefreshTokenRepository extends PrismaStore<any> implements RefreshTokenRepository {
  constructor() {
    super(prisma.refreshToken);
  }

  async findBySession(sessionId: string): Promise<Result<RefreshToken[], AppError>> {
    return ok((await this.delegate.findMany()).filter(( t: any ) => t.sessionId === sessionId));
  }
}
