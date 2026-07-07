import { DEFAULT_PAGINATION, ok, toPaginatedResult, type PaginatedResult, type PaginationParams, type Result } from "@/shared/types";
import type { BaseRepository } from "@/shared/repositories";
import type { AppError } from "@/shared/errors";
import type { Package, PackageSourceType, PackageStatus } from "../types/package";
import { PrismaStore } from "@/shared/database/prisma-store";
import { prisma } from "@/shared/database/prisma-client";

export interface PackageListFilter extends PaginationParams {
  destinationId?: string;
  status?: PackageStatus;
  sourceType?: PackageSourceType;
  isTemplate?: boolean;
}

export interface PackageRepository extends BaseRepository<Package, string> {
  findByCode(code: string): Promise<Result<Package | null, AppError>>;
  findBySlug(slug: string): Promise<Result<Package | null, AppError>>;
  findByFilter(filter: PackageListFilter): Promise<Result<PaginatedResult<Package>, AppError>>;
}

export class PrismaPackageRepository extends PrismaStore<any> implements PackageRepository {
  constructor() {
    super(prisma.package);
  }

  async findByCode(code: string): Promise<Result<Package | null, AppError>> {
    return ok((await this.delegate.findMany()).find(( p: any ) => p.code === code) ?? null);
  }

  async findBySlug(slug: string): Promise<Result<Package | null, AppError>> {
    return ok((await this.delegate.findMany()).find(( p: any ) => p.slug === slug) ?? null);
  }

  async findByFilter(filter: PackageListFilter): Promise<Result<PaginatedResult<Package>, AppError>> {
    let items = (await this.delegate.findMany());
    if (filter.destinationId) items = items.filter(( p: any ) => p.destinationId === filter.destinationId);
    if (filter.status) items = items.filter(( p: any ) => p.status === filter.status);
    if (filter.sourceType) items = items.filter(( p: any ) => p.sourceType === filter.sourceType);
    if (filter.isTemplate !== undefined) items = items.filter(( p: any ) => p.isTemplate === filter.isTemplate);

    const page = filter.page ?? DEFAULT_PAGINATION.page;
    const pageSize = filter.pageSize ?? DEFAULT_PAGINATION.pageSize;
    const start = (page - 1) * pageSize;
    return ok(toPaginatedResult(items.slice(start, start + pageSize), items.length, { page, pageSize }));
  }
}
