import { err, isErr, ok, type Result } from "@/shared/types";
import { BaseService, type ServiceContext } from "@/shared/services";
import { ConflictError, NotFoundError, type AppError } from "@/shared/errors";
import type { Traveller } from "../types/traveller";
import type { TravellerRepository } from "../repositories/traveller.repository";
import { validateAddTraveller } from "../validation/traveller.validation";

export class TravellerService extends BaseService {
  constructor(
    context: ServiceContext,
    private readonly travellers: TravellerRepository
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
  async add(bookingId: string, input: unknown): Promise<Result<Traveller, AppError>> {
    const validated = validateAddTraveller(input);
    if (isErr(validated)) return validated;
    const value = validated.value;

    const existingResult = await this.travellers.findByBooking(bookingId);
    if (isErr(existingResult)) return existingResult;

    const duplicate = existingResult.value.find((t) => {
      if (value.passportNumber && t.passportNumber === value.passportNumber) return true;
      return t.fullName.trim().toLowerCase() === value.fullName.trim().toLowerCase() && t.dateOfBirth === value.dateOfBirth;
    });
    if (duplicate) {
      return err(new ConflictError(`Traveller "${value.fullName}" already exists on booking "${bookingId}"`));
    }

    this.logger.info("Adding traveller", { bookingId, type: value.type });
    const now = new Date().toISOString();
    return this.travellers.create({
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
  }

  async remove(bookingId: string, travellerId: string): Promise<Result<void, AppError>> {
    const traveller = await this.travellers.findById(travellerId);
    if (isErr(traveller)) return traveller;
    if (!traveller.value || traveller.value.bookingId !== bookingId) {
      return err(new NotFoundError(`Traveller "${travellerId}" not found on booking "${bookingId}"`));
    }
    return this.travellers.delete(travellerId);
  }
}
