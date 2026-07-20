import { container, createToken, moduleRegistry, type ModuleDefinition } from "@/shared/di";
import { healthCheckRegistry, type HealthCheck, type HealthCheckResult } from "@/shared/health";
import { createLogger } from "@/shared/logger";
import type {
  BookingItemRepository,
  BookingRepository,
  DocumentRepository,
  InvoiceRepository,
  NoteRepository,
  PaymentRepository,
  StatusHistoryRepository,
  TimelineRepository,
  TravellerRepository,
  VoucherRepository,
} from "./repositories";
import { PrismaBookingItemRepository } from "./repositories/booking-item.repository.prisma";
import { PrismaBookingRepository } from "./repositories/booking.repository.prisma";
import { PrismaDocumentRepository } from "./repositories/document.repository.prisma";
import { PrismaInvoiceRepository } from "./repositories/invoice.repository.prisma";
import { PrismaNoteRepository } from "./repositories/note.repository.prisma";
import { PrismaPaymentRepository } from "./repositories/payment.repository.prisma";
import { PrismaStatusHistoryRepository } from "./repositories/status-history.repository.prisma";
import { PrismaTimelineRepository } from "./repositories/timeline.repository.prisma";
import { PrismaTravellerRepository } from "./repositories/traveller.repository.prisma";
import { PrismaVoucherRepository } from "./repositories/voucher.repository.prisma";
import { PassengerDocumentService } from "./documents/passenger-document.service";
import { InvoiceService } from "./documents/invoice.service";
import { VoucherService } from "./voucher/voucher.service";
import { BookingService } from "./services/booking.service";
import { BookingItemService } from "./services/booking-item.service";
import { TravellerService } from "./services/traveller.service";
import { BookingNoteService } from "./services/booking-note.service";
import { BookingStatusHistoryService } from "./services/booking-status-history.service";
import { BookingTimelineService } from "./services/booking-timeline.service";
import { BookingPaymentService } from "./services/booking-payment.service";
import { BookingActivityService } from "./services/booking-activity.service";
import { FulfillmentService } from "./services/fulfillment.service";
import { getAuditLogService } from "@/modules/auth";

export const BOOKING_REPOSITORY_TOKEN = createToken<BookingRepository>("booking.repository.booking");
export const BOOKING_ITEM_REPOSITORY_TOKEN = createToken<BookingItemRepository>("booking.repository.item");
export const TRAVELLER_REPOSITORY_TOKEN = createToken<TravellerRepository>("booking.repository.traveller");
export const DOCUMENT_REPOSITORY_TOKEN = createToken<DocumentRepository>("booking.repository.document");
export const PAYMENT_REPOSITORY_TOKEN = createToken<PaymentRepository>("booking.repository.payment");
export const INVOICE_REPOSITORY_TOKEN = createToken<InvoiceRepository>("booking.repository.invoice");
export const VOUCHER_REPOSITORY_TOKEN = createToken<VoucherRepository>("booking.repository.voucher");
export const STATUS_HISTORY_REPOSITORY_TOKEN = createToken<StatusHistoryRepository>("booking.repository.statusHistory");
export const TIMELINE_REPOSITORY_TOKEN = createToken<TimelineRepository>("booking.repository.timeline");
export const NOTE_REPOSITORY_TOKEN = createToken<NoteRepository>("booking.repository.note");

export const BOOKING_SERVICE_TOKEN = createToken<BookingService>("booking.service.booking");
export const BOOKING_ITEM_SERVICE_TOKEN = createToken<BookingItemService>("booking.service.item");
export const TRAVELLER_SERVICE_TOKEN = createToken<TravellerService>("booking.service.traveller");
export const PASSENGER_DOCUMENT_SERVICE_TOKEN = createToken<PassengerDocumentService>("booking.service.document");
export const BOOKING_PAYMENT_SERVICE_TOKEN = createToken<BookingPaymentService>("booking.service.payment");
export const INVOICE_SERVICE_TOKEN = createToken<InvoiceService>("booking.service.invoice");
export const VOUCHER_SERVICE_TOKEN = createToken<VoucherService>("booking.service.voucher");
export const BOOKING_STATUS_HISTORY_SERVICE_TOKEN = createToken<BookingStatusHistoryService>("booking.service.statusHistory");
export const BOOKING_TIMELINE_SERVICE_TOKEN = createToken<BookingTimelineService>("booking.service.timeline");
export const BOOKING_NOTE_SERVICE_TOKEN = createToken<BookingNoteService>("booking.service.note");
export const BOOKING_ACTIVITY_SERVICE_TOKEN = createToken<BookingActivityService>("booking.service.activity");
export const FULFILLMENT_SERVICE_TOKEN = createToken<FulfillmentService>("booking.service.fulfillment");

