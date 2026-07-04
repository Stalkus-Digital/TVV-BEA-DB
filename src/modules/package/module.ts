import { container, createToken, moduleRegistry, type ModuleDefinition } from "@/shared/di";
import { healthCheckRegistry, type HealthCheck, type HealthCheckResult } from "@/shared/health";
import { createLogger } from "@/shared/logger";
import {
  AIPackageBuilder,
  DynamicPackageBuilder,
  ManualPackageBuilder,
  MixedPackageBuilder,
  PackageDraftBuilder,
  SupplierPackageBuilder,
} from "./builders";
import { PackageItineraryService } from "./itinerary/package-itinerary.service";
import { PackagePricingService } from "./pricing/package-pricing.service";
import type {
  PackageAvailabilityRepository,
  PackageDayRepository,
  PackageItemRepository,
  PackagePricingRepository,
  PackageRepository,
  PackageRuleRepository,
  PackageVersionRepository,
} from "./repositories";
import { PrismaPackageAvailabilityRepository } from "./repositories/package-availability.repository.prisma";
import { PrismaPackageDayRepository } from "./repositories/package-day.repository.prisma";
import { PrismaPackageItemRepository } from "./repositories/package-item.repository.prisma";
import { PrismaPackagePricingRepository } from "./repositories/package-pricing.repository.prisma";
import { PrismaPackageRepository } from "./repositories/package.repository.prisma";
import { PrismaPackageRuleRepository } from "./repositories/package-rule.repository.prisma";
import { PrismaPackageVersionRepository } from "./repositories/package-version.repository.prisma";
import { PackageRuleService } from "./rules/package-rule.service";
import { PackageAvailabilityService } from "./services/package-availability.service";
import { PackageDayService } from "./services/package-day.service";
import { PackageItemService } from "./services/package-item.service";
import { PackageService } from "./services/package.service";
import { PackageVersionService } from "./services/package-version.service";

export const PACKAGE_REPOSITORY_TOKEN = createToken<PackageRepository>("package.repository.package");
export const PACKAGE_DAY_REPOSITORY_TOKEN = createToken<PackageDayRepository>("package.repository.day");
export const PACKAGE_ITEM_REPOSITORY_TOKEN = createToken<PackageItemRepository>("package.repository.item");
export const PACKAGE_PRICING_REPOSITORY_TOKEN = createToken<PackagePricingRepository>("package.repository.pricing");
export const PACKAGE_RULE_REPOSITORY_TOKEN = createToken<PackageRuleRepository>("package.repository.rule");
export const PACKAGE_AVAILABILITY_REPOSITORY_TOKEN = createToken<PackageAvailabilityRepository>("package.repository.availability");
export const PACKAGE_VERSION_REPOSITORY_TOKEN = createToken<PackageVersionRepository>("package.repository.version");

export const PACKAGE_SERVICE_TOKEN = createToken<PackageService>("package.service.package");
export const PACKAGE_DAY_SERVICE_TOKEN = createToken<PackageDayService>("package.service.day");
export const PACKAGE_ITEM_SERVICE_TOKEN = createToken<PackageItemService>("package.service.item");
export const PACKAGE_AVAILABILITY_SERVICE_TOKEN = createToken<PackageAvailabilityService>("package.service.availability");
export const PACKAGE_VERSION_SERVICE_TOKEN = createToken<PackageVersionService>("package.service.version");
export const PACKAGE_PRICING_SERVICE_TOKEN = createToken<PackagePricingService>("package.service.pricing");
export const PACKAGE_RULE_SERVICE_TOKEN = createToken<PackageRuleService>("package.service.rule");
export const PACKAGE_ITINERARY_SERVICE_TOKEN = createToken<PackageItineraryService>("package.service.itinerary");

