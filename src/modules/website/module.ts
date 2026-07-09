import { container, createToken, moduleRegistry, type ModuleDefinition } from "@/shared/di";
import { healthCheckRegistry, type HealthCheck, type HealthCheckResult } from "@/shared/health";
import { createLogger } from "@/shared/logger";
import { HomepageService } from "./homepage/homepage.service";
import { NavigationService } from "./navigation/navigation.service";
import { WebsiteSearchService } from "./search/website-search.service";
import { WebsiteDestinationService } from "./services/website-destination.service";
import { WebsitePackageService } from "./services/website-package.service";
import { LandingPageService } from "./services/landing-page.service";

export const WEBSITE_PACKAGE_SERVICE_TOKEN = createToken<WebsitePackageService>("website.service.package");
export const WEBSITE_DESTINATION_SERVICE_TOKEN = createToken<WebsiteDestinationService>("website.service.destination");
export const HOMEPAGE_SERVICE_TOKEN = createToken<HomepageService>("website.service.homepage");
export const NAVIGATION_SERVICE_TOKEN = createToken<NavigationService>("website.service.navigation");
export const WEBSITE_SEARCH_SERVICE_TOKEN = createToken<WebsiteSearchService>("website.service.search");
export const LANDING_PAGE_SERVICE_TOKEN = createToken<LandingPageService>("website.service.landingPage");

/**
 * Backend for Frontend — owns no repositories of its own (pure
 * aggregator). Every read goes through Destination's and Package's public
 * service accessors (getDestinationService(), getPackageService(),
 * getPackagePricingService()) — never a repository, per this sprint's
 * explicit instruction. Isolated from Supplier/TripJack entirely: no
 * import from src/modules/supplier anywhere in this module (grep-verified
 * after build).
 */
export const websiteModule: ModuleDefinition = {
  name: "website",
  register(c) {
    c.registerFactory(
      WEBSITE_PACKAGE_SERVICE_TOKEN,
      () => new WebsitePackageService({ logger: createLogger("website.package") })
    );
    c.registerFactory(
      WEBSITE_DESTINATION_SERVICE_TOKEN,
      () => new WebsiteDestinationService({ logger: createLogger("website.destination") })
    );
    c.registerFactory(
      HOMEPAGE_SERVICE_TOKEN,
      () => new HomepageService({ logger: createLogger("website.homepage") }, c.resolve(WEBSITE_PACKAGE_SERVICE_TOKEN))
    );
    c.registerFactory(NAVIGATION_SERVICE_TOKEN, () => new NavigationService({ logger: createLogger("website.navigation") }));
    c.registerFactory(
      WEBSITE_SEARCH_SERVICE_TOKEN,
      () => new WebsiteSearchService({ logger: createLogger("website.search") }, c.resolve(WEBSITE_PACKAGE_SERVICE_TOKEN))
    );
    c.registerFactory(
      LANDING_PAGE_SERVICE_TOKEN,
      () => new LandingPageService({ logger: createLogger("website.landingPage") })
    );
  },
};

class WebsiteModuleHealthCheck implements HealthCheck {
  readonly name = "website";
  async check(): Promise<HealthCheckResult> {
    return { name: this.name, status: "healthy", checkedAt: new Date().toISOString() };
  }
}

if (!moduleRegistry.getModule(websiteModule.name)) {
  moduleRegistry.registerModule(websiteModule);
  websiteModule.register(container);
  healthCheckRegistry.register(new WebsiteModuleHealthCheck());
}

export function getWebsitePackageService(): WebsitePackageService {
  return container.resolve(WEBSITE_PACKAGE_SERVICE_TOKEN);
}
export function getWebsiteDestinationService(): WebsiteDestinationService {
  return container.resolve(WEBSITE_DESTINATION_SERVICE_TOKEN);
}
export function getHomepageService(): HomepageService {
  return container.resolve(HOMEPAGE_SERVICE_TOKEN);
}
export function getNavigationService(): NavigationService {
  return container.resolve(NAVIGATION_SERVICE_TOKEN);
}
export function getWebsiteSearchService(): WebsiteSearchService {
  return container.resolve(WEBSITE_SEARCH_SERVICE_TOKEN);
}
export function getLandingPageService(): LandingPageService {
  return container.resolve(LANDING_PAGE_SERVICE_TOKEN);
}
