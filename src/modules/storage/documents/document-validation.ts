import { err, type Result } from "@/shared/types";
import { ValidationError, type AppError } from "@/shared/errors";
import type { StorageCategory } from "../types/storage-category";
import { isImageCategory, validateFile } from "../uploads/file-validation";

/** Rejects image categories before delegating to the shared mime/size rules in `uploads/file-validation.ts`. */
export function validateDocumentUpload(category: StorageCategory, contentType: string, size: number): Result<void, AppError> {
  if (isImageCategory(category)) {
    return err(new ValidationError(`Category "${category}" is not a document category`));
  }
  return validateFile({ category, contentType, size });
}