/**
 * Booking Engine — created ONLY from an APPROVED Quote. Touches Quote
 * through `buildBookingHandoff` + `completeConversion` (never a Quote
 * repository, never a Package repository). No TripJack/Ferry/payment-gateway
 * /AI/CRM integration beyond optional Sembark push — SupplierBookingReference
 * stays a placeholder (NOT_REQUIRED/null) and admin payments are manually
 * recorded (gateway checkout lives in the payments module).
 */
export const bookingModule: ModuleDefinition = {
  name: "booking",
  register(c) {
    c.registerFactory(BOOKING_REPOSITORY_TOKEN, () => new PrismaBookingRepository());
    c.registerFactory(BOOKING_ITEM_REPOSITORY_TOKEN, () => new PrismaBookingItemRepository());
    c.registerFactory(TRAVELLER_REPOSITORY_TOKEN, () => new PrismaTravellerRepository());
    c.registerFactory(DOCUMENT_REPOSITORY_TOKEN, () => new PrismaDocumentRepository());
    c.registerFactory(PAYMENT_REPOSITORY_TOKEN, () => new PrismaPaymentRepository());
    c.registerFactory(INVOICE_REPOSITORY_TOKEN, () => new PrismaInvoiceRepository());
    c.registerFactory(VOUCHER_REPOSITORY_TOKEN, () => new PrismaVoucherRepository());
    c.registerFactory(STATUS_HISTORY_REPOSITORY_TOKEN, () => new PrismaStatusHistoryRepository());
    c.registerFactory(TIMELINE_REPOSITORY_TOKEN, () => new PrismaTimelineRepository());
    c.registerFactory(NOTE_REPOSITORY_TOKEN, () => new PrismaNoteRepository());

    c.registerFactory(BOOKING_ITEM_SERVICE_TOKEN, () => new BookingItemService({ logger: createLogger("booking.item") }, c.resolve(BOOKING_ITEM_REPOSITORY_TOKEN)));
    c.registerFactory(
      TRAVELLER_SERVICE_TOKEN,
      () =>
        new TravellerService(
          { logger: createLogger("booking.traveller") },
          c.resolve(TRAVELLER_REPOSITORY_TOKEN),
          c.resolve(BOOKING_REPOSITORY_TOKEN),
          getAuditLogService()
        )
    );
    c.registerFactory(
      PASSENGER_DOCUMENT_SERVICE_TOKEN,
      () =>
        new PassengerDocumentService(
          { logger: createLogger("booking.document") },
          c.resolve(DOCUMENT_REPOSITORY_TOKEN),
          c.resolve(TRAVELLER_REPOSITORY_TOKEN),
          c.resolve(BOOKING_REPOSITORY_TOKEN),
          getAuditLogService()
        )
    );
    c.registerFactory(BOOKING_PAYMENT_SERVICE_TOKEN, () => new BookingPaymentService({ logger: createLogger("booking.payment") }, c.resolve(PAYMENT_REPOSITORY_TOKEN)));
    c.registerFactory(
      INVOICE_SERVICE_TOKEN,
      () =>
        new InvoiceService(
          { logger: createLogger("booking.invoice") },
          c.resolve(INVOICE_REPOSITORY_TOKEN),
          c.resolve(BOOKING_ITEM_REPOSITORY_TOKEN),
          c.resolve(TRAVELLER_REPOSITORY_TOKEN)
        )
    );
    c.registerFactory(
      VOUCHER_SERVICE_TOKEN,
      () =>
        new VoucherService(
          { logger: createLogger("booking.voucher") },
          c.resolve(VOUCHER_REPOSITORY_TOKEN),
          c.resolve(BOOKING_ITEM_REPOSITORY_TOKEN),
          c.resolve(TRAVELLER_REPOSITORY_TOKEN)
        )
    );
    c.registerFactory(BOOKING_STATUS_HISTORY_SERVICE_TOKEN, () => new BookingStatusHistoryService({ logger: createLogger("booking.statusHistory") }, c.resolve(STATUS_HISTORY_REPOSITORY_TOKEN)));
    c.registerFactory(BOOKING_TIMELINE_SERVICE_TOKEN, () => new BookingTimelineService({ logger: createLogger("booking.timeline") }, c.resolve(TIMELINE_REPOSITORY_TOKEN)));
    c.registerFactory(
      BOOKING_NOTE_SERVICE_TOKEN,
      () =>
        new BookingNoteService(
          { logger: createLogger("booking.note") },
          c.resolve(NOTE_REPOSITORY_TOKEN),
          getAuditLogService()
        )
    );
    c.registerFactory(FULFILLMENT_SERVICE_TOKEN, () => new FulfillmentService({ logger: createLogger("booking.fulfillment") }));

    c.registerFactory(
      BOOKING_SERVICE_TOKEN,
      () =>
        new BookingService(
          { logger: createLogger("booking.service") },
          c.resolve(BOOKING_REPOSITORY_TOKEN),
          c.resolve(BOOKING_ITEM_REPOSITORY_TOKEN),
          c.resolve(TRAVELLER_REPOSITORY_TOKEN),
          c.resolve(BOOKING_PAYMENT_SERVICE_TOKEN),
          c.resolve(BOOKING_STATUS_HISTORY_SERVICE_TOKEN),
          c.resolve(BOOKING_TIMELINE_SERVICE_TOKEN),
          c.resolve(VOUCHER_SERVICE_TOKEN),
          c.resolve(INVOICE_SERVICE_TOKEN),
          getAuditLogService()
        )
    );
    c.registerFactory(
      BOOKING_ACTIVITY_SERVICE_TOKEN,
      () =>
        new BookingActivityService(
          { logger: createLogger("booking.activity") },
          c.resolve(BOOKING_PAYMENT_SERVICE_TOKEN),
          c.resolve(BOOKING_NOTE_SERVICE_TOKEN),
          c.resolve(BOOKING_STATUS_HISTORY_SERVICE_TOKEN),
          c.resolve(BOOKING_TIMELINE_SERVICE_TOKEN),
          c.resolve(TRAVELLER_SERVICE_TOKEN),
          c.resolve(PASSENGER_DOCUMENT_SERVICE_TOKEN),
          c.resolve(VOUCHER_SERVICE_TOKEN),
          c.resolve(INVOICE_SERVICE_TOKEN)
        )
    );
  },
};

