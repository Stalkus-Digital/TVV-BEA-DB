import { ok, type PaginationParams, type Result } from "@/shared/types";
import type { BaseRepository } from "@/shared/repositories";
import type { AppError } from "@/shared/errors";
import type { Permission } from "../types/permission";
import { InMemoryStore } from "./in-memory-store";

export interface PermissionRepository extends BaseRepository<Permission, string> {
  findByKey(key: string): Promise<Result<Permission | null, AppError>>;
  /** Async, Result-wrapped — see RoleRepository.findAll()'s docstring for why. */
  findAll(): Promise<Result<Permission[], AppError>>;
}

export class InMemoryPermissionRepository implements PermissionRepository {
  private readonly store = new InMemoryStore<Permission>("Permission");

  findById = (id: string) => this.store.findById(id);
  findMany = (params?: PaginationParams) => this.store.findMany(params);
  create = (data: Omit<Permission, "id">) => this.store.create(data);
  update = (id: string, data: Partial<Omit<Permission, "id">>) => this.store.update(id, data);
  delete = (id: string) => this.store.delete(id);

  async findByKey(key: string): Promise<Result<Permission | null, AppError>> {
    return ok(this.store.all().find((p) => p.key === key) ?? null);
  }

  async findAll(): Promise<Result<Permission[], AppError>> {
    return ok(this.store.all());
  }
}
