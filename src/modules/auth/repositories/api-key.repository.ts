import { ok, type PaginationParams, type Result } from "@/shared/types";
import type { BaseRepository } from "@/shared/repositories";
import type { AppError } from "@/shared/errors";
import type { ApiKey } from "../types/api-key";
import { PrismaStore } from "@/shared/database/prisma-store";
import { prisma } from "@/shared/database/prisma-client";

export interface ApiKeyRepository extends BaseRepository<ApiKey, string> {
  /** Async, Result-wrapped — see RoleRepository.findAll()'s docstring for why. */
  findAll(): Promise<Result<ApiKey[], AppError>>;
}

export class PrismaApiKeyRepository extends PrismaStore<any> implements ApiKeyRepository {
  constructor() {
    super(prisma.apiKey);
  }

  async findAll(): Promise<Result<ApiKey[], AppError>> {
    return ok((await this.delegate.findMany()));
  }
}
