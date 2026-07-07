import { ok, type PaginationParams, type Result } from "@/shared/types";
import type { BaseRepository } from "@/shared/repositories";
import type { AppError } from "@/shared/errors";
import type { Session } from "../types/session";
import { PrismaStore } from "@/shared/database/prisma-store";
import { prisma } from "@/shared/database/prisma-client";

export interface SessionRepository extends BaseRepository<Session, string> {
  findByUser(userId: string): Promise<Result<Session[], AppError>>;
}

export class PrismaSessionRepository extends PrismaStore<any> implements SessionRepository {
  constructor() {
    super(prisma.session);
  }

  async findByUser(userId: string): Promise<Result<Session[], AppError>> {
    return ok((await this.delegate.findMany()).filter(( s: any ) => s.userId === userId));
  }
}
