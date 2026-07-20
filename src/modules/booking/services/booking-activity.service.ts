import { isErr, ok, type PaginatedResult, type Result } from "@/shared/types";
import { BaseService, type ServiceContext } from "@/shared/services";
import type { AppError } from "@/shared/errors";
import { getAuditLogService } from "@/modules/auth";
import { AuditEventType } from "@/modules/auth/types/audit-log";
import { PaymentStatus } from "../types/booking-payment";
import type { BookingPaymentService } from "./booking-payment.service";
import type { BookingNoteService } from "./booking-note.service";
import type { BookingStatusHistoryService } from "./booking-status-history.service";
import type { BookingTimelineService } from "./booking-timeline.service";
import type { TravellerService } from "./traveller.service";
import type { PassengerDocumentService } from "../documents/passenger-document.service";
import type { VoucherService } from "../voucher/voucher.service";
import type { InvoiceService } from "../documents/invoice.service";
import {
  BookingActivityCategory,
  type BookingActivityEvent,
  type BookingActivityFilter,
} from "../types/booking-activity";

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 50;
const AUDIT_FETCH_SIZE = 200;

function auditCategory(eventType: string): BookingActivityCategory {
  switch (eventType) {
    case AuditEventType.BOOKING_STATUS_CHANGED:
    case AuditEventType.BOOKING_CANCELLED:
      return BookingActivityCategory.STATUS;
    case AuditEventType.BOOKING_PAYMENT_RECORDED:
    case AuditEventType.BOOKING_PAYMENT_FAILED:
    case AuditEventType.BOOKING_PAYMENT_ADJUSTED:
    case AuditEventType.BOOKING_REFUND_RECORDED:
      return BookingActivityCategory.PAYMENTS;
    case AuditEventType.BOOKING_NOTE_ADDED:
      return BookingActivityCategory.NOTES;
    case AuditEventType.BOOKING_DOCUMENT_ADDED:
    case AuditEventType.BOOKING_DOCUMENT_DELETED:
    case AuditEventType.BOOKING_VOUCHER_GENERATED:
    case AuditEventType.BOOKING_INVOICE_GENERATED:
      return BookingActivityCategory.DOCUMENTS;
    case AuditEventType.EMAIL_SENT:
    case AuditEventType.EMAIL_FAILED:
    case AuditEventType.EMAIL_RETRIED:
      return BookingActivityCategory.EMAILS;
    case AuditEventType.BOOKING_TRAVELLER_ADDED:
    case AuditEventType.BOOKING_TRAVELLER_UPDATED:
    case AuditEventType.BOOKING_TRAVELLER_REMOVED:
      return BookingActivityCategory.TRAVELLERS;
    default:
      return BookingActivityCategory.SYSTEM;
  }
}

function humanizeAudit(eventType: string): string {
  return eventType
    .replace(/^BOOKING_/, "")
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/^\w/, (c) => c.toUpperCase());
}

/**
 * Builds a chronological booking activity feed from audit + domain sources.
 * Prefer audit rows when a domain row is already covered (append-only audit is source of truth for actor).
 */
export class BookingActivityService extends BaseService {
  constructor(
    context: ServiceContext,
    private readonly payments: BookingPaymentService,
    private readonly notes: BookingNoteService,
    private readonly statusHistory: BookingStatusHistoryService,
    private readonly timeline: BookingTimelineService,
    private readonly travellers: TravellerService,
    private readonly documents: PassengerDocumentService,
    private readonly vouchers: VoucherService,
    private readonly invoices: InvoiceService
  ) {
    super(context);
  }

