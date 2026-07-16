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
import type { Destination } from "../types/destination";

export interface DestinationListFilter extends PaginationParams {
  countryId?: string;
  stateId?: string;
  cityId?: string;
  categoryId?: string;
  parentDestinationId?: string | null;
  featured?: boolean;
}

export interface DestinationRepository extends BaseRepository<Destination, string> {
  findBySlug(slug: string): Promise<Result<Destination | null, AppError>>;
  findByFilter(filter: DestinationListFilter): Promise<Result<PaginatedResult<Destination>, AppError>>;
  findChildren(parentDestinationId: string): Promise<Result<Destination[], AppError>>;
  delete(id: string): Promise<Result<void, AppError>>;
}

import { PrismaStore } from "@/shared/database/prisma-store";
import { prisma } from "@/shared/database/prisma-client";

export class PrismaDestinationRepository extends PrismaStore<any> implements DestinationRepository {
  constructor() {
    super(prisma.destination);
  }

  async findBySlug(slug: string): Promise<Result<Destination | null, AppError>> {
    return ok((await this.delegate.findMany()).find((d: any) => d.slug === slug) ?? null);
  }

  async findChildren(parentDestinationId: string): Promise<Result<Destination[], AppError>> {
    return ok((await this.delegate.findMany()).filter((d: any) => d.parentDestinationId === parentDestinationId));
  }

  async findByFilter(filter: DestinationListFilter): Promise<Result<PaginatedResult<Destination>, AppError>> {
    let items = (await this.delegate.findMany());
    if (filter.countryId) items = items.filter((d: any) => d.countryId === filter.countryId);
    if (filter.stateId) items = items.filter((d: any) => d.stateId === filter.stateId);
    if (filter.cityId) items = items.filter((d: any) => d.cityId === filter.cityId);
    if (filter.categoryId) items = items.filter((d: any) => d.categoryIds.includes(filter.categoryId as string));
    if (filter.parentDestinationId !== undefined) {
      items = items.filter((d: any) => d.parentDestinationId === filter.parentDestinationId);
    }
    if (filter.featured !== undefined) items = items.filter((d: any) => d.isFeatured === filter.featured);

    const page = filter.page ?? DEFAULT_PAGINATION.page;
    const pageSize = filter.pageSize ?? DEFAULT_PAGINATION.pageSize;
    const start = (page - 1) * pageSize;
    return ok(toPaginatedResult(items.slice(start, start + pageSize), items.length, { page, pageSize }));
  }
}
