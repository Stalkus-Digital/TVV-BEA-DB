import type { StorageCategory, StorageVisibility } from "./storage-category";

/** What every upload/metadata call returns — the module's one canonical file-record shape. */
export interface StorageObject {
  key: string;
  url: string;
  category: StorageCategory;
  visibility: StorageVisibility;
  contentType: string;
  size: number;
  uploadedAt: string;
}
