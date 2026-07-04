import { err, ok, type Result } from "@/shared/types";
import { ValidationError } from "@/shared/errors";
import { Gender, TravellerType, type EmergencyContact } from "../types/traveller";

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function validateEmergencyContact(input: unknown): Result<EmergencyContact | null, ValidationError> {
  if (input === undefined || input === null) return ok(null);
  if (typeof input !== "object") return err(new ValidationError("emergencyContact must be an object"));
  const { name, phone, relation } = input as Record<string, unknown>;
  if (!isNonEmptyString(name)) return err(new ValidationError("emergencyContact.name is required"));
  if (!isNonEmptyString(phone)) return err(new ValidationError("emergencyContact.phone is required"));
  if (relation !== undefined && relation !== null && typeof relation !== "string") {
    return err(new ValidationError("emergencyContact.relation must be a string"));
  }
  return ok({ name, phone, relation: (relation as string | undefined) ?? null });
}

export interface AddTravellerInput {
  type: TravellerType;
  isLeadTraveller: boolean;
  fullName: string;
  email: string | null;
  phone: string | null;
  dateOfBirth: string | null;
  gender: Gender | null;
  nationality: string | null;
  passportNumber: string | null;
  passportExpiry: string | null;
  visaRequired: boolean;
  emergencyContact: EmergencyContact | null;
}

export function validateAddTraveller(input: unknown): Result<AddTravellerInput, ValidationError> {
  if (typeof input !== "object" || input === null) return err(new ValidationError("Request body must be an object"));
  const body = input as Record<string, unknown>;

  const type = (body.type as string | undefined) ?? TravellerType.ADULT;
  if (!Object.values(TravellerType).includes(type as TravellerType)) {
    return err(new ValidationError(`type must be one of: ${Object.values(TravellerType).join(", ")}`));
  }
  if (!isNonEmptyString(body.fullName)) return err(new ValidationError("fullName is required"));
  if (body.email !== undefined && body.email !== null && typeof body.email !== "string") {
    return err(new ValidationError("email must be a string"));
  }
  if (body.phone !== undefined && body.phone !== null && typeof body.phone !== "string") {
    return err(new ValidationError("phone must be a string"));
  }

  if (body.dateOfBirth !== undefined && body.dateOfBirth !== null) {
    if (typeof body.dateOfBirth !== "string" || Number.isNaN(new Date(body.dateOfBirth).getTime())) {
      return err(new ValidationError("dateOfBirth must be a valid ISO date string"));
    }
  }
  if (body.gender !== undefined && body.gender !== null && !Object.values(Gender).includes(body.gender as Gender)) {
    return err(new ValidationError(`gender must be one of: ${Object.values(Gender).join(", ")}`));
  }
  if (body.nationality !== undefined && body.nationality !== null && typeof body.nationality !== "string") {
    return err(new ValidationError("nationality must be a string"));
  }
  if (body.passportNumber !== undefined && body.passportNumber !== null && typeof body.passportNumber !== "string") {
    return err(new ValidationError("passportNumber must be a string"));
  }
  if (body.passportExpiry !== undefined && body.passportExpiry !== null) {
    if (typeof body.passportExpiry !== "string" || Number.isNaN(new Date(body.passportExpiry).getTime())) {
      return err(new ValidationError("passportExpiry must be a valid ISO date string"));
    }
  }
  if (body.visaRequired !== undefined && typeof body.visaRequired !== "boolean") {
    return err(new ValidationError("visaRequired must be a boolean"));
  }
  if (body.isLeadTraveller !== undefined && typeof body.isLeadTraveller !== "boolean") {
    return err(new ValidationError("isLeadTraveller must be a boolean"));
  }

  const emergencyContact = validateEmergencyContact(body.emergencyContact);
  if (!emergencyContact.ok) return emergencyContact;

  return ok({
    type: type as TravellerType,
    isLeadTraveller: (body.isLeadTraveller as boolean | undefined) ?? false,
    fullName: body.fullName as string,
    email: (body.email as string | undefined) ?? null,
    phone: (body.phone as string | undefined) ?? null,
    dateOfBirth: (body.dateOfBirth as string | undefined) ?? null,
    gender: (body.gender as Gender | undefined) ?? null,
    nationality: (body.nationality as string | undefined) ?? null,
    passportNumber: (body.passportNumber as string | undefined) ?? null,
    passportExpiry: (body.passportExpiry as string | undefined) ?? null,
    visaRequired: (body.visaRequired as boolean | undefined) ?? false,
    emergencyContact: emergencyContact.value,
  });
}
