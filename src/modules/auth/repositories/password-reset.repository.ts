import { ok, type PaginationParams, type Result } from "@/shared/types";
import type { BaseRepository } from "@/shared/repositories";
import type { AppError } from "@/shared/errors";
import type { PasswordReset } from "../types/password-reset";
import { InMemoryStore } from "./in-memory-store";

export interface PasswordResetRepository extends BaseRepository<PasswordReset, string> {
  findByUser(userId: string): Promise<Result<PasswordReset[], AppError>>;
}

export class InMemoryPasswordResetRepository implements PasswordResetRepository {
  private readonly store = new InMemoryStore<PasswordReset>("Password reset request");

  findById = (id: string) => this.store.findById(id);
  findMany = (params?: PaginationParams) => this.store.findMany(params);
  create = (data: Omit<PasswordReset, "id">) => this.store.create(data);
  update = (id: string, data: Partial<Omit<PasswordReset, "id">>) => this.store.update(id, data);
  delete = (id: string) => this.store.delete(id);

  async findByUser(userId: string): Promise<Result<PasswordReset[], AppError>> {
    return ok(this.store.all().filter((r) => r.userId === userId));
  }
}
