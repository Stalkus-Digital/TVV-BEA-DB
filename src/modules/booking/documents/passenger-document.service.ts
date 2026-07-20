import { err, isErr, ok, type Result } from "@/shared/types";
import { BaseService, type ServiceContext } from "@/shared/services";
import { NotFoundError, type AppError } from "@/shared/errors";
import { AuditEventType } from "@/modules/auth/types/audit-log";
import type { AuditLogService } from "@/modules/auth/audit/audit-log.service";
import { enrichPassengerDocument, type PassengerDocument } from "../types/document";
import type { DocumentRepository } from "../repositories/document.repository";
import type { TravellerRepository } from "../repositories/traveller.repository";
import type { BookingRepository } from "../repositories/booking.repository";
import { validateAddDocument, validateUpdateDocument } from "../validation/document.validation";

export class PassengerDocumentService extends BaseService {
  constructor(
    context: ServiceContext,
    private readonly documents: DocumentRepository,
    private readonly travellers: TravellerRepository,
    private readonly bookings: BookingRepository,
    private readonly auditLog?: AuditLogService
  ) {
    super(context);
  }

  async listByBooking(bookingId: string): Promise<Result<PassengerDocument[], AppError>> {
    const result = await this.documents.findByBooking(bookingId);
    if (isErr(result)) return result;
    return ok(result.value.map(enrichPassengerDocument));
  }

  async add(
    bookingId: string,
    input: unknown,
    actorUserId: string | null = null
  ): Promise<Result<PassengerDocument, AppError>> {
    const booking = await this.bookings.findById(bookingId);
    if (isErr(booking)) return booking;
    if (!booking.value) return err(new NotFoundError(`Booking "${bookingId}" not found`));

    const validated = validateAddDocument(input);
    if (isErr(validated)) return validated;
    const value = validated.value;

    if (value.travellerId) {
      const traveller = await this.travellers.findById(value.travellerId);
      if (isErr(traveller)) return traveller;
      if (!traveller.value || traveller.value.bookingId !== bookingId) {
        return err(new NotFoundError(`Traveller "${value.travellerId}" not found on booking "${bookingId}"`));
      }
    }

    this.logger.info("Adding passenger document", { bookingId, kind: value.kind });
    const created = await this.documents.create({
      bookingId,
      travellerId: value.travellerId,
      kind: value.kind,
      fileUrl: value.fileUrl,
      fileName: value.fileName,
      issuedAt: value.issuedAt,
      expiresAt: value.expiresAt,
      notes: value.notes,
      verificationStatus: value.verificationStatus,
      createdAt: new Date().toISOString(),
    });
    if (!isErr(created) && this.auditLog) {
      await this.auditLog.record({
        eventType: AuditEventType.BOOKING_DOCUMENT_ADDED,
        actorUserId,
        details: {
          bookingId,
          documentId: created.value.id,
          kind: created.value.kind,
          travellerId: created.value.travellerId,
        },
      });
    }
    if (isErr(created)) return created;
    return ok(enrichPassengerDocument(created.value));
  }

  async update(
    bookingId: string,
    documentId: string,
    input: unknown,
    actorUserId: string | null = null
  ): Promise<Result<PassengerDocument, AppError>> {
    const booking = await this.bookings.findById(bookingId);
    if (isErr(booking)) return booking;
    if (!booking.value) return err(new NotFoundError(`Booking "${bookingId}" not found`));

    const existing = await this.documents.findById(documentId);
    if (isErr(existing)) return existing;
    if (!existing.value || existing.value.bookingId !== bookingId) {
      return err(new NotFoundError(`Document "${documentId}" not found on booking "${bookingId}"`));
    }

    const validated = validateUpdateDocument(input);
    if (isErr(validated)) return validated;

    if (validated.value.travellerId) {
      const traveller = await this.travellers.findById(validated.value.travellerId);
      if (isErr(traveller)) return traveller;
      if (!traveller.value || traveller.value.bookingId !== bookingId) {
        return err(new NotFoundError(`Traveller "${validated.value.travellerId}" not found on booking "${bookingId}"`));
      }
    }

    const updated = await this.documents.update(documentId, validated.value);
    if (!isErr(updated) && this.auditLog) {
      await this.auditLog.record({
        eventType: AuditEventType.BOOKING_DOCUMENT_ADDED,
        actorUserId,
        details: {
          bookingId,
          documentId,
          action: "document updated",
          changes: validated.value,
        },
      });
    }
    if (isErr(updated)) return updated;
    return ok(enrichPassengerDocument(updated.value));
  }

  async remove(
    bookingId: string,
    documentId: string,
    actorUserId: string | null = null
  ): Promise<Result<void, AppError>> {
    const booking = await this.bookings.findById(bookingId);
    if (isErr(booking)) return booking;
    if (!booking.value) return err(new NotFoundError(`Booking "${bookingId}" not found`));

    const existing = await this.documents.findById(documentId);
    if (isErr(existing)) return existing;
    if (!existing.value || existing.value.bookingId !== bookingId) {
      return err(new NotFoundError(`Document "${documentId}" not found on booking "${bookingId}"`));
    }

    const deleted = await this.documents.delete(documentId);
    if (!isErr(deleted) && this.auditLog) {
      await this.auditLog.record({
        eventType: AuditEventType.BOOKING_DOCUMENT_DELETED,
        actorUserId,
        details: {
          bookingId,
          documentId,
          kind: existing.value.kind,
          travellerId: existing.value.travellerId,
        },
      });
    }
    return deleted;
  }
}
