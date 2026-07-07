import { ok, err, type Result, type PaginatedResult, type PaginationParams, DEFAULT_PAGINATION, toPaginatedResult } from "@/shared/types";
import { AppError } from "@/shared/errors";


import { InternalError } from "@/shared/errors/common-errors";

/**
 * A generic Prisma store that implements the BaseRepository interface.
 * Replaces the mock InMemoryStore.
 */
export class PrismaStore<T extends { id: string }> {
  constructor(protected delegate: any) {}

  async findById(id: string): Promise<Result<T | null, AppError>> {
    try {
      const data = await this.delegate.findUnique({ where: { id } });
      return ok((data as T) ?? null);
    } catch (error) {
      return err(new InternalError("Failed to fetch record by ID"));
    }
  }

  async findMany(params?: PaginationParams): Promise<Result<PaginatedResult<T>, AppError>> {
    try {
      const page = params?.page ?? DEFAULT_PAGINATION.page;
      const pageSize = params?.pageSize ?? DEFAULT_PAGINATION.pageSize;
      const skip = (page - 1) * pageSize;
      
      const [items, total] = await Promise.all([
        this.delegate.findMany({ skip, take: pageSize }),
        this.delegate.count(),
      ]);
      
      return ok(toPaginatedResult(items as T[], total, { page, pageSize }));
    } catch (error) {
      return err(new InternalError("Failed to fetch records"));
    }
  }

  async create(data: Omit<T, "id">): Promise<Result<T, AppError>> {
    try {
      const created = await this.delegate.create({ data });
      return ok(created as T);
    } catch (error) {
      return err(new InternalError("Failed to create record"));
    }
  }

  async update(id: string, data: Partial<Omit<T, "id">>): Promise<Result<T, AppError>> {
    try {
      const updated = await this.delegate.update({
        where: { id },
        data,
      });
      return ok(updated as T);
    } catch (error) {
      if ((error as any)?.code && (error as any).code === "P2025") {
        return err(new InternalError("Record not found"));
      }
      return err(new InternalError("Failed to update record"));
    }
  }

  async delete(id: string): Promise<Result<void, AppError>> {
    try {
      await this.delegate.delete({ where: { id } });
      return ok(undefined);
    } catch (error) {
      if ((error as any)?.code && (error as any).code === "P2025") {
        return err(new InternalError("Record not found"));
      }
      return err(new InternalError("Failed to delete record"));
    }
  }
}
