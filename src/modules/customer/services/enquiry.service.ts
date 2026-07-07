import { err, isErr, ok, type PaginatedResult, type Result } from "@/shared/types";
import { BaseService, type ServiceContext } from "@/shared/services";
import { NotFoundError, type AppError } from "@/shared/errors";
import { EnquiryStatus, type Enquiry, type EnquiryNote } from "../types/enquiry";
import type { EnquiryListFilter, EnquiryRepository } from "../repositories/enquiry.repository";
import {
  validateAssignEnquiry,
  validateEnquiryNoteBody,
  validateSubmitEnquiry,
  validateUpdateEnquiryStatus,
} from "../validation/enquiry.validation";

/**
 * `POST /api/enquiries` is public — an anonymous visitor or a logged-in
 * customer can both submit one. `customerId` is optional and, when
 * present, is sourced the same way as everywhere else in this module:
 * from the authenticated session, never the request body. Stored only —
 * no CRM integration exists yet (see docs/32's Future CRM Integration
 * Points).
 */
export class EnquiryService extends BaseService {
  constructor(
    context: ServiceContext,
    private readonly enquiries: EnquiryRepository
  ) {
    super(context);
  }

  async submit(input: unknown, customerId: string | null = null): Promise<Result<Enquiry, AppError>> {
    const validated = validateSubmitEnquiry(input);
    if (isErr(validated)) return validated;
    const value = validated.value;

    const now = new Date().toISOString();
    this.logger.info("Enquiry submitted", { type: value.type, customerId });
    return this.enquiries.create({
      ...value,
      customerId,
      status: EnquiryStatus.NEW,
      assignedToUserId: null,
      createdAt: now,
      updatedAt: now,
    });
  }

  /** Admin-facing: list/search leads. */
  async list(filter: EnquiryListFilter): Promise<Result<PaginatedResult<Enquiry>, AppError>> {
    return this.enquiries.findByFilter(filter);
  }

  /** Admin-facing: single lead detail. */
  async getById(id: string): Promise<Result<Enquiry, AppError>> {
    const result = await this.enquiries.findById(id);
    if (isErr(result)) return result;
    if (!result.value) return err(new NotFoundError(`Enquiry "${id}" not found`));
    return ok(result.value);
  }

  async updateStatus(id: string, input: unknown): Promise<Result<Enquiry, AppError>> {
    const validated = validateUpdateEnquiryStatus(input);
    if (isErr(validated)) return validated;

    const existing = await this.enquiries.findById(id);
    if (isErr(existing)) return existing;
    if (!existing.value) return err(new NotFoundError(`Enquiry "${id}" not found`));

    this.logger.info("Enquiry status updated", { id, status: validated.value.status });
    return this.enquiries.update(id, { status: validated.value.status, updatedAt: new Date().toISOString() });
  }

  async assign(id: string, input: unknown): Promise<Result<Enquiry, AppError>> {
    const validated = validateAssignEnquiry(input);
    if (isErr(validated)) return validated;

    const existing = await this.enquiries.findById(id);
    if (isErr(existing)) return existing;
    if (!existing.value) return err(new NotFoundError(`Enquiry "${id}" not found`));

    this.logger.info("Enquiry assigned", { id, assignedToUserId: validated.value.assignedToUserId });
    return this.enquiries.update(id, { assignedToUserId: validated.value.assignedToUserId, updatedAt: new Date().toISOString() });
  }

  async listNotes(enquiryId: string): Promise<Result<EnquiryNote[], AppError>> {
    const existing = await this.enquiries.findById(enquiryId);
    if (isErr(existing)) return existing;
    if (!existing.value) return err(new NotFoundError(`Enquiry "${enquiryId}" not found`));
    return this.enquiries.listNotes(enquiryId);
  }

  async addNote(enquiryId: string, input: unknown, authorUserId: string | null): Promise<Result<EnquiryNote, AppError>> {
    const validated = validateEnquiryNoteBody(input);
    if (isErr(validated)) return validated;

    const existing = await this.enquiries.findById(enquiryId);
    if (isErr(existing)) return existing;
    if (!existing.value) return err(new NotFoundError(`Enquiry "${enquiryId}" not found`));

    return this.enquiries.addNote({
      enquiryId,
      authorUserId,
      body: validated.value.body,
      createdAt: new Date().toISOString(),
    });
  }

  async updateNote(enquiryId: string, noteId: string, input: unknown): Promise<Result<EnquiryNote, AppError>> {
    const validated = validateEnquiryNoteBody(input);
    if (isErr(validated)) return validated;

    const note = await this.enquiries.findNoteById(noteId);
    if (isErr(note)) return note;
    if (!note.value || note.value.enquiryId !== enquiryId) {
      return err(new NotFoundError(`Enquiry note "${noteId}" not found`));
    }

    return this.enquiries.updateNote(noteId, validated.value.body);
  }

  async deleteNote(enquiryId: string, noteId: string): Promise<Result<void, AppError>> {
    const note = await this.enquiries.findNoteById(noteId);
    if (isErr(note)) return note;
    if (!note.value || note.value.enquiryId !== enquiryId) {
      return err(new NotFoundError(`Enquiry note "${noteId}" not found`));
    }

    return this.enquiries.deleteNote(noteId);
  }
}
