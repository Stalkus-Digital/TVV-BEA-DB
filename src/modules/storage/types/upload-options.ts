import type { StorageCategory } from "./storage-category";

/**
 * `ownerId` is the entity id the key-naming convention embeds (a userId,
 * packageId, destinationId, or bookingId depending on `category`) — it is
 * never optional. It is also the value `validateOwnership()` later checks
 * a caller's claimed id against, so a key can never be generated without
 * an owner to validate later.
 */
export interface UploadOptions {
  category: StorageCategory;
  ownerId: string;
  fileName: string;
  contentType: string;
}

export interface ReplaceOptions extends UploadOptions {
  /** The existing key being replaced — deleted only after the new upload succeeds. */
  existingKey: string;
}
