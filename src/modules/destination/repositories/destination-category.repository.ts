import { randomUUID } from "node:crypto";
import {
  DEFAULT_PAGINATION,
  err,
  ok,
  toPaginatedResult,
  type PaginatedResult,
  type PaginationParams,
  type Result,
} from "@/shared/types";
import type { BaseRepository } from "@/shared/repositories";
import { NotFoundError, type AppError } from "@/shared/errors";
import type { DestinationCategory } from "../types/destination-category";

export interface DestinationCategoryRepository extends BaseRepository<DestinationCategory, string> {
  findBySlug(slug: string): Promise<Result<DestinationCategory | null, AppError>>;
}

import { PrismaStore } from "@/shared/database/prisma-store";
import { prisma } from "@/shared/database/prisma-client";

export class PrismaDestinationCategoryRepository extends PrismaStore<any> implements DestinationCategoryRepository {
  constructor() {
    super(prisma.destinationCategory);
  }

  async findBySlug(slug: string): Promise<Result<DestinationCategory | null, AppError>> {
    return ok((await this.delegate.findMany()).find(( c: any ) => c.slug === slug) ?? null);
  }
}
