import { container, createToken, moduleRegistry, type ModuleDefinition } from "@/shared/di";
import { healthCheckRegistry, type HealthCheck, type HealthCheckResult } from "@/shared/health";
import { createLogger } from "@/shared/logger";
import type { QuoteItemRepository, QuoteRepository, QuoteVersionRepository } from "./repositories";
import { PrismaQuoteItemRepository } from "./repositories/quote-item.repository.prisma";
import { PrismaQuoteRepository } from "./repositories/quote.repository.prisma";
import { PrismaQuoteVersionRepository } from "./repositories/quote-version.repository.prisma";
import { QuoteItemService } from "./services/quote-item.service";
import { QuoteService } from "./services/quote.service";
import { QuoteVersionService } from "./services/quote-version.service";

export const QUOTE_REPOSITORY_TOKEN = createToken<QuoteRepository>("quote.repository.quote");
export const QUOTE_ITEM_REPOSITORY_TOKEN = createToken<QuoteItemRepository>("quote.repository.item");
export const QUOTE_VERSION_REPOSITORY_TOKEN = createToken<QuoteVersionRepository>("quote.repository.version");

export const QUOTE_SERVICE_TOKEN = createToken<QuoteService>("quote.service.quote");
export const QUOTE_ITEM_SERVICE_TOKEN = createToken<QuoteItemService>("quote.service.item");
export const QUOTE_VERSION_SERVICE_TOKEN = createToken<QuoteVersionService>("quote.service.version");

/**
 * Quote Engine — a genuine consumer of Package, Destination, and Inventory
 * via their public service accessors only (getPackageService(),
 * getDestinationService(), getInventoryService()), never a repository, same
 * approved direction as Package's own use of Inventory/Destination. No
 * import from src/modules/supplier or src/modules/website exists anywhere
 * in this module (grep-verified after build). No booking module exists yet
 * to import from — convertToBooking() returns a handoff payload instead of
 * calling one; see quote.service.ts and types/quote-conversion.ts. No
 * payments/TripJack/Ferry integration, per this sprint's explicit exclusions.
 */
export const quoteModule: ModuleDefinition = {
  name: "quote",
  register(c) {
    c.registerFactory(QUOTE_REPOSITORY_TOKEN, () => new PrismaQuoteRepository());
    c.registerFactory(QUOTE_ITEM_REPOSITORY_TOKEN, () => new PrismaQuoteItemRepository());
    c.registerFactory(QUOTE_VERSION_REPOSITORY_TOKEN, () => new PrismaQuoteVersionRepository());

    c.registerFactory(
      QUOTE_VERSION_SERVICE_TOKEN,
      () => new QuoteVersionService({ logger: createLogger("quote.version") }, c.resolve(QUOTE_VERSION_REPOSITORY_TOKEN))
    );
    c.registerFactory(
      QUOTE_ITEM_SERVICE_TOKEN,
      () =>
        new QuoteItemService(
          { logger: createLogger("quote.item") },
          c.resolve(QUOTE_ITEM_REPOSITORY_TOKEN),
          c.resolve(QUOTE_REPOSITORY_TOKEN)
        )
    );
    c.registerFactory(
      QUOTE_SERVICE_TOKEN,
      () =>
        new QuoteService(
          { logger: createLogger("quote.service") },
          c.resolve(QUOTE_REPOSITORY_TOKEN),
          c.resolve(QUOTE_ITEM_REPOSITORY_TOKEN),
          c.resolve(QUOTE_VERSION_SERVICE_TOKEN)
        )
    );
  },
};

class QuoteModuleHealthCheck implements HealthCheck {
  readonly name = "quote";
  async check(): Promise<HealthCheckResult> {
    return { name: this.name, status: "healthy", checkedAt: new Date().toISOString() };
  }
}

if (!moduleRegistry.getModule(quoteModule.name)) {
  moduleRegistry.registerModule(quoteModule);
  quoteModule.register(container);
  healthCheckRegistry.register(new QuoteModuleHealthCheck());
}

export function getQuoteService(): QuoteService {
  return container.resolve(QUOTE_SERVICE_TOKEN);
}
export function getQuoteItemService(): QuoteItemService {
  return container.resolve(QUOTE_ITEM_SERVICE_TOKEN);
}
export function getQuoteVersionService(): QuoteVersionService {
  return container.resolve(QUOTE_VERSION_SERVICE_TOKEN);
}
