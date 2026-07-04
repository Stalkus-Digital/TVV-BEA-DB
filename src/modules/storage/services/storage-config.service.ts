import { validateEnv, type EnvSchema } from "@/shared/validation/env.schema";

const storageEnvSchema = {
  blobReadWriteToken: { key: "BLOB_READ_WRITE_TOKEN", type: "string", default: "" },
  signingSecret: { key: "STORAGE_SIGNING_SECRET", type: "string", default: "dev-insecure-storage-secret-change-in-production" },
  defaultSignedUrlTtlSeconds: { key: "STORAGE_SIGNED_URL_TTL_SECONDS", type: "number", default: 300 }, // 5 min
  maxImageSizeBytes: { key: "STORAGE_MAX_IMAGE_SIZE_BYTES", type: "number", default: 5_242_880 }, // 5 MB
  maxDocumentSizeBytes: { key: "STORAGE_MAX_DOCUMENT_SIZE_BYTES", type: "number", default: 10_485_760 }, // 10 MB
} satisfies EnvSchema;

export interface StorageConfigValues {
  blobReadWriteToken: string;
  signingSecret: string;
  defaultSignedUrlTtlSeconds: number;
  maxImageSizeBytes: number;
  maxDocumentSizeBytes: number;
}

function loadStorageConfig(source: Record<string, string | undefined> = process.env): StorageConfigValues {
  const result = validateEnv(storageEnvSchema, source);
  if ("errors" in result) {
    const details = result.errors.map((e) => `${e.key}: ${e.message}`).join("; ");
    throw new Error(`Invalid storage module environment configuration: ${details}`);
  }
  return result.values;
}

/**
 * Singleton config accessor, same pattern as `AuthConfigService`. An empty
 * `blobReadWriteToken` default is deliberate — no `.env` in this project
 * has a real one configured yet (see docs/33's Remaining TODOs); the
 * provider throws a clear, specific error at upload time rather than
 * failing silently or crashing at import time. `signingSecret`'s insecure
 * default follows the exact same "must be overridden before any non-local
 * deployment" discipline as `AUTH_JWT_SECRET`.
 */
export class StorageConfigService {
  private static instance: StorageConfigService | null = null;
  private readonly values: StorageConfigValues;

  private constructor() {
    this.values = loadStorageConfig();
  }

  static getInstance(): StorageConfigService {
    if (!StorageConfigService.instance) StorageConfigService.instance = new StorageConfigService();
    return StorageConfigService.instance;
  }

  get<K extends keyof StorageConfigValues>(key: K): StorageConfigValues[K] {
    return this.values[key];
  }
}
