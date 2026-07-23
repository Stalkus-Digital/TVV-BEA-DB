import { container, createToken, moduleRegistry, type ModuleDefinition } from "@/shared/di";
import { healthCheckRegistry, type HealthCheck, type HealthCheckResult } from "@/shared/health";
import { createLogger } from "@/shared/logger";
import { S3Provider } from "./providers/s3.provider";
import type { StorageProvider } from "./providers/storage-provider";
import { SignedUrlService } from "./signed-urls/signed-url.service";
import { StorageService } from "./services/storage.service";
import { StorageConfigService } from "./services/storage-config.service";
import { NoopVirusScanner, type VirusScanner } from "./uploads/virus-scanner";

export const STORAGE_PROVIDER_TOKEN = createToken<StorageProvider>("storage.provider");
export const SIGNED_URL_SERVICE_TOKEN = createToken<SignedUrlService>("storage.service.signed-url");
export const STORAGE_SERVICE_TOKEN = createToken<StorageService>("storage.service.storage");
export const VIRUS_SCANNER_TOKEN = createToken<VirusScanner>("storage.virus-scanner");

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
    c.registerFactory(STORAGE_PROVIDER_TOKEN, () => new S3Provider());
    c.registerFactory(SIGNED_URL_SERVICE_TOKEN, () => SignedUrlService.fromConfig());
    // SECURITY-002C Task 10: no vendor wired up — swap for a real
    // implementation (ClamAV, VirusTotal, etc.) here when one is chosen.
    c.registerFactory(VIRUS_SCANNER_TOKEN, () => new NoopVirusScanner());
    c.registerFactory(
      STORAGE_SERVICE_TOKEN,
      () =>
        new StorageService(
          { logger: createLogger("storage") },
          c.resolve(STORAGE_PROVIDER_TOKEN),
          c.resolve(SIGNED_URL_SERVICE_TOKEN),
          c.resolve(VIRUS_SCANNER_TOKEN)
        )
    );
  },
};

class StorageModuleHealthCheck implements HealthCheck {
  readonly name = "storage";
  async check(): Promise<HealthCheckResult> {
    const configured = !!process.env.DO_SPACES_KEY;
    if (!configured) {
      return {
        name: this.name,
        status: "degraded",
        details: { reason: "DO_SPACES_KEY is not configured — uploads will fail until it is set" },
        checkedAt: new Date().toISOString(),
      };
    }
    // SECURITY-002C: visible, not silent — but "healthy", not "degraded":
    // nothing is actually broken (uploads work fine), and "degraded" here
    // would bubble into the overall platform health status (see
    // health-registry.ts's getOverallHealth) and page/alert on something
    // that isn't an operational incident. The note is still surfaced in
    // `details` for anyone inspecting this specific check.
    return {
      name: this.name,
      status: "healthy",
      details: { note: "No virus scanner is configured — uploads are not malware-scanned (NoopVirusScanner is wired by default)" },
      checkedAt: new Date().toISOString(),
    };
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
