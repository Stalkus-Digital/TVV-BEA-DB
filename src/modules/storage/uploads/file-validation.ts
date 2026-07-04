import { err, ok, type Result } from "@/shared/types";
import { ValidationError, type AppError } from "@/shared/errors";
import { StorageCategory } from "../types/storage-category";
import { StorageConfigService } from "../services/storage-config.service";

const IMAGE_CATEGORIES: readonly StorageCategory[] = [
  StorageCategory.PROFILE_IMAGE,
  StorageCategory.PACKAGE_IMAGE,
  StorageCategory.DESTINATION_IMAGE,
  StorageCategory.GALLERY_IMAGE,
];

const ALLOWED_IMAGE_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const ALLOWED_DOCUMENT_MIME_TYPES = new Set(["application/pdf", "image/jpeg", "image/png"]);

export function isImageCategory(category: StorageCategory): boolean {
  return IMAGE_CATEGORIES.includes(category);
}

export interface FileValidationInput {
  category: StorageCategory;
  contentType: string;
  size: number;
}

/**
 * The one place mime-type/size rules are decided for every upload — the
 * `images/` and `documents/` validators both delegate here rather than
 * re-deciding limits per category.
 */
export function validateFile(input: FileValidationInput): Result<void, AppError> {
  const config = StorageConfigService.getInstance();
  const isImage = isImageCategory(input.category);
  const allowedMimeTypes = isImage ? ALLOWED_IMAGE_MIME_TYPES : ALLOWED_DOCUMENT_MIME_TYPES;
  const maxSize = isImage ? config.get("maxImageSizeBytes") : config.get("maxDocumentSizeBytes");

  if (input.size <= 0) {
    return err(new ValidationError("File is empty"));
  }
  if (!allowedMimeTypes.has(input.contentType)) {
    return err(new ValidationError(`Content type "${input.contentType}" is not allowed for category "${input.category}"`));
  }
  if (input.size > maxSize) {
    return err(new ValidationError(`File size ${input.size} bytes exceeds the ${maxSize}-byte limit for category "${input.category}"`));
  }
  return ok(undefined);
}
