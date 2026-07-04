import { isErr, type Result } from "@/shared/types";
import { BaseService, type ServiceContext } from "@/shared/services";
import type { AppError } from "@/shared/errors";
import type { BookingNote } from "../types/booking-note";
import type { NoteRepository } from "../repositories/note.repository";
import { validateAddNote } from "../validation/note.validation";

export class BookingNoteService extends BaseService {
  constructor(
    context: ServiceContext,
    private readonly notes: NoteRepository
  ) {
    super(context);
  }

  async listByBooking(bookingId: string): Promise<Result<BookingNote[], AppError>> {
    return this.notes.findByBooking(bookingId);
  }

  async add(bookingId: string, input: unknown): Promise<Result<BookingNote, AppError>> {
    const validated = validateAddNote(input);
    if (isErr(validated)) return validated;

    this.logger.info("Adding booking note", { bookingId });
    return this.notes.create({ bookingId, body: validated.value.body, createdAt: new Date().toISOString() });
  }
}