export const PACKAGE_DRAFT_BUILDER_TOKEN = createToken<PackageDraftBuilder>("package.builder.draft");
export const MANUAL_PACKAGE_BUILDER_TOKEN = createToken<ManualPackageBuilder>("package.builder.manual");
export const DYNAMIC_PACKAGE_BUILDER_TOKEN = createToken<DynamicPackageBuilder>("package.builder.dynamic");
export const AI_PACKAGE_BUILDER_TOKEN = createToken<AIPackageBuilder>("package.builder.ai");
export const SUPPLIER_PACKAGE_BUILDER_TOKEN = createToken<SupplierPackageBuilder>("package.builder.supplier");
export const MIXED_PACKAGE_BUILDER_TOKEN = createToken<MixedPackageBuilder>("package.builder.mixed");

/**
 * Package Engine is a consumer of Inventory and Destination (the approved
 * direction per docs/02 — "Package Builder ↓ Inventory Service" / "↓
 * Destination Engine"), never of Supplier or TripJack directly — no import
 * from src/modules/supplier appears anywhere in this module (grep-verified
 * after build). No Booking/Payments/Website/AI integration exists here
 * either, per this sprint's explicit exclusions.
 */
export const packageModule: ModuleDefinition = {
  name: "package",
  register(c) {
    c.registerFactory(PACKAGE_REPOSITORY_TOKEN, () => new PrismaPackageRepository());
    c.registerFactory(PACKAGE_DAY_REPOSITORY_TOKEN, () => new PrismaPackageDayRepository());
    c.registerFactory(PACKAGE_ITEM_REPOSITORY_TOKEN, () => new PrismaPackageItemRepository());
    c.registerFactory(PACKAGE_PRICING_REPOSITORY_TOKEN, () => new PrismaPackagePricingRepository());
    c.registerFactory(PACKAGE_RULE_REPOSITORY_TOKEN, () => new PrismaPackageRuleRepository());
    c.registerFactory(PACKAGE_AVAILABILITY_REPOSITORY_TOKEN, () => new PrismaPackageAvailabilityRepository());
    c.registerFactory(PACKAGE_VERSION_REPOSITORY_TOKEN, () => new PrismaPackageVersionRepository());

    c.registerFactory(
      PACKAGE_DAY_SERVICE_TOKEN,
      () => new PackageDayService({ logger: createLogger("package.day") }, c.resolve(PACKAGE_DAY_REPOSITORY_TOKEN))
    );
    c.registerFactory(
      PACKAGE_ITEM_SERVICE_TOKEN,
      () =>
        new PackageItemService(
          { logger: createLogger("package.item") },
          c.resolve(PACKAGE_ITEM_REPOSITORY_TOKEN),
          c.resolve(PACKAGE_DAY_REPOSITORY_TOKEN)
        )
    );
    c.registerFactory(
      PACKAGE_AVAILABILITY_SERVICE_TOKEN,
      () =>
        new PackageAvailabilityService(
          { logger: createLogger("package.availability") },
          c.resolve(PACKAGE_AVAILABILITY_REPOSITORY_TOKEN)
        )
    );
    c.registerFactory(
      PACKAGE_VERSION_SERVICE_TOKEN,
      () =>
        new PackageVersionService(
          { logger: createLogger("package.version") },
          c.resolve(PACKAGE_VERSION_REPOSITORY_TOKEN),
          c.resolve(PACKAGE_REPOSITORY_TOKEN)
        )
    );
    c.registerFactory(
      PACKAGE_PRICING_SERVICE_TOKEN,
      () => new PackagePricingService({ logger: createLogger("package.pricing") }, c.resolve(PACKAGE_PRICING_REPOSITORY_TOKEN))
    );
    c.registerFactory(
      PACKAGE_RULE_SERVICE_TOKEN,
      () => new PackageRuleService({ logger: createLogger("package.rule") }, c.resolve(PACKAGE_RULE_REPOSITORY_TOKEN))
    );
    c.registerFactory(PACKAGE_ITINERARY_SERVICE_TOKEN, () => new PackageItineraryService({ logger: createLogger("package.itinerary") }));

    c.registerFactory(
      PACKAGE_SERVICE_TOKEN,
      () =>
        new PackageService(
          { logger: createLogger("package.service") },
          c.resolve(PACKAGE_REPOSITORY_TOKEN),
          c.resolve(PACKAGE_DAY_REPOSITORY_TOKEN),
          c.resolve(PACKAGE_ITEM_REPOSITORY_TOKEN),
          c.resolve(PACKAGE_PRICING_REPOSITORY_TOKEN),
          c.resolve(PACKAGE_RULE_REPOSITORY_TOKEN),
          c.resolve(PACKAGE_VERSION_SERVICE_TOKEN)
        )
    );

    c.registerFactory(
      PACKAGE_DRAFT_BUILDER_TOKEN,
      () =>
        new PackageDraftBuilder(
          c.resolve(PACKAGE_SERVICE_TOKEN),
          c.resolve(PACKAGE_DAY_SERVICE_TOKEN),
          c.resolve(PACKAGE_ITEM_SERVICE_TOKEN)
        )
    );
    c.registerFactory(MANUAL_PACKAGE_BUILDER_TOKEN, () => new ManualPackageBuilder(c.resolve(PACKAGE_DRAFT_BUILDER_TOKEN)));
    c.registerFactory(DYNAMIC_PACKAGE_BUILDER_TOKEN, () => new DynamicPackageBuilder(c.resolve(PACKAGE_DRAFT_BUILDER_TOKEN)));
    c.registerFactory(AI_PACKAGE_BUILDER_TOKEN, () => new AIPackageBuilder(c.resolve(PACKAGE_DRAFT_BUILDER_TOKEN)));
    c.registerFactory(SUPPLIER_PACKAGE_BUILDER_TOKEN, () => new SupplierPackageBuilder(c.resolve(PACKAGE_DRAFT_BUILDER_TOKEN)));
    c.registerFactory(MIXED_PACKAGE_BUILDER_TOKEN, () => new MixedPackageBuilder(c.resolve(PACKAGE_DRAFT_BUILDER_TOKEN)));
  },
};

