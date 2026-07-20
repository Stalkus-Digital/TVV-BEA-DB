import { err, isErr, ok, type PaginatedResult, type Result } from "@/shared/types";
import { BaseService, type ServiceContext } from "@/shared/services";
import { NotFoundError, type AppError } from "@/shared/errors";
import { AuditEventType } from "@/modules/auth/types/audit-log";
import type { AuditLogService } from "@/modules/auth/audit/audit-log.service";
import { EnquiryStatus, type Enquiry, type EnquiryNote } from "../types/enquiry";
import type { EnquiryListFilter, EnquiryRepository } from "../repositories/enquiry.repository";
import {
  validateAssignEnquiry,
  validateCreateAdminEnquiry,
  validateEnquiryNoteBody,
  validateSubmitEnquiry,
  validateUpdateEnquiryFollowUp,
  validateUpdateEnquiryStatus,
} from "../validation/enquiry.validation";

import type { SembarkService } from "./sembark.service";

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
    private readonly enquiries: EnquiryRepository,
    private readonly sembark: SembarkService,
    private readonly auditLog?: AuditLogService
  ) {
    super(context);
  }

  private async recordAudit(
    eventType: AuditEventType,
    enquiry: Enquiry,
    actorUserId: string | null,
    details?: Record<string, unknown>
  ) {
    if (!this.auditLog) return;
    await this.auditLog.record({
      eventType,
      actorUserId,
      details: { enquiryId: enquiry.id, enquiryName: enquiry.name, ...details },
    });
  }

  async submit(input: unknown, customerId: string | null = null): Promise<Result<Enquiry, AppError>> {
    const validated = validateSubmitEnquiry(input);
    if (isErr(validated)) return validated;
    const value = validated.value;

    const now = new Date().toISOString();
    this.logger.info("Enquiry submitted", { type: value.type, customerId });
    
    const createdResult = await this.enquiries.create({
      ...value,
      customerId,
      status: EnquiryStatus.NEW,
      assignedToUserId: null,
      followUpDate: null,
      priority: null,
      createdAt: now,
      updatedAt: now,
    });
    
    if (isErr(createdResult)) return createdResult;
    
    // Push the lead to Sembark asynchronously so it doesn't block the request
    this.sembark.pushLead(createdResult.value).catch(err => {
      this.logger.error("Failed to push lead to Sembark asynchronously", { err });
    });
    
    return createdResult;
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

  async updateStatus(id: string, input: unknown, actorUserId: string | null = null): Promise<Result<Enquiry, AppError>> {
    const validated = validateUpdateEnquiryStatus(input);
    if (isErr(validated)) return validated;

    const existing = await this.enquiries.findById(id);
    if (isErr(existing)) return existing;
    if (!existing.value) return err(new NotFoundError(`Enquiry "${id}" not found`));

    const previousStatus = existing.value.status;
    this.logger.info("Enquiry status updated", { id, status: validated.value.status });
    const updated = await this.enquiries.update(id, { status: validated.value.status, updatedAt: new Date().toISOString() });
    if (!isErr(updated)) {
      await this.recordAudit(AuditEventType.ENQUIRY_STATUS_CHANGED, updated.value, actorUserId, {
        changes: { status: { from: previousStatus, to: validated.value.status } },
      });
    }
    return updated;
  }

  async assign(id: string, input: unknown, actorUserId: string | null = null): Promise<Result<Enquiry, AppError>> {
    const validated = validateAssignEnquiry(input);
    if (isErr(validated)) return validated;

    const existing = await this.enquiries.findById(id);
    if (isErr(existing)) return existing;
    if (!existing.value) return err(new NotFoundError(`Enquiry "${id}" not found`));

    this.logger.info("Enquiry assigned", { id, assignedToUserId: validated.value.assignedToUserId });
    const updated = await this.enquiries.update(id, { assignedToUserId: validated.value.assignedToUserId, updatedAt: new Date().toISOString() });
    if (!isErr(updated)) {
      await this.recordAudit(AuditEventType.ENQUIRY_UPDATED, updated.value, actorUserId, {
        action: "assigned",
        assignedToUserId: validated.value.assignedToUserId,
      });
    }
    return updated;
  }

  async createAdmin(input: unknown, actorUserId: string | null = null): Promise<Result<Enquiry, AppError>> {
    const validated = validateCreateAdminEnquiry(input);
    if (isErr(validated)) return validated;
    const value = validated.value;
    const now = new Date().toISOString();

    const createdResult = await this.enquiries.create({
      type: value.type ?? "GENERAL",
      name: value.name,
      email: value.email,
      phone: value.phone ?? null,
      message: value.message ?? null,
      destinationSlug: null,
      packageSlug: null,
      hotelSlug: null,
      activitySlug: null,
      customerId: null,
      source: value.source ?? "Manual Entry",
      status: EnquiryStatus.NEW,
      assignedToUserId: null,
      followUpDate: value.followUpDate ?? null,
      priority: value.priority ?? null,
      createdAt: now,
      updatedAt: now,
    });

    if (isErr(createdResult)) return createdResult;
    await this.recordAudit(AuditEventType.ENQUIRY_CREATED, createdResult.value, actorUserId, { source: value.source });
    this.sembark.pushLead(createdResult.value).catch((pushErr) => {
      this.logger.error("Failed to push lead to Sembark asynchronously", { err: pushErr });
    });
    return createdResult;
  }

  async updateFollowUp(id: string, input: unknown, actorUserId: string | null = null): Promise<Result<Enquiry, AppError>> {
    const validated = validateUpdateEnquiryFollowUp(input);
    if (isErr(validated)) return validated;

    const existing = await this.enquiries.findById(id);
    if (isErr(existing)) return existing;
    if (!existing.value) return err(new NotFoundError(`Enquiry "${id}" not found`));

    const updated = await this.enquiries.update(id, {
      followUpDate: validated.value.followUpDate,
      ...(validated.value.priority !== undefined ? { priority: validated.value.priority } : {}),
      updatedAt: new Date().toISOString(),
    });
    if (!isErr(updated)) {
      await this.recordAudit(AuditEventType.ENQUIRY_UPDATED, updated.value, actorUserId, {
        action: "follow-up updated",
        followUpDate: validated.value.followUpDate,
        priority: validated.value.priority,
      });
    }
    return updated;
  }

  async delete(id: string, actorUserId: string | null = null): Promise<Result<void, AppError>> {
    const existing = await this.enquiries.findById(id);
    if (isErr(existing)) return existing;
    if (!existing.value) return err(new NotFoundError(`Enquiry "${id}" not found`));

    await this.recordAudit(AuditEventType.ENQUIRY_DELETED, existing.value, actorUserId, {});
    return this.enquiries.delete(id);
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
