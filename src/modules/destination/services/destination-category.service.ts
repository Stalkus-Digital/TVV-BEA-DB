import { err, isErr, ok, type PaginatedResult, type PaginationParams, type Result } from "@/shared/types";
import { BaseService, type ServiceContext } from "@/shared/services";
import { NotFoundError, type AppError } from "@/shared/errors";
import type { DestinationCategory } from "../types/destination-category";
import type { DestinationCategoryRepository } from "../repositories/destination-category.repository";
import { validateCreateDestinationCategory } from "../validation/destination-category.validation";

export class DestinationCategoryService extends BaseService {
  constructor(
    context: ServiceContext,
    private readonly repository: DestinationCategoryRepository
  ) {
    super(context);
  }

  async list(params: PaginationParams = {}): Promise<Result<PaginatedResult<DestinationCategory>, AppError>> {
    return this.repository.findMany(params);
  }

  async getById(id: string): Promise<Result<DestinationCategory, AppError>> {
    const result = await this.repository.findById(id);
    if (isErr(result)) return result;
    if (!result.value) return err(new NotFoundError(`Destination category "${id}" not found`));
    return ok(result.value);
  }

  async create(input: unknown): Promise<Result<DestinationCategory, AppError>> {
    const validated = validateCreateDestinationCategory(input);
    if (isErr(validated)) return validated;
    this.logger.info("Creating destination category", { slug: validated.value.slug });
    const now = new Date().toISOString();
    return this.repository.create({ ...validated.value, createdAt: now, updatedAt: now });
  }
}