  async listByBooking(
    bookingId: string,
    filter: BookingActivityFilter = {}
  ): Promise<Result<PaginatedResult<BookingActivityEvent>, AppError>> {
    const page = filter.page ?? DEFAULT_PAGE;
    const pageSize = filter.pageSize ?? DEFAULT_PAGE_SIZE;
    const category = filter.category ?? "all";

    const [
      auditResult,
      paymentsResult,
      notesResult,
      statusResult,
      timelineResult,
      travellersResult,
      documentsResult,
      vouchersResult,
      invoicesResult,
    ] = await Promise.all([
      getAuditLogService().list({ bookingId, page: 1, pageSize: AUDIT_FETCH_SIZE }),
      this.payments.listByBooking(bookingId),
      this.notes.listByBooking(bookingId),
      this.statusHistory.listByBooking(bookingId),
      this.timeline.listByBooking(bookingId),
      this.travellers.listByBooking(bookingId),
      this.documents.listByBooking(bookingId),
      this.vouchers.listByBooking(bookingId),
      this.invoices.listByBooking(bookingId),
    ]);

    if (isErr(auditResult)) return auditResult;
    if (isErr(paymentsResult)) return paymentsResult;
    if (isErr(notesResult)) return notesResult;
    if (isErr(statusResult)) return statusResult;
    if (isErr(timelineResult)) return timelineResult;
    if (isErr(travellersResult)) return travellersResult;
    if (isErr(documentsResult)) return documentsResult;
    if (isErr(vouchersResult)) return vouchersResult;
    if (isErr(invoicesResult)) return invoicesResult;

    const events: BookingActivityEvent[] = [];
    const coveredPaymentIds = new Set<string>();
    const coveredNoteIds = new Set<string>();
    const coveredDocumentIds = new Set<string>();
    const coveredTravellerIds = new Set<string>();
    const coveredVoucherIds = new Set<string>();
    const coveredInvoiceIds = new Set<string>();
    const coveredStatusKeys = new Set<string>();
    const coveredTimelineLifecycle = new Set<string>();

    for (const log of auditResult.value.items) {
      const details = (log.details ?? {}) as Record<string, unknown>;
      if (typeof details.paymentId === "string") coveredPaymentIds.add(details.paymentId);
      if (typeof details.noteId === "string") coveredNoteIds.add(details.noteId);
      if (typeof details.documentId === "string") coveredDocumentIds.add(details.documentId);
      if (typeof details.travellerId === "string") coveredTravellerIds.add(details.travellerId);
      if (typeof details.voucherId === "string") coveredVoucherIds.add(details.voucherId);
      if (typeof details.invoiceId === "string") coveredInvoiceIds.add(details.invoiceId);
      const changes = details.changes as { status?: { from?: unknown; to?: unknown } } | undefined;
      if (changes?.status) {
        coveredStatusKeys.add(`${String(changes.status.from ?? "")}->${String(changes.status.to ?? "")}`);
        coveredTimelineLifecycle.add(String(changes.status.to ?? ""));
      }
      if (log.eventType === AuditEventType.BOOKING_CANCELLED) {
        coveredTimelineLifecycle.add("CANCELLED");
      }
      if (log.eventType === AuditEventType.BOOKING_CREATED) {
        coveredTimelineLifecycle.add("CREATED");
      }

      events.push({
        id: `audit:${log.id}`,
        category: auditCategory(log.eventType),
        title: humanizeAudit(log.eventType),
        subtitle: typeof details.action === "string" ? details.action : null,
        actorUserId: log.actorUserId,
        occurredAt: log.occurredAt,
        source: "audit",
        eventType: log.eventType,
        metadata: details,
      });
    }

    for (const entry of statusResult.value) {
      const key = `${entry.fromStatus ?? ""}->${entry.toStatus}`;
      if (coveredStatusKeys.has(key)) continue;
      coveredStatusKeys.add(key);
      coveredTimelineLifecycle.add(entry.toStatus);
      events.push({
        id: `status:${entry.id}`,
        category: BookingActivityCategory.STATUS,
        title: `Status: ${entry.fromStatus ?? "—"} → ${entry.toStatus}`,
        subtitle: entry.note,
        actorUserId: null,
        occurredAt: entry.changedAt,
        source: "status_history",
        eventType: "STATUS_HISTORY",
        metadata: { fromStatus: entry.fromStatus, toStatus: entry.toStatus },
      });
    }

    for (const entry of timelineResult.value) {
      if (entry.event !== "APPROVED" && coveredTimelineLifecycle.has(entry.event)) {
        continue;
      }
      events.push({
        id: `timeline:${entry.id}`,
        category:
          entry.event === "APPROVED" || entry.event === "CREATED"
            ? BookingActivityCategory.SYSTEM
            : BookingActivityCategory.STATUS,
        title: entry.event,
        subtitle: entry.details,
        actorUserId: null,
        occurredAt: entry.occurredAt,
        source: "timeline",
        eventType: entry.event,
        metadata: null,
      });
    }

    for (const payment of paymentsResult.value) {
      if (coveredPaymentIds.has(payment.id)) continue;
      const isRefund = payment.status === PaymentStatus.REFUNDED;
      const isFailed = payment.status === PaymentStatus.FAILED;
      const title = isRefund
        ? "Payment refunded"
        : isFailed
          ? "Payment failed"
          : "Payment confirmed";
      events.push({
        id: `payment:${payment.id}`,
        category: BookingActivityCategory.PAYMENTS,
        title,
        subtitle: `${payment.amount} ${payment.currency} · ${payment.method ?? "Manual"} · ${payment.status}`,
        actorUserId: null,
        occurredAt: payment.paidAt ?? payment.createdAt,
        source: "payment",
        eventType: isRefund
          ? AuditEventType.BOOKING_REFUND_RECORDED
          : isFailed
            ? AuditEventType.BOOKING_PAYMENT_FAILED
            : AuditEventType.BOOKING_PAYMENT_RECORDED,
        metadata: { paymentId: payment.id, status: payment.status },
      });
    }

    for (const note of notesResult.value) {
      if (coveredNoteIds.has(note.id)) continue;
      events.push({
        id: `note:${note.id}`,
        category: BookingActivityCategory.NOTES,
        title: "Note added",
        subtitle: note.body,
        actorUserId: null,
        occurredAt: note.createdAt,
        source: "note",
        eventType: AuditEventType.BOOKING_NOTE_ADDED,
        metadata: { noteId: note.id },
      });
    }

    for (const doc of documentsResult.value) {
      if (coveredDocumentIds.has(doc.id)) continue;
      events.push({
        id: `document:${doc.id}`,
        category: BookingActivityCategory.DOCUMENTS,
        title: "Document added",
        subtitle: `${doc.kind}${doc.fileName ? ` · ${doc.fileName}` : ""}`,
        actorUserId: null,
        occurredAt: doc.createdAt,
        source: "document",
        eventType: AuditEventType.BOOKING_DOCUMENT_ADDED,
        metadata: { documentId: doc.id },
      });
    }

    for (const traveller of travellersResult.value) {
      if (coveredTravellerIds.has(traveller.id)) continue;
      events.push({
        id: `traveller:${traveller.id}`,
        category: BookingActivityCategory.TRAVELLERS,
        title: traveller.isLeadTraveller ? "Lead traveller added" : "Traveller added",
        subtitle: traveller.fullName,
        actorUserId: null,
        occurredAt: traveller.createdAt,
        source: "traveller",
        eventType: AuditEventType.BOOKING_TRAVELLER_ADDED,
        metadata: { travellerId: traveller.id },
      });
    }

    for (const voucher of vouchersResult.value) {
      if (coveredVoucherIds.has(voucher.id)) continue;
      events.push({
        id: `voucher:${voucher.id}`,
        category: BookingActivityCategory.DOCUMENTS,
        title: "Voucher generated",
        subtitle: voucher.voucherNumber,
        actorUserId: null,
        occurredAt: voucher.issuedAt,
        source: "voucher",
        eventType: AuditEventType.BOOKING_VOUCHER_GENERATED,
        metadata: { voucherId: voucher.id },
      });
    }

    for (const invoice of invoicesResult.value) {
      if (coveredInvoiceIds.has(invoice.id)) continue;
      events.push({
        id: `invoice:${invoice.id}`,
        category: BookingActivityCategory.DOCUMENTS,
        title: "Invoice generated",
        subtitle: invoice.invoiceNumber,
        actorUserId: null,
        occurredAt: invoice.issuedAt,
        source: "invoice",
        eventType: AuditEventType.BOOKING_INVOICE_GENERATED,
        metadata: { invoiceId: invoice.id },
      });
    }

    const filtered =
      category === "all" ? events : events.filter((e) => e.category === category);

    filtered.sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime());

    const total = filtered.length;
    const start = (page - 1) * pageSize;
    const items = filtered.slice(start, start + pageSize);

    return ok({
      items,
      page,
      pageSize,
      total,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    });
  }
}
