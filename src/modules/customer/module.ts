import { container, createToken, moduleRegistry, type ModuleDefinition } from "@/shared/di";
import { healthCheckRegistry, type HealthCheck, type HealthCheckResult } from "@/shared/health";
import { createLogger } from "@/shared/logger";
import { PrismaCustomerProfileRepository } from "./repositories/customer-profile.repository.prisma";
import { PrismaEnquiryRepository } from "./repositories/enquiry.repository.prisma";
import { PrismaNotificationRepository } from "./repositories/notification.repository.prisma";
import { CustomerProfileService } from "./services/customer-profile.service";
import { CustomerQuoteService } from "./services/customer-quote.service";
import { CustomerBookingService } from "./services/customer-booking.service";
import { EnquiryService } from "./services/enquiry.service";
import { CustomerDocumentService } from "./documents/document.service";
import { DashboardService } from "./dashboard/dashboard.service";
import { SembarkService } from "./services/sembark.service";

export const CUSTOMER_PROFILE_REPOSITORY_TOKEN = createToken<PrismaCustomerProfileRepository>("customer.repository.profile");
export const ENQUIRY_REPOSITORY_TOKEN = createToken<PrismaEnquiryRepository>("customer.repository.enquiry");
export const NOTIFICATION_REPOSITORY_TOKEN = createToken<PrismaNotificationRepository>("customer.repository.notification");

export const CUSTOMER_PROFILE_SERVICE_TOKEN = createToken<CustomerProfileService>("customer.service.profile");
export const CUSTOMER_QUOTE_SERVICE_TOKEN = createToken<CustomerQuoteService>("customer.service.quote");
export const CUSTOMER_BOOKING_SERVICE_TOKEN = createToken<CustomerBookingService>("customer.service.booking");
export const ENQUIRY_SERVICE_TOKEN = createToken<EnquiryService>("customer.service.enquiry");
export const CUSTOMER_DOCUMENT_SERVICE_TOKEN = createToken<CustomerDocumentService>("customer.service.document");
export const DASHBOARD_SERVICE_TOKEN = createToken<DashboardService>("customer.service.dashboard");

export const SEMBARK_SERVICE_TOKEN = createToken<SembarkService>("customer.service.sembark");

/**
 * The ONLY backend entry point for authenticated customers (Sprint 13).
 * Owns no admin-facing routes at all — every read/write of a Quote or
 * Booking here goes through Quote's/Booking's own public service
 * accessors (`getQuoteService()`, `getBookingService()`), the same
 * public-service-boundary discipline as every other module edge in this
 * project, with an explicit ownership check layered on top in this
 * module's own services. Never imports anything from `src/modules/{auth}`
 * beyond its public accessors and types.
 */
export const customerModule: ModuleDefinition = {
  name: "customer",
  register(c) {
    c.registerFactory(CUSTOMER_PROFILE_REPOSITORY_TOKEN, () => new PrismaCustomerProfileRepository());
    c.registerFactory(ENQUIRY_REPOSITORY_TOKEN, () => new PrismaEnquiryRepository());
    c.registerFactory(NOTIFICATION_REPOSITORY_TOKEN, () => new PrismaNotificationRepository());

    c.registerFactory(
      SEMBARK_SERVICE_TOKEN,
      () => new SembarkService({ logger: createLogger("customer.sembark") })
    );

    c.registerFactory(
      CUSTOMER_PROFILE_SERVICE_TOKEN,
      () => new CustomerProfileService({ logger: createLogger("customer.profile") }, c.resolve(CUSTOMER_PROFILE_REPOSITORY_TOKEN))
    );
    c.registerFactory(CUSTOMER_QUOTE_SERVICE_TOKEN, () => new CustomerQuoteService({ logger: createLogger("customer.quote") }));
    c.registerFactory(CUSTOMER_BOOKING_SERVICE_TOKEN, () => new CustomerBookingService({ logger: createLogger("customer.booking") }));
    c.registerFactory(
      ENQUIRY_SERVICE_TOKEN,
      () => new EnquiryService({ logger: createLogger("customer.enquiry") }, c.resolve(ENQUIRY_REPOSITORY_TOKEN), c.resolve(SEMBARK_SERVICE_TOKEN))
    );
    c.registerFactory(CUSTOMER_DOCUMENT_SERVICE_TOKEN, () => new CustomerDocumentService({ logger: createLogger("customer.document") }));
    c.registerFactory(
      DASHBOARD_SERVICE_TOKEN,
      () =>
        new DashboardService(
          { logger: createLogger("customer.dashboard") },
          c.resolve(CUSTOMER_PROFILE_SERVICE_TOKEN),
          c.resolve(NOTIFICATION_REPOSITORY_TOKEN)
        )
    );
  },
};

class CustomerModuleHealthCheck implements HealthCheck {
  readonly name = "customer";
  async check(): Promise<HealthCheckResult> {
    return { name: this.name, status: "healthy", checkedAt: new Date().toISOString() };
  }
}

if (!moduleRegistry.getModule(customerModule.name)) {
  moduleRegistry.registerModule(customerModule);
  customerModule.register(container);
  healthCheckRegistry.register(new CustomerModuleHealthCheck());
}

export function getCustomerProfileService(): CustomerProfileService {
  return container.resolve(CUSTOMER_PROFILE_SERVICE_TOKEN);
}
export function getCustomerQuoteService(): CustomerQuoteService {
  return container.resolve(CUSTOMER_QUOTE_SERVICE_TOKEN);
}
export function getCustomerBookingService(): CustomerBookingService {
  return container.resolve(CUSTOMER_BOOKING_SERVICE_TOKEN);
}
export function getEnquiryService(): EnquiryService {
  return container.resolve(ENQUIRY_SERVICE_TOKEN);
}
export function getCustomerDocumentService(): CustomerDocumentService {
  return container.resolve(CUSTOMER_DOCUMENT_SERVICE_TOKEN);
}
export function getDashboardService(): DashboardService {
  return container.resolve(DASHBOARD_SERVICE_TOKEN);
}
export function getSembarkService(): SembarkService {
  return container.resolve(SEMBARK_SERVICE_TOKEN);
}