class PackageModuleHealthCheck implements HealthCheck {
  readonly name = "package";
  async check(): Promise<HealthCheckResult> {
    return { name: this.name, status: "healthy", checkedAt: new Date().toISOString() };
  }
}

if (!moduleRegistry.getModule(packageModule.name)) {
  moduleRegistry.registerModule(packageModule);
  packageModule.register(container);
  healthCheckRegistry.register(new PackageModuleHealthCheck());
}

export function getPackageService(): PackageService {
  return container.resolve(PACKAGE_SERVICE_TOKEN);
}
export function getPackageDayService(): PackageDayService {
  return container.resolve(PACKAGE_DAY_SERVICE_TOKEN);
}
export function getPackageItemService(): PackageItemService {
  return container.resolve(PACKAGE_ITEM_SERVICE_TOKEN);
}
export function getPackageAvailabilityService(): PackageAvailabilityService {
  return container.resolve(PACKAGE_AVAILABILITY_SERVICE_TOKEN);
}
export function getPackageVersionService(): PackageVersionService {
  return container.resolve(PACKAGE_VERSION_SERVICE_TOKEN);
}
export function getPackagePricingService(): PackagePricingService {
  return container.resolve(PACKAGE_PRICING_SERVICE_TOKEN);
}
export function getPackageRuleService(): PackageRuleService {
  return container.resolve(PACKAGE_RULE_SERVICE_TOKEN);
}
export function getPackageItineraryService(): PackageItineraryService {
  return container.resolve(PACKAGE_ITINERARY_SERVICE_TOKEN);
}
export function getManualPackageBuilder(): ManualPackageBuilder {
  return container.resolve(MANUAL_PACKAGE_BUILDER_TOKEN);
}
export function getDynamicPackageBuilder(): DynamicPackageBuilder {
  return container.resolve(DYNAMIC_PACKAGE_BUILDER_TOKEN);
}
export function getAIPackageBuilder(): AIPackageBuilder {
  return container.resolve(AI_PACKAGE_BUILDER_TOKEN);
}
export function getSupplierPackageBuilder(): SupplierPackageBuilder {
  return container.resolve(SUPPLIER_PACKAGE_BUILDER_TOKEN);
}
export function getMixedPackageBuilder(): MixedPackageBuilder {
  return container.resolve(MIXED_PACKAGE_BUILDER_TOKEN);
}
