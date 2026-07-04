import { container, createToken, moduleRegistry, type ModuleDefinition } from "@/shared/di";
import { healthCheckRegistry } from "@/shared/health";
import { createLogger } from "@/shared/logger";
import { FerryAdapter, ManualSupplierAdapter, TripJackAdapter } from "./adapters";
import type { SupplierRecordRepository } from "./repositories/supplier-record.repository";
import { PrismaSupplierRecordRepository } from "./repositories/supplier-record.repository.prisma";
import { SupplierRegistry } from "./services/supplier-registry";
import { SupplierService } from "./services/supplier.service";
import type { Supplier } from "./types";
import { SupplierHealthCheck } from "./utils/supplier-health-check";

export const SUPPLIER_REGISTRY_TOKEN = createToken<SupplierRegistry>("supplier.registry");
export const SUPPLIER_RECORD_REPOSITORY_TOKEN = createToken<SupplierRecordRepository>("supplier.recordRepository");
export const SUPPLIER_SERVICE_TOKEN = createToken<SupplierService>("supplier.service");
export const TRIPJACK_ADAPTER_TOKEN = createToken<Supplier>("supplier.adapter.tripjack");
export const FERRY_ADAPTER_TOKEN = createToken<Supplier>("supplier.adapter.ferry");
export const MANUAL_ADAPTER_TOKEN = createToken<Supplier>("supplier.adapter.manual");

/**
 * Completely isolated: nothing in this file, or anywhere else under
 * src/modules/supplier/, imports from src/modules/inventory or any other
 * business module — only from the shared foundation. Inventory imports
 * FROM here (see src/modules/inventory/services/inventory-supplier-bridge.ts),
 * never the reverse, per docs/02_SYSTEM_ARCHITECTURE.md's Communication Rules.
 */
export const supplierModule: ModuleDefinition = {
  name: "supplier",
  register(c) {
    c.registerFactory(TRIPJACK_ADAPTER_TOKEN, () => new TripJackAdapter({ logger: createLogger("supplier.tripjack") }));
    c.registerFactory(FERRY_ADAPTER_TOKEN, () => new FerryAdapter({ logger: createLogger("supplier.ferry") }));
    c.registerFactory(
      MANUAL_ADAPTER_TOKEN,
      () => new ManualSupplierAdapter({ logger: createLogger("supplier.manual") })
    );
    c.registerFactory(SUPPLIER_REGISTRY_TOKEN, () => new SupplierRegistry());
    c.registerFactory(SUPPLIER_RECORD_REPOSITORY_TOKEN, () => new PrismaSupplierRecordRepository());
    c.registerFactory(
      SUPPLIER_SERVICE_TOKEN,
      () =>
        new SupplierService(
          { logger: createLogger("supplier.service") },
          c.resolve(SUPPLIER_REGISTRY_TOKEN),
          c.resolve(SUPPLIER_RECORD_REPOSITORY_TOKEN)
        )
    );
  },
};

// Next.js has no single app-bootstrap entry point (same situation as
// src/modules/inventory/module.ts) — registration runs as a side effect on
// first import, guarded against double-registration under dev-mode HMR.
// Adapter registration is async (Supplier.initialize() is), so it runs in a
// fire-and-forget IIFE rather than blocking module evaluation.
if (!moduleRegistry.getModule(supplierModule.name)) {
  moduleRegistry.registerModule(supplierModule);
  supplierModule.register(container);

  void (async () => {
    const service = container.resolve(SUPPLIER_SERVICE_TOKEN);
    const adapters: Supplier[] = [
      container.resolve(TRIPJACK_ADAPTER_TOKEN),
      container.resolve(FERRY_ADAPTER_TOKEN),
      container.resolve(MANUAL_ADAPTER_TOKEN),
    ];

    for (const adapter of adapters) {
      const result = await service.registerSupplier(adapter);
      if (!result.ok) {
        console.error(`Failed to register supplier "${adapter.code}"`, result.error);
        continue;
      }
      // Registers every supplier with the shared health-check framework —
      // this is the entire mechanism behind "GET /api/health automatically
      // includes supplier status," no change to that route required.
      healthCheckRegistry.register(new SupplierHealthCheck(adapter));
    }
  })();
}

export function getSupplierService(): SupplierService {
  return container.resolve(SUPPLIER_SERVICE_TOKEN);
}

export function getSupplierRegistry(): SupplierRegistry {
  return container.resolve(SUPPLIER_REGISTRY_TOKEN);
}
