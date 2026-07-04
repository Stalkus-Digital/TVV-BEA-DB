import { DEFAULT_PAGINATION, ok, toPaginatedResult, type PaginatedResult, type PaginationParams, type Result } from "@/shared/types";
import type { BaseRepository } from "@/shared/repositories";
import type { AppError } from "@/shared/errors";
import type { User } from "../types/user";
import { InMemoryStore } from "./in-memory-store";

export interface UserListFilter extends PaginationParams {
  isActive?: boolean;
}

export interface UserRepository extends BaseRepository<User, string> {
  findByEmail(email: string): Promise<Result<User | null, AppError>>;
  findByFilter(filter: UserListFilter): Promise<Result<PaginatedResult<User>, AppError>>;
}

export class InMemoryUserRepository implements UserRepository {
  private readonly store = new InMemoryStore<User>("User");

  findById = (id: string) => this.store.findById(id);
  findMany = (params?: PaginationParams) => this.store.findMany(params);
  create = (data: Omit<User, "id">) => this.store.create(data);
  update = (id: string, data: Partial<Omit<User, "id">>) => this.store.update(id, data);
  delete = (id: string) => this.store.delete(id);

  async findByEmail(email: string): Promise<Result<User | null, AppError>> {
    return ok(this.store.all().find((u) => u.email.toLowerCase() === email.toLowerCase()) ?? null);
  }

  async findByFilter(filter: UserListFilter): Promise<Result<PaginatedResult<User>, AppError>> {
    let items = this.store.all();
    if (filter.isActive !== undefined) items = items.filter((u) => u.isActive === filter.isActive);
    const page = filter.page ?? DEFAULT_PAGINATION.page;
    const pageSize = filter.pageSize ?? DEFAULT_PAGINATION.pageSize;
    const start = (page - 1) * pageSize;
    return ok(toPaginatedResult(items.slice(start, start + pageSize), items.length, { page, pageSize }));
  }
}
