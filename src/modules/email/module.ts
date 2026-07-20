import { container, createToken, moduleRegistry, type ModuleDefinition } from "@/shared/di";
import { createLogger } from "@/shared/logger";
import { getAuditLogService } from "@/modules/auth";
import { BookingEmailService } from "./booking/booking-email.service";
import { EmailService } from "./email.service";

export const EMAIL_SERVICE_TOKEN = createToken<EmailService>("email.service");
export const BOOKING_EMAIL_SERVICE_TOKEN = createToken<BookingEmailService>("email.booking");

/**
 * Email module — SMTP via EmailService; booking transactional mail via BookingEmailService.
 * Phase 1 is email-only (no SMS / WhatsApp / Push).
 */
export const emailModule: ModuleDefinition = {
  name: "email",
  register(c) {
    c.registerFactory(
      EMAIL_SERVICE_TOKEN,
      () => new EmailService({ logger: createLogger("email.service") })
    );
    c.registerFactory(
      BOOKING_EMAIL_SERVICE_TOKEN,
      () =>
        new BookingEmailService(
          { logger: createLogger("email.booking") },
          getAuditLogService(),
          c.resolve(EMAIL_SERVICE_TOKEN)
        )
    );
  },
};

if (!moduleRegistry.getModule(emailModule.name)) {
  moduleRegistry.registerModule(emailModule);
  emailModule.register(container);
}

export function getEmailService(): EmailService {
  return container.resolve(EMAIL_SERVICE_TOKEN);
}

export function getBookingEmailService(): BookingEmailService {
  return container.resolve(BOOKING_EMAIL_SERVICE_TOKEN);
}
