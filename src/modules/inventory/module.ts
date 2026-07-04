import { container, createToken, moduleRegistry, type ModuleDefinition } from "@/shared/di";
import { createLogger } from "@/shared/logger";
import type { InventoryRepository } from "./repositories/inventory.repository";
import { PrismaInventoryRepository } from "./repositories/inventory.repository.prisma";
import { InventoryService } from "./services/inventory.service";

export const INVENTORY_REPOSITORY_TOKEN = createToken<InventoryRepository>("inventory.repository");
export const INVENTORY_SERVICE_TOKEN = createToken<InventoryService>("inventory.service");

/**
 * Provider-agnostic by construction: nothing registered here, and nothing in
 * ./services or ./repositories, knows a supplier's name or calls a supplier
 * client. When the Supplier Engine is approved and built, it plugs in
 * without this module changing — that's the point of the DI boundary.
 */
export const inventoryModule: ModuleDefinition = {
  name: "inventory",
  register(c) {
    c.registerFactory(INVENTORY_REPOSITORY_TOKEN, () => new PrismaInventoryRepository());
    c.registerFactory(
      INVENTORY_SERVICE_TOKEN,
      () => new InventoryService({ logger: createLogger("inventory.service") }, c.resolve(INVENTORY_REPOSITORY_TOKEN))
    );
  },
};

// Next.js has no single app-bootstrap entry point; module registration runs
// as a side effect on first import instead (Node caches the module, so this
// runs once per process). Guarded so re-evaluation (e.g. dev-mode HMR)
// never double-registers.
if (!moduleRegistry.getModule(inventoryModule.name)) {
  moduleRegistry.registerModule(inventoryModule);
  inventoryModule.register(container);
}

export function getInventoryService(): InventoryService {
  return container.resolve(INVENTORY_SERVICE_TOKEN);
}
