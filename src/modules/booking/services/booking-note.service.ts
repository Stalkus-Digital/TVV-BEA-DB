import { isErr, type Result } from "@/shared/types";
import { BaseService, type ServiceContext } from "@/shared/services";
import type { AppError } from "@/shared/errors";
import { AuditEventType } from "@/modules/auth/types/audit-log";
import type { AuditLogService } from "@/modules/auth/audit/audit-log.service";
import type { BookingNote } from "../types/booking-note";
import type { NoteRepository } from "../repositories/note.repository";
import { validateAddNote } from "../validation/note.validation";

export class BookingNoteService extends BaseService {
  constructor(
    context: ServiceContext,
    private readonly notes: NoteRepository,
    private readonly auditLog?: AuditLogService
  ) {
    super(context);
  }

  async listByBooking(bookingId: string): Promise<Result<BookingNote[], AppError>> {
    return this.notes.findByBooking(bookingId);
  }

  async add(
    bookingId: string,
    input: unknown,
    actorUserId: string | null = null
  ): Promise<Result<BookingNote, AppError>> {
    const validated = validateAddNote(input);
    if (isErr(validated)) return validated;

    this.logger.info("Adding booking note", { bookingId });
    const created = await this.notes.create({
      bookingId,
      body: validated.value.body,
      createdAt: new Date().toISOString(),
    });
    if (!isErr(created) && this.auditLog) {
      await this.auditLog.record({
        eventType: AuditEventType.BOOKING_NOTE_ADDED,
        actorUserId,
        details: { bookingId, noteId: created.value.id },
      });
    }
    return created;
  }
}
