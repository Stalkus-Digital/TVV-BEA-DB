import { ok, type PaginationParams, type Result } from "@/shared/types";
import type { BaseRepository } from "@/shared/repositories";
import type { AppError } from "@/shared/errors";
import type { Role, RoleName } from "../types/role";
import { InMemoryStore } from "./in-memory-store";

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

export class InMemoryRoleRepository implements RoleRepository {
  private readonly store = new InMemoryStore<Role>("Role");

  findById = (id: string) => this.store.findById(id);
  findMany = (params?: PaginationParams) => this.store.findMany(params);
  create = (data: Omit<Role, "id">) => this.store.create(data);
  update = (id: string, data: Partial<Omit<Role, "id">>) => this.store.update(id, data);
  delete = (id: string) => this.store.delete(id);

  async findByName(name: RoleName): Promise<Result<Role | null, AppError>> {
    return ok(this.store.all().find((r) => r.name === name) ?? null);
  }

  async findAll(): Promise<Result<Role[], AppError>> {
    return ok(this.store.all());
  }
}
