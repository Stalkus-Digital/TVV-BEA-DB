import { ok, err, type Result, type PaginatedResult, type PaginationParams, DEFAULT_PAGINATION, toPaginatedResult } from "@/shared/types";
import { AppError } from "@/shared/errors";


import { InternalError } from "@/shared/errors/common-errors";

function toPrismaData(data: any): any {
  if (data === null || data === undefined) return data;
  if (typeof data !== "object") return data;
  if (Array.isArray(data)) return data.map(toPrismaData);

  const result: any = {};
  for (const [key, value] of Object.entries(data)) {
    // If it's an ISO date string for standard date fields, convert it to a Date object
    if (typeof value === "string" && (key.endsWith("At") || key.startsWith("valid") || key === "dateOfBirth" || key === "passportExpiry")) {
      const d = new Date(value);
      if (!Number.isNaN(d.getTime())) {
        result[key] = d;
        continue;
      }
    }
    result[key] = toPrismaData(value);
  }
  return result;
}

function fromPrismaData(data: any): any {
  if (data === null || data === undefined) return data;
  if (data instanceof Date) return data.toISOString();
  if (typeof data !== "object") return data;
  if (Array.isArray(data)) return data.map(fromPrismaData);

  const result: any = {};
  for (const [key, value] of Object.entries(data)) {
    result[key] = fromPrismaData(value);
  }
  return result;
}


/**
 * A generic Prisma store that implements the BaseRepository interface.
 * Replaces the mock InMemoryStore.
 */
export class PrismaStore<T extends { id: string }> {
  constructor(protected delegate: any) {}

  async findById(id: string): Promise<Result<T | null, AppError>> {
    try {
      const data = await this.delegate.findUnique({ where: { id } });
      return ok(fromPrismaData(data) as T ?? null);
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
      return ok(toPaginatedResult(fromPrismaData(items) as T[], total, { page, pageSize }));
    } catch (error) {
      return err(new InternalError("Failed to fetch records"));
    }
  }

  async create(data: Omit<T, "id">): Promise<Result<T, AppError>> {
    try {
      const created = await this.delegate.create({ data: toPrismaData(data) });
      return ok(fromPrismaData(created) as T);
    } catch (error) {
      console.error("PrismaStore create error:", error);
      return err(new InternalError("Failed to create record"));
    }
  }

  async update(id: string, data: Partial<Omit<T, "id">>): Promise<Result<T, AppError>> {
    try {
      const updated = await this.delegate.update({
        where: { id },
        data: toPrismaData(data),
      });
      return ok(fromPrismaData(updated) as T);
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
