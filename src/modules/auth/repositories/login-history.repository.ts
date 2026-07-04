import { ok, type PaginationParams, type Result } from "@/shared/types";
import type { BaseRepository } from "@/shared/repositories";
import type { AppError } from "@/shared/errors";
import type { LoginHistory } from "../types/login-history";
import { InMemoryStore } from "./in-memory-store";

export interface LoginHistoryRepository extends BaseRepository<LoginHistory, string> {
  findByUser(userId: string): Promise<Result<LoginHistory[], AppError>>;
}

export class InMemoryLoginHistoryRepository implements LoginHistoryRepository {
  private readonly store = new InMemoryStore<LoginHistory>("Login history entry");

  findById = (id: string) => this.store.findById(id);
  findMany = (params?: PaginationParams) => this.store.findMany(params);
  create = (data: Omit<LoginHistory, "id">) => this.store.create(data);
  update = (id: string, data: Partial<Omit<LoginHistory, "id">>) => this.store.update(id, data);
  delete = (id: string) => this.store.delete(id);

  async findByUser(userId: string): Promise<Result<LoginHistory[], AppError>> {
    return ok(
      this.store
        .all()
        .filter((h) => h.userId === userId)
        .sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime())
    );
  }
}
