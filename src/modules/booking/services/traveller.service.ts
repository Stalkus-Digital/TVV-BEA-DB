import { err, isErr, ok, type Result } from "@/shared/types";
import { BaseService, type ServiceContext } from "@/shared/services";
import { ConflictError, NotFoundError, ValidationError, type AppError } from "@/shared/errors";
import { AuditEventType } from "@/modules/auth/types/audit-log";
import type { AuditLogService } from "@/modules/auth/audit/audit-log.service";
import type { Traveller } from "../types/traveller";
import type { TravellerRepository } from "../repositories/traveller.repository";
import type { BookingRepository } from "../repositories/booking.repository";
import {
  validateAddTraveller,
  validateMergedTravellerAge,
  validateUpdateTraveller,
} from "../validation/traveller.validation";
import { assessTravellerCompleteness } from "../travellers/traveller-completeness";

export class TravellerService extends BaseService {
  constructor(
    context: ServiceContext,
    private readonly travellers: TravellerRepository,
    private readonly bookings: BookingRepository,
    private readonly auditLog?: AuditLogService
  ) {
    super(context);
  }

  async listByBooking(bookingId: string): Promise<Result<Traveller[], AppError>> {
    return this.travellers.findByBooking(bookingId);
  }

  /**
   * Duplicate prevention: rejects a new traveller whose passport number
   * matches an existing one on this booking, or whose (fullName +
   * dateOfBirth) pair matches an existing one — the two realistic ways the
   * same person could accidentally be entered twice.
   */
  async add(
    bookingId: string,
    input: unknown,
    actorUserId: string | null = null
  ): Promise<Result<Traveller, AppError>> {
    const booking = await this.bookings.findById(bookingId);
    if (isErr(booking)) return booking;
    if (!booking.value) return err(new NotFoundError(`Booking "${bookingId}" not found`));

    const validated = validateAddTraveller(input);
    if (isErr(validated)) return validated;
    const value = validated.value;

    const existingResult = await this.travellers.findByBooking(bookingId);
    if (isErr(existingResult)) return existingResult;

    const duplicate = existingResult.value.find((t) => {
      if (value.passportNumber && t.passportNumber === value.passportNumber) return true;
      if (!value.dateOfBirth) return false;
      return (
        t.fullName.trim().toLowerCase() === value.fullName.trim().toLowerCase() &&
        t.dateOfBirth === value.dateOfBirth
      );
    });
    if (duplicate) {
      return err(new ConflictError(`Traveller "${value.fullName}" already exists on booking "${bookingId}"`));
    }

    if (value.isLeadTraveller) {
      const clearLead = await this.clearOtherLeads(bookingId, null);
      if (isErr(clearLead)) return clearLead;
    } else if (existingResult.value.length === 0) {
      // First traveller becomes lead by default for operational readiness
      value.isLeadTraveller = true;
    }

    this.logger.info("Adding traveller", { bookingId, type: value.type });
    const now = new Date().toISOString();
    const created = await this.travellers.create({
      bookingId,
      type: value.type,
      isLeadTraveller: value.isLeadTraveller,
      fullName: value.fullName,
      email: value.email,
      phone: value.phone,
      dateOfBirth: value.dateOfBirth,
      gender: value.gender,
      nationality: value.nationality,
      passportNumber: value.passportNumber,
      passportExpiry: value.passportExpiry,
      visaRequired: value.visaRequired,
      emergencyContact: value.emergencyContact,
      createdAt: now,
      updatedAt: now,
    });
    if (!isErr(created) && this.auditLog) {
      await this.auditLog.record({
        eventType: AuditEventType.BOOKING_TRAVELLER_ADDED,
        actorUserId,
        details: {
          bookingId,
          travellerId: created.value.id,
          fullName: created.value.fullName,
          type: created.value.type,
          completeness: assessTravellerCompleteness(created.value),
        },
      });
    }
    return created;
  }

