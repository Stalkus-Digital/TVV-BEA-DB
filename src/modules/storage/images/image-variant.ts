import type { StorageObject } from "../types/storage-object";

export const ImageVariantName = {
  ORIGINAL: "ORIGINAL",
  THUMBNAIL: "THUMBNAIL",
  MEDIUM: "MEDIUM",
} as const;

export type ImageVariantName = (typeof ImageVariantName)[keyof typeof ImageVariantName];

export interface ImageVariant {
  name: ImageVariantName;
  url: string;
  width: number | null;
  height: number | null;
}

/**
 * The variant model this sprint calls for is structurally present but only
 * ever produces ORIGINAL — no image-processing library is installed (and
 * none was authorized this sprint). THUMBNAIL/MEDIUM resizing is a future
 * addition behind this same shape, not implemented here.
 */
export function buildImageVariants(object: StorageObject): ImageVariant[] {
  return [{ name: ImageVariantName.ORIGINAL, url: object.url, width: null, height: null }];
}
