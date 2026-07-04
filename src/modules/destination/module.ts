import { container, createToken, moduleRegistry, type ModuleDefinition } from "@/shared/di";
import { healthCheckRegistry, type HealthCheck, type HealthCheckResult } from "@/shared/health";
import { createLogger } from "@/shared/logger";
import type {
  AirportRepository,
  CityRepository,
  CountryRepository,
  DestinationCategoryRepository,
  DestinationRepository,
  RegionRepository,
  StateRepository,
} from "./repositories";
import { PrismaAirportRepository, PrismaCityRepository, PrismaCountryRepository, PrismaRegionRepository, PrismaStateRepository } from "./repositories/geography.repository.prisma";
import { PrismaDestinationCategoryRepository } from "./repositories/destination-category.repository.prisma";
import { PrismaDestinationRepository } from "./repositories/destination.repository.prisma";
import { DestinationCategoryService } from "./services/destination-category.service";
import { DestinationService } from "./services/destination.service";
import { GeographyService } from "./services/geography.service";

export const COUNTRY_REPOSITORY_TOKEN = createToken<CountryRepository>("destination.repository.country");
export const STATE_REPOSITORY_TOKEN = createToken<StateRepository>("destination.repository.state");
export const REGION_REPOSITORY_TOKEN = createToken<RegionRepository>("destination.repository.region");
export const CITY_REPOSITORY_TOKEN = createToken<CityRepository>("destination.repository.city");
export const AIRPORT_REPOSITORY_TOKEN = createToken<AirportRepository>("destination.repository.airport");
export const DESTINATION_CATEGORY_REPOSITORY_TOKEN = createToken<DestinationCategoryRepository>(
  "destination.repository.category"
);
export const DESTINATION_REPOSITORY_TOKEN = createToken<DestinationRepository>("destination.repository.destination");
export const GEOGRAPHY_SERVICE_TOKEN = createToken<GeographyService>("destination.service.geography");
export const DESTINATION_CATEGORY_SERVICE_TOKEN = createToken<DestinationCategoryService>(
  "destination.service.category"
);
export const DESTINATION_SERVICE_TOKEN = createToken<DestinationService>("destination.service.destination");

/**
 * Isolated the same way Inventory and Supplier are: zero imports from any
 * other src/modules/* bounded context, only the shared foundation. Nothing
 * here stores or copies Inventory data — "Do NOT duplicate Inventory,
 * reference Inventory IDs only" is satisfied by having nothing that could
 * duplicate it (see types/destination.ts).
 */
export const destinationModule: ModuleDefinition = {
  name: "destination",
  register(c) {
    c.registerFactory(COUNTRY_REPOSITORY_TOKEN, () => new PrismaCountryRepository());
    c.registerFactory(STATE_REPOSITORY_TOKEN, () => new PrismaStateRepository());
    c.registerFactory(REGION_REPOSITORY_TOKEN, () => new PrismaRegionRepository());
    c.registerFactory(CITY_REPOSITORY_TOKEN, () => new PrismaCityRepository());
    c.registerFactory(AIRPORT_REPOSITORY_TOKEN, () => new PrismaAirportRepository());
    c.registerFactory(DESTINATION_CATEGORY_REPOSITORY_TOKEN, () => new PrismaDestinationCategoryRepository());
    c.registerFactory(DESTINATION_REPOSITORY_TOKEN, () => new PrismaDestinationRepository());

    c.registerFactory(
      GEOGRAPHY_SERVICE_TOKEN,
      () =>
        new GeographyService(
          { logger: createLogger("destination.geography") },
          c.resolve(COUNTRY_REPOSITORY_TOKEN),
          c.resolve(STATE_REPOSITORY_TOKEN),
          c.resolve(REGION_REPOSITORY_TOKEN),
          c.resolve(CITY_REPOSITORY_TOKEN),
          c.resolve(AIRPORT_REPOSITORY_TOKEN)
        )
    );
    c.registerFactory(
      DESTINATION_CATEGORY_SERVICE_TOKEN,
      () =>
        new DestinationCategoryService(
          { logger: createLogger("destination.category") },
          c.resolve(DESTINATION_CATEGORY_REPOSITORY_TOKEN)
        )
    );
    c.registerFactory(
      DESTINATION_SERVICE_TOKEN,
      () =>
        new DestinationService({ logger: createLogger("destination.service") }, c.resolve(DESTINATION_REPOSITORY_TOKEN))
    );
  },
};

/** Trivial — this module has no external dependency to be unhealthy about; reports healthy once registered. */
class DestinationModuleHealthCheck implements HealthCheck {
  readonly name = "destination";
  async check(): Promise<HealthCheckResult> {
    return { name: this.name, status: "healthy", checkedAt: new Date().toISOString() };
  }
}

if (!moduleRegistry.getModule(destinationModule.name)) {
  moduleRegistry.registerModule(destinationModule);
  destinationModule.register(container);
  healthCheckRegistry.register(new DestinationModuleHealthCheck());
}

export function getGeographyService(): GeographyService {
  return container.resolve(GEOGRAPHY_SERVICE_TOKEN);
}

export function getDestinationCategoryService(): DestinationCategoryService {
  return container.resolve(DESTINATION_CATEGORY_SERVICE_TOKEN);
}

export function getDestinationService(): DestinationService {
  return container.resolve(DESTINATION_SERVICE_TOKEN);
}
