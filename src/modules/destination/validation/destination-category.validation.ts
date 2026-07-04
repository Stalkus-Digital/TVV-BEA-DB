import { err, ok, type Result } from "@/shared/types";
import { ValidationError } from "@/shared/errors";

export interface CreateDestinationCategoryInput {
  name: string;
  slug: string;
}

function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function validateCreateDestinationCategory(
  input: unknown
): Result<CreateDestinationCategoryInput, ValidationError> {
  if (typeof input !== "object" || input === null) return err(new ValidationError("Request body must be an object"));
  const { name, slug } = input as Record<string, unknown>;
  if (typeof name !== "string" || name.trim().length === 0) return err(new ValidationError("name is required"));
  const resolvedSlug = typeof slug === "string" && slug.trim().length > 0 ? slug : slugify(name);
  return ok({ name, slug: slugify(resolvedSlug) });
}
