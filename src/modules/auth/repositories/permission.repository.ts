import { ok, type PaginationParams, type Result } from "@/shared/types";
import type { BaseRepository } from "@/shared/repositories";
import type { AppError } from "@/shared/errors";
import type { Permission } from "../types/permission";
import { PrismaStore } from "@/shared/database/prisma-store";
import { prisma } from "@/shared/database/prisma-client";

export interface PermissionRepository extends BaseRepository<Permission, string> {
  findByKey(key: string): Promise<Result<Permission | null, AppError>>;
  /** Async, Result-wrapped — see RoleRepository.findAll()'s docstring for why. */
  findAll(): Promise<Result<Permission[], AppError>>;
}

export class PrismaPermissionRepository extends PrismaStore<any> implements PermissionRepository {
  constructor() {
    super(prisma.permission);
  }

  async findByKey(key: string): Promise<Result<Permission | null, AppError>> {
    return ok((await this.delegate.findMany()).find(( p: any ) => p.key === key) ?? null);
  }

  async findAll(): Promise<Result<Permission[], AppError>> {
    return ok((await this.delegate.findMany()));
  }
}