  async update(
    bookingId: string,
    travellerId: string,
    input: unknown,
    actorUserId: string | null = null
  ): Promise<Result<Traveller, AppError>> {
    const booking = await this.bookings.findById(bookingId);
    if (isErr(booking)) return booking;
    if (!booking.value) return err(new NotFoundError(`Booking "${bookingId}" not found`));

    const traveller = await this.travellers.findById(travellerId);
    if (isErr(traveller)) return traveller;
    if (!traveller.value || traveller.value.bookingId !== bookingId) {
      return err(new NotFoundError(`Traveller "${travellerId}" not found on booking "${bookingId}"`));
    }

    const validated = validateUpdateTraveller(input);
    if (isErr(validated)) return validated;

    const mergedType = validated.value.type ?? traveller.value.type;
    const mergedDob =
      validated.value.dateOfBirth !== undefined ? validated.value.dateOfBirth : traveller.value.dateOfBirth;
    const ageCheck = validateMergedTravellerAge(mergedType, mergedDob);
    if (isErr(ageCheck)) return ageCheck;

    const siblings = await this.travellers.findByBooking(bookingId);
    if (isErr(siblings)) return siblings;

    const nextName = (validated.value.fullName ?? traveller.value.fullName).trim().toLowerCase();
    const nextPassport =
      validated.value.passportNumber !== undefined
        ? validated.value.passportNumber
        : traveller.value.passportNumber;
    const nextDob = mergedDob;

    const duplicate = siblings.value.find((t) => {
      if (t.id === travellerId) return false;
      if (nextPassport && t.passportNumber === nextPassport) return true;
      if (!nextDob) return false;
      return t.fullName.trim().toLowerCase() === nextName && t.dateOfBirth === nextDob;
    });
    if (duplicate) {
      return err(new ConflictError(`Traveller already exists on booking "${bookingId}"`));
    }

    if (validated.value.isLeadTraveller === true) {
      const clearLead = await this.clearOtherLeads(bookingId, travellerId);
      if (isErr(clearLead)) return clearLead;
    }
    if (validated.value.isLeadTraveller === false && traveller.value.isLeadTraveller) {
      const otherLeads = siblings.value.filter((t) => t.id !== travellerId && t.isLeadTraveller);
      if (otherLeads.length === 0) {
        return err(new ValidationError("Cannot remove lead flag — designate another lead traveller first"));
      }
    }

    const updated = await this.travellers.update(travellerId, {
      ...validated.value,
      updatedAt: new Date().toISOString(),
    });
    if (!isErr(updated) && this.auditLog) {
      await this.auditLog.record({
        eventType: AuditEventType.BOOKING_TRAVELLER_UPDATED,
        actorUserId,
        details: {
          bookingId,
          travellerId,
          changes: validated.value,
          completeness: assessTravellerCompleteness(updated.value),
        },
      });
    }
    return updated;
  }

  async remove(
    bookingId: string,
    travellerId: string,
    actorUserId: string | null = null
  ): Promise<Result<void, AppError>> {
    const booking = await this.bookings.findById(bookingId);
    if (isErr(booking)) return booking;
    if (!booking.value) return err(new NotFoundError(`Booking "${bookingId}" not found`));

    const traveller = await this.travellers.findById(travellerId);
    if (isErr(traveller)) return traveller;
    if (!traveller.value || traveller.value.bookingId !== bookingId) {
      return err(new NotFoundError(`Traveller "${travellerId}" not found on booking "${bookingId}"`));
    }
    const deleted = await this.travellers.delete(travellerId);
    if (!isErr(deleted) && this.auditLog) {
      await this.auditLog.record({
        eventType: AuditEventType.BOOKING_TRAVELLER_REMOVED,
        actorUserId,
        details: {
          bookingId,
          travellerId,
          fullName: traveller.value.fullName,
        },
      });
    }
    return deleted;
  }

  private async clearOtherLeads(bookingId: string, keepTravellerId: string | null): Promise<Result<void, AppError>> {
    const existing = await this.travellers.findByBooking(bookingId);
    if (isErr(existing)) return existing;
    for (const t of existing.value) {
      if (!t.isLeadTraveller) continue;
      if (keepTravellerId && t.id === keepTravellerId) continue;
      const cleared = await this.travellers.update(t.id, {
        isLeadTraveller: false,
        updatedAt: new Date().toISOString(),
      });
      if (isErr(cleared)) return cleared;
    }
    return ok(undefined);
  }
}
