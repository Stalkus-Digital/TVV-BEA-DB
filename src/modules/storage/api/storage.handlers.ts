import { err, isErr, ok, type Result } from "@/shared/types";
import { UnauthorizedError, ValidationError, type AppError } from "@/shared/errors";
import type { AuthContext } from "@/modules/auth";
import { getStorageService } from "../module";
import { StorageCategory } from "../types/storage-category";
import type { StorageObject } from "../types/storage-object";
import type { SignedUrlResult } from "../services/storage.service";
import { isSafeOwnerId, isSafeStorageKey } from "../uploads/key-generator";
import { prisma } from "@/shared/database/prisma-client";
import { createLogger } from "@/shared/logger";

/** SECURITY-002C: structured + redacted (see shared/logger/redact.ts), not raw console.error — same discipline as every other module. */
const logger = createLogger("storage.handlers");

function isStorageCategory(value: unknown): value is StorageCategory {
  return typeof value === "string" && Object.values(StorageCategory).includes(value as StorageCategory);
}

/**
 * SECURITY-002C: `ownerId`'s meaning is category-dependent, not uniformly
 * "the caller's own identity" — the key-naming convention (key-generator.ts)
 * embeds a userId for PROFILE_IMAGE, but a packageId/destinationId/
 * bookingId for every other category, since those are staff uploading media
 * FOR a business entity, not for themselves. PROFILE_IMAGE is the one
 * category where "ownerId" and "the authenticated caller" are the same
 * thing, and the one place a client-supplied override would be a classic
 * IDOR (uploading/overwriting/reading/deleting someone else's avatar) — so
 * it is never accepted from the client, in either direction (upload or the
 * ownership check on read/replace/delete/sign). The other categories keep
 * accepting a client-supplied target entity id (required, non-empty,
 * validated below) because the storage module has no dependency on
 * Package/Destination/Booking services to independently verify one exists
 * — building that cross-module check is out of this sprint's scope — and
 * because every /api/storage/* route is admin/super-admin-only as of
 * SECURITY-002B, which is the actual control bounding who can reach this
 * at all today.
 */
const SELF_OWNED_CATEGORIES: ReadonlySet<StorageCategory> = new Set([StorageCategory.PROFILE_IMAGE]);

function resolveOwnerId(category: StorageCategory, context: AuthContext, clientOwnerId: unknown): Result<string, AppError> {
  if (SELF_OWNED_CATEGORIES.has(category)) {
    return ok(context.userId);
  }
  if (typeof clientOwnerId !== "string" || clientOwnerId.length === 0) {
    return err(new ValidationError("ownerId is required"));
  }
  if (!isSafeOwnerId(clientOwnerId)) {
    return err(new ValidationError("ownerId may only contain letters, numbers, hyphens, and underscores"));
  }
  return ok(clientOwnerId);
}

/** Every client-supplied key (delete/metadata/signed-url/replace all reference a previously-generated one) must pass this before touching the service layer — see isSafeStorageKey's docs for why. */
function validateKeyShape(key: unknown, fieldName: string): Result<string, AppError> {
  if (typeof key !== "string" || key.length === 0) {
    return err(new ValidationError(`${fieldName} is required`));
  }
  if (!isSafeStorageKey(key)) {
    return err(new ValidationError(`${fieldName} is not a valid storage key`));
  }
  return ok(key);
}

export interface UploadRequestInput {
  fileBuffer: Buffer;
  contentType: string;
  fileName: string;
  category: unknown;
  ownerId: unknown;
}

function validateUploadShape(
  context: AuthContext,
  input: UploadRequestInput
): Result<{ category: StorageCategory; ownerId: string }, AppError> {
  if (!isStorageCategory(input.category)) {
    return err(new ValidationError(`category must be one of: ${Object.values(StorageCategory).join(", ")}`));
  }
  const ownerId = resolveOwnerId(input.category, context, input.ownerId);
  if (isErr(ownerId)) return ownerId;
  return ok({ category: input.category, ownerId: ownerId.value });
}

