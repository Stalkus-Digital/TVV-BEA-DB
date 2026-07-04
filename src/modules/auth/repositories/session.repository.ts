import { ok, type PaginationParams, type Result } from "@/shared/types";
import type { BaseRepository } from "@/shared/repositories";
import type { AppError } from "@/shared/errors";
import type { Session } from "../types/session";
import { InMemoryStore } from "./in-memory-store";

export interface SessionRepository extends BaseRepository<Session, string> {
  findByUser(userId: string): Promise<Result<Session[], AppError>>;
}

export class InMemorySessionRepository implements SessionRepository {
  private readonly store = new InMemoryStore<Session>("Session");

  findById = (id: string) => this.store.findById(id);
  findMany = (params?: PaginationParams) => this.store.findMany(params);
  create = (data: Omit<Session, "id">) => this.store.create(data);
  update = (id: string, data: Partial<Omit<Session, "id">>) => this.store.update(id, data);
  delete = (id: string) => this.store.delete(id);

  async findByUser(userId: string): Promise<Result<Session[], AppError>> {
    return ok(this.store.all().filter((s) => s.userId === userId));
  }
}
