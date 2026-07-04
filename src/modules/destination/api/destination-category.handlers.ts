import type { AppError } from "@/shared/errors";
import type { PaginatedResult, Result } from "@/shared/types";
import { getDestinationCategoryService } from "../module";
import type { DestinationCategory } from "../types/destination-category";

export async function listDestinationCategoriesHandler(): Promise<Result<PaginatedResult<DestinationCategory>, AppError>> {
  return getDestinationCategoryService().list();
}

export async function createDestinationCategoryHandler(body: unknown): Promise<Result<DestinationCategory, AppError>> {
  return getDestinationCategoryService().create(body);
}
