import { ok, type PaginationParams, type Result } from "@/shared/types";
import type { BaseRepository } from "@/shared/repositories";
import type { AppError } from "@/shared/errors";
import type { ApiKey } from "../types/api-key";
import { InMemoryStore } from "./in-memory-store";

export interface ApiKeyRepository extends BaseRepository<ApiKey, string> {
  /** Async, Result-wrapped — see RoleRepository.findAll()'s docstring for why. */
  findAll(): Promise<Result<ApiKey[], AppError>>;
}

export class InMemoryApiKeyRepository implements ApiKeyRepository {
  private readonly store = new InMemoryStore<ApiKey>("API key");

  findById = (id: string) => this.store.findById(id);
  findMany = (params?: PaginationParams) => this.store.findMany(params);
  create = (data: Omit<ApiKey, "id">) => this.store.create(data);
  update = (id: string, data: Partial<Omit<ApiKey, "id">>) => this.store.update(id, data);
  delete = (id: string) => this.store.delete(id);

  async findAll(): Promise<Result<ApiKey[], AppError>> {
    return ok(this.store.all());
  }
}
