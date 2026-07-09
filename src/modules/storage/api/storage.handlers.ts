import { err, isErr, ok, type Result } from "@/shared/types";
import { UnauthorizedError, ValidationError, type AppError } from "@/shared/errors";
import type { AuthContext } from "@/modules/auth";
import { getStorageService } from "../module";
import { StorageCategory } from "../types/storage-category";
import type { StorageObject } from "../types/storage-object";
import type { SignedUrlResult } from "../services/storage.service";
import { prisma } from "@/shared/database/prisma-client";

function isStorageCategory(value: unknown): value is StorageCategory {
  return typeof value === "string" && Object.values(StorageCategory).includes(value as StorageCategory);
}

/**
 * Shape validation for HTTP input lives here rather than a `validation/`
 * folder — this sprint's explicit folder list omits one, unlike Customer's.
 * `ownerId` is trusted from the request here because these are
 * admin-permission-gated platform routes (see route-permission-map.ts),
 * not a customer-facing row-level boundary; any future customer-facing
 * route built on top of this module (e.g. a profile-avatar upload) MUST
 * derive `ownerId` from `AuthContext.userId`, never from the client body,
 * matching the Customer module's "never accept customerId from the
 * client" discipline.
 */
export interface UploadRequestInput {
  fileBuffer: Buffer;
  contentType: string;
  fileName: string;
  category: unknown;
  ownerId: unknown;
}

function validateUploadShape(input: UploadRequestInput): Result<{ category: StorageCategory; ownerId: string }, AppError> {
  if (!isStorageCategory(input.category)) {
    return err(new ValidationError(`category must be one of: ${Object.values(StorageCategory).join(", ")}`));
  }
  if (typeof input.ownerId !== "string" || input.ownerId.length === 0) {
    return err(new ValidationError("ownerId is required"));
  }
  return ok({ category: input.category, ownerId: input.ownerId });
}

export async function uploadHandler(context: AuthContext | null, input: UploadRequestInput): Promise<Result<StorageObject, AppError>> {
  if (!context) return err(new UnauthorizedError("Not authenticated"));
  const validated = validateUploadShape(input);
  if (isErr(validated)) return validated;

  const result = await getStorageService().upload(input.fileBuffer, {
    category: validated.value.category,
    ownerId: validated.value.ownerId,
    fileName: input.fileName,
    contentType: input.contentType,
  });

  if (!isErr(result)) {
    try {
      await prisma.mediaAsset.create({
        data: {
          key: result.value.key,
          url: result.value.url,
          fileName: (result.value as any).fileName || input.fileName,
          category: (result.value as any).category,
          sizeBytes: (result.value as any).sizeBytes || (result.value as any).size,
          mimeType: (result.value as any).contentType || (result.value as any).mimeType,
        }
      });
    } catch (e) {
      console.error("Failed to save media asset to DB", e);
    }
  }

  return result;
}

export interface ReplaceRequestInput extends UploadRequestInput {
  existingKey: unknown;
}

export async function replaceHandler(context: AuthContext | null, input: ReplaceRequestInput): Promise<Result<StorageObject, AppError>> {
  if (!context) return err(new UnauthorizedError("Not authenticated"));
  const validated = validateUploadShape(input);
  if (isErr(validated)) return validated;
  if (typeof input.existingKey !== "string" || input.existingKey.length === 0) {
    return err(new ValidationError("existingKey is required"));
  }

  return getStorageService().replace(input.fileBuffer, {
    category: validated.value.category,
    ownerId: validated.value.ownerId,
    fileName: input.fileName,
    contentType: input.contentType,
    existingKey: input.existingKey,
  });
}

export async function deleteHandler(context: AuthContext | null, body: unknown): Promise<Result<void, AppError>> {
  if (!context) return err(new UnauthorizedError("Not authenticated"));
  const record = (body ?? {}) as Record<string, unknown>;
  if (!isStorageCategory(record.category)) {
    return err(new ValidationError(`category must be one of: ${Object.values(StorageCategory).join(", ")}`));
  }
  if (typeof record.key !== "string" || !record.key) return err(new ValidationError("key is required"));
  if (typeof record.ownerId !== "string" || !record.ownerId) return err(new ValidationError("ownerId is required"));

  const result = await getStorageService().delete(record.category, record.key, record.ownerId);
  if (!isErr(result)) {
    try {
      await prisma.mediaAsset.delete({
        where: { key: record.key }
      });
    } catch (e) {
      console.error("Failed to delete media asset from DB", e);
    }
  }
  return result;
}

export async function metadataHandler(
  context: AuthContext | null,
  category: unknown,
  key: unknown,
  ownerId: unknown
): Promise<Result<StorageObject | null, AppError>> {
  if (!context) return err(new UnauthorizedError("Not authenticated"));
  if (!isStorageCategory(category)) {
    return err(new ValidationError(`category must be one of: ${Object.values(StorageCategory).join(", ")}`));
  }
  if (typeof key !== "string" || !key) return err(new ValidationError("key is required"));
  if (typeof ownerId !== "string" || !ownerId) return err(new ValidationError("ownerId is required"));

  return getStorageService().getMetadata(category, key, ownerId);
}

export async function signedUrlHandler(
  context: AuthContext | null,
  category: unknown,
  key: unknown,
  ownerId: unknown,
  ttlSeconds: unknown
): Promise<Result<SignedUrlResult, AppError>> {
  if (!context) return err(new UnauthorizedError("Not authenticated"));
  if (!isStorageCategory(category)) {
    return err(new ValidationError(`category must be one of: ${Object.values(StorageCategory).join(", ")}`));
  }
  if (typeof key !== "string" || !key) return err(new ValidationError("key is required"));
  if (typeof ownerId !== "string" || !ownerId) return err(new ValidationError("ownerId is required"));

  const ttl = typeof ttlSeconds === "string" && ttlSeconds.length > 0 ? Number(ttlSeconds) : undefined;
  if (ttl !== undefined && !Number.isFinite(ttl)) return err(new ValidationError("ttlSeconds must be a number"));

  return getStorageService().getSignedUrl(category, key, ownerId, ttl);
}

/** The download-proxy handler is deliberately unauthenticated — the HMAC signature itself is the credential (see route-permission-map.ts's PUBLIC_EXACT_PATHS entry for this route). */
export async function downloadHandler(
  key: unknown,
  expiresAt: unknown,
  signature: unknown
): Promise<Result<{ body: Buffer; contentType: string }, AppError>> {
  if (typeof key !== "string" || !key) return err(new ValidationError("key is required"));
  if (typeof signature !== "string" || !signature) return err(new ValidationError("signature is required"));
  const expiresAtNum = Number(expiresAt);
  if (!Number.isFinite(expiresAtNum)) return err(new ValidationError("expiresAt is required"));

  return getStorageService().downloadPrivateObject(key, expiresAtNum, signature);
}