export async function uploadHandler(context: AuthContext | null, input: UploadRequestInput): Promise<Result<StorageObject, AppError>> {
  if (!context) return err(new UnauthorizedError("Not authenticated"));
  const validated = validateUploadShape(context, input);
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
      logger.error("Failed to save media asset to DB", { key: result.value.key, error: e instanceof Error ? e.message : String(e) });
    }
  }

  return result;
}

export interface ReplaceRequestInput extends UploadRequestInput {
  existingKey: unknown;
}

export async function replaceHandler(context: AuthContext | null, input: ReplaceRequestInput): Promise<Result<StorageObject, AppError>> {
  if (!context) return err(new UnauthorizedError("Not authenticated"));
  const validated = validateUploadShape(context, input);
  if (isErr(validated)) return validated;
  const existingKey = validateKeyShape(input.existingKey, "existingKey");
  if (isErr(existingKey)) return existingKey;

  return getStorageService().replace(input.fileBuffer, {
    category: validated.value.category,
    ownerId: validated.value.ownerId,
    fileName: input.fileName,
    contentType: input.contentType,
    existingKey: existingKey.value,
  });
}

export async function deleteHandler(context: AuthContext | null, body: unknown): Promise<Result<void, AppError>> {
  if (!context) return err(new UnauthorizedError("Not authenticated"));
  const record = (body ?? {}) as Record<string, unknown>;
  if (!isStorageCategory(record.category)) {
    return err(new ValidationError(`category must be one of: ${Object.values(StorageCategory).join(", ")}`));
  }
  const key = validateKeyShape(record.key, "key");
  if (isErr(key)) return key;
  const ownerId = resolveOwnerId(record.category, context, record.ownerId);
  if (isErr(ownerId)) return ownerId;

  const result = await getStorageService().delete(record.category, key.value, ownerId.value);
  if (!isErr(result)) {
    try {
      await prisma.mediaAsset.delete({
        where: { key: key.value }
      });
    } catch (e) {
      logger.error("Failed to delete media asset from DB", { key: key.value, error: e instanceof Error ? e.message : String(e) });
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
  const validKey = validateKeyShape(key, "key");
  if (isErr(validKey)) return validKey;
  const resolvedOwnerId = resolveOwnerId(category, context, ownerId);
  if (isErr(resolvedOwnerId)) return resolvedOwnerId;

  return getStorageService().getMetadata(category, validKey.value, resolvedOwnerId.value);
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
  const validKey = validateKeyShape(key, "key");
  if (isErr(validKey)) return validKey;
  const resolvedOwnerId = resolveOwnerId(category, context, ownerId);
  if (isErr(resolvedOwnerId)) return resolvedOwnerId;

  const ttl = typeof ttlSeconds === "string" && ttlSeconds.length > 0 ? Number(ttlSeconds) : undefined;
  if (ttl !== undefined && !Number.isFinite(ttl)) return err(new ValidationError("ttlSeconds must be a number"));

  return getStorageService().getSignedUrl(category, validKey.value, resolvedOwnerId.value, ttl);
}

/**
 * The download-proxy handler is deliberately unauthenticated — the HMAC
 * signature itself is the credential (see route-permission-map.ts's
 * PUBLIC_EXACT_PATHS entry for this route); tampering with `key` already
 * invalidates the signature before any provider call happens. The shape
 * check below is a cheap first line of defense (fail before doing any
 * crypto/network work), not the actual security boundary.
 */
export async function downloadHandler(
  key: unknown,
  expiresAt: unknown,
  signature: unknown
): Promise<Result<{ body: Buffer; contentType: string }, AppError>> {
  const validKey = validateKeyShape(key, "key");
  if (isErr(validKey)) return validKey;
  if (typeof signature !== "string" || !signature) return err(new ValidationError("signature is required"));
  const expiresAtNum = Number(expiresAt);
  if (!Number.isFinite(expiresAtNum)) return err(new ValidationError("expiresAt is required"));

  return getStorageService().downloadPrivateObject(validKey.value, expiresAtNum, signature);
}
