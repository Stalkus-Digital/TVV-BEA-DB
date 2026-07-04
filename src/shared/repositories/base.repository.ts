import type { Result } from "../types/result";
import type { PaginatedResult, PaginationParams } from "../types/pagination";
import type { AppError } from "../errors/app-error";

/**
 * Contract every module's repositories implement, regardless of what
 * persists behind them. No ORM/database is wired in yet (Prisma + PostgreSQL
 * are decided per CLAUDE.md but not installed) — this interface has zero
 * dependency on either, so it doesn't need to change when they're added.
 */
export interface BaseRepository<T extends { id: ID }, ID = string> {
  findById(id: ID): Promise<Result<T | null, AppError>>;
  findMany(params?: PaginationParams): Promise<Result<PaginatedResult<T>, AppError>>;
  create(data: Omit<T, "id">): Promise<Result<T, AppError>>;
  update(id: ID, data: Partial<Omit<T, "id">>): Promise<Result<T, AppError>>;
  delete(id: ID): Promise<Result<void, AppError>>;
}
