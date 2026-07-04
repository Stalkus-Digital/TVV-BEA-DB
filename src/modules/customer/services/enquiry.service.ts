import { err, isErr, type PaginatedResult, type Result } from "@/shared/types";
import { BaseService, type ServiceContext } from "@/shared/services";
import { NotFoundError, type AppError } from "@/shared/errors";
import { EnquiryStatus, type Enquiry, type EnquiryNote } from "../types/enquiry";
import type { EnquiryListFilter, EnquiryRepository } from "../repositories/enquiry.repository";
import { validateSubmitEnquiry } from "../validation/enquiry.validation";

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
  async getById(id: string): Promise<Result<Enquiry | null, AppError>> {
    return this.enquiries.findById(id);
  }

  async updateStatus(id: string, status: EnquiryStatus): Promise<Result<Enquiry, AppError>> {
    this.logger.info("Enquiry status updated", { id, status });
    return this.enquiries.update(id, { status, updatedAt: new Date().toISOString() });
  }

  async assign(id: string, assignedToUserId: string | null): Promise<Result<Enquiry, AppError>> {
    this.logger.info("Enquiry assigned", { id, assignedToUserId });
    return this.enquiries.update(id, { assignedToUserId, updatedAt: new Date().toISOString() });
  }

  async listNotes(enquiryId: string): Promise<Result<EnquiryNote[], AppError>> {
    return this.enquiries.listNotes(enquiryId);
  }

  async addNote(enquiryId: string, body: string, authorUserId: string | null): Promise<Result<EnquiryNote, AppError>> {
    const existing = await this.enquiries.findById(enquiryId);
    if (isErr(existing)) return existing;
    if (!existing.value) return err(new NotFoundError(`Enquiry "${enquiryId}" not found`));

    const note = await this.enquiries.addNote({
      enquiryId,
      authorUserId,
      body,
      createdAt: new Date().toISOString(),
    });
    return note;
  }
}
