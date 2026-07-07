import { ok, type PaginationParams, type Result } from "@/shared/types";
import type { BaseRepository } from "@/shared/repositories";
import type { AppError } from "@/shared/errors";
import type { Role, RoleName } from "../types/role";
import { PrismaStore } from "@/shared/database/prisma-store";
import { prisma } from "@/shared/database/prisma-client";

export interface RoleRepository extends BaseRepository<Role, string> {
  findByName(name: RoleName): Promise<Result<Role | null, AppError>>;
  /**
   * Async, Result-wrapped — not a synchronous in-memory array return. A
   * real database has no synchronous read path; this was only ever viable
   * against a Map. See docs/23_DATABASE_MIGRATION.md's Repository Changes
   * section for why this interface had to change (a persistence-layer
   * necessity, not a business-logic change — every caller already awaited
   * every other repository method).
   */
  findAll(): Promise<Result<Role[], AppError>>;
}

export class PrismaRoleRepository extends PrismaStore<any> implements RoleRepository {
  constructor() {
    super(prisma.role);
  }

  async findByName(name: RoleName): Promise<Result<Role | null, AppError>> {
    return ok((await this.delegate.findMany()).find(( r: any ) => r.name === name) ?? null);
  }

  async findAll(): Promise<Result<Role[], AppError>> {
    return ok((await this.delegate.findMany()));
  }
}
