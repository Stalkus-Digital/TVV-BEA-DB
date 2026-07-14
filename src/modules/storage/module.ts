import { container, createToken, moduleRegistry, type ModuleDefinition } from "@/shared/di";
import { healthCheckRegistry, type HealthCheck, type HealthCheckResult } from "@/shared/health";
import { createLogger } from "@/shared/logger";
import { CloudinaryProvider } from "./providers/cloudinary.provider";
import type { StorageProvider } from "./providers/storage-provider";
import { SignedUrlService } from "./signed-urls/signed-url.service";
import { StorageService } from "./services/storage.service";
import { StorageConfigService } from "./services/storage-config.service";

export const STORAGE_PROVIDER_TOKEN = createToken<StorageProvider>("storage.provider");
export const SIGNED_URL_SERVICE_TOKEN = createToken<SignedUrlService>("storage.service.signed-url");
export const STORAGE_SERVICE_TOKEN = createToken<StorageService>("storage.service.storage");

/**
 * The storage infrastructure used by every module (Sprint 14). Owns no
 * Prisma models or `repositories/` — ownership is encoded entirely in the
 * object's storage key (see uploads/key-generator.ts), so there is no
 * database state for this module to persist. `CloudinaryProvider` is the
 * only concrete `StorageProvider` wired up here; S3/Cloudflare R2 would be
 * additional implementations of the same interface, swapped in here, not
 * built this sprint.
 */
export const storageModule: ModuleDefinition = {
  name: "storage",
  register(c) {
    c.registerFactory(STORAGE_PROVIDER_TOKEN, () => new CloudinaryProvider());
    c.registerFactory(SIGNED_URL_SERVICE_TOKEN, () => SignedUrlService.fromConfig());
    c.registerFactory(
      STORAGE_SERVICE_TOKEN,
      () => new StorageService({ logger: createLogger("storage") }, c.resolve(STORAGE_PROVIDER_TOKEN), c.resolve(SIGNED_URL_SERVICE_TOKEN))
    );
  },
};

class StorageModuleHealthCheck implements HealthCheck {
  readonly name = "storage";
  async check(): Promise<HealthCheckResult> {
    const configured = !!process.env.CLOUDINARY_API_KEY;
    if (!configured) {
      return {
        name: this.name,
        status: "degraded",
        details: { reason: "CLOUDINARY_API_KEY is not configured — uploads will fail until it is set" },
        checkedAt: new Date().toISOString(),
      };
    }
    return { name: this.name, status: "healthy", checkedAt: new Date().toISOString() };
  }
}

if (!moduleRegistry.getModule(storageModule.name)) {
  moduleRegistry.registerModule(storageModule);
  storageModule.register(container);
  healthCheckRegistry.register(new StorageModuleHealthCheck());
}

export function getStorageService(): StorageService {
  return container.resolve(STORAGE_SERVICE_TOKEN);
}
export function getSignedUrlService(): SignedUrlService {
  return container.resolve(SIGNED_URL_SERVICE_TOKEN);
}