class BookingModuleHealthCheck implements HealthCheck {
  readonly name = "booking";
  async check(): Promise<HealthCheckResult> {
    return { name: this.name, status: "healthy", checkedAt: new Date().toISOString() };
  }
}

if (!moduleRegistry.getModule(bookingModule.name)) {
  moduleRegistry.registerModule(bookingModule);
  bookingModule.register(container);
  healthCheckRegistry.register(new BookingModuleHealthCheck());
}

export function getBookingService(): BookingService {
  return container.resolve(BOOKING_SERVICE_TOKEN);
}
export function getBookingItemService(): BookingItemService {
  return container.resolve(BOOKING_ITEM_SERVICE_TOKEN);
}
export function getTravellerService(): TravellerService {
  return container.resolve(TRAVELLER_SERVICE_TOKEN);
}
export function getPassengerDocumentService(): PassengerDocumentService {
  return container.resolve(PASSENGER_DOCUMENT_SERVICE_TOKEN);
}
export function getBookingPaymentService(): BookingPaymentService {
  return container.resolve(BOOKING_PAYMENT_SERVICE_TOKEN);
}
export function getInvoiceService(): InvoiceService {
  return container.resolve(INVOICE_SERVICE_TOKEN);
}
export function getVoucherService(): VoucherService {
  return container.resolve(VOUCHER_SERVICE_TOKEN);
}
export function getBookingStatusHistoryService(): BookingStatusHistoryService {
  return container.resolve(BOOKING_STATUS_HISTORY_SERVICE_TOKEN);
}
export function getBookingTimelineService(): BookingTimelineService {
  return container.resolve(BOOKING_TIMELINE_SERVICE_TOKEN);
}
export function getBookingNoteService(): BookingNoteService {
  return container.resolve(BOOKING_NOTE_SERVICE_TOKEN);
}
export function getBookingActivityService(): BookingActivityService {
  return container.resolve(BOOKING_ACTIVITY_SERVICE_TOKEN);
}
export function getFulfillmentService(): FulfillmentService {
  return container.resolve(FULFILLMENT_SERVICE_TOKEN);
}
