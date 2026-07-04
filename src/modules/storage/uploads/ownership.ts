import { err, ok, type Result } from "@/shared/types";
import { NotFoundError, type AppError } from "@/shared/errors";
import { extractOwnerIdFromKey } from "./key-generator";
import type { StorageCategory } from "../types/storage-category";

/**
 * Stateless ownership check — no database lookup, no `repositories/`
 * folder in this module. The key's own `ownerId` segment (embedded at
 * generation time) is compared directly against the caller's claimed id.
 * A mismatch returns `NotFoundError`, never `ForbiddenError`, matching the
 * Customer module's row-level ownership discipline: it must not confirm
 * that a differently-owned object exists.
 */
export function validateOwnership(category: StorageCategory, key: string, callerId: string): Result<void, AppError> {
  const ownerId = extractOwnerIdFromKey(category, key);
  if (ownerId === null || ownerId !== callerId) {
    return err(new NotFoundError("Storage object not found"));
  }
  return ok(undefined);
}
