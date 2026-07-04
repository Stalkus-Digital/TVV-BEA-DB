import { ok, type PaginationParams, type Result } from "@/shared/types";
import type { BaseRepository } from "@/shared/repositories";
import type { AppError } from "@/shared/errors";
import type { RefreshToken } from "../types/refresh-token";
import { InMemoryStore } from "./in-memory-store";

export interface RefreshTokenRepository extends BaseRepository<RefreshToken, string> {
  findBySession(sessionId: string): Promise<Result<RefreshToken[], AppError>>;
}

export class InMemoryRefreshTokenRepository implements RefreshTokenRepository {
  private readonly store = new InMemoryStore<RefreshToken>("Refresh token");

  findById = (id: string) => this.store.findById(id);
  findMany = (params?: PaginationParams) => this.store.findMany(params);
  create = (data: Omit<RefreshToken, "id">) => this.store.create(data);
  update = (id: string, data: Partial<Omit<RefreshToken, "id">>) => this.store.update(id, data);
  delete = (id: string) => this.store.delete(id);

  async findBySession(sessionId: string): Promise<Result<RefreshToken[], AppError>> {
    return ok(this.store.all().filter((t) => t.sessionId === sessionId));
  }
}
