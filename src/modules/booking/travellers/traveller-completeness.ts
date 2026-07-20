import { TravellerType, type Traveller } from "../types/traveller";

/** Conventional travel industry age bands (years). Documented for PP-002C-5. */
export const TRAVELLER_AGE_BANDS = {
  INFANT_MAX_EXCLUSIVE: 2,
  CHILD_MAX_EXCLUSIVE: 12,
} as const;

export interface TravellerCompleteness {
  complete: boolean;
  missing: string[];
}

/**
 * Required for operational completeness before confirm:
 * fullName, type, nationality; lead also needs email or phone;
 * DOB recommended but enforced when type is CHILD/INFANT.
 */
export function assessTravellerCompleteness(traveller: Pick<
  Traveller,
  "fullName" | "type" | "nationality" | "dateOfBirth" | "email" | "phone" | "isLeadTraveller" | "passportNumber"
>): TravellerCompleteness {
  const missing: string[] = [];
  if (!traveller.fullName?.trim()) missing.push("fullName");
  if (!traveller.type) missing.push("type");
  if (!traveller.nationality?.trim()) missing.push("nationality");
  if (
    (traveller.type === TravellerType.CHILD || traveller.type === TravellerType.INFANT) &&
    !traveller.dateOfBirth
  ) {
    missing.push("dateOfBirth");
  }
  if (traveller.isLeadTraveller && !traveller.email?.trim() && !traveller.phone?.trim()) {
    missing.push("emailOrPhone");
  }
  return { complete: missing.length === 0, missing };
}

export function ageInYears(dateOfBirth: string, asOf: Date = new Date()): number | null {
  const dob = new Date(dateOfBirth);
  if (Number.isNaN(dob.getTime())) return null;
  let age = asOf.getFullYear() - dob.getFullYear();
  const monthDiff = asOf.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && asOf.getDate() < dob.getDate())) age -= 1;
  return age;
}

export function expectedTravellerTypeForAge(age: number): TravellerType {
  if (age < TRAVELLER_AGE_BANDS.INFANT_MAX_EXCLUSIVE) return TravellerType.INFANT;
  if (age < TRAVELLER_AGE_BANDS.CHILD_MAX_EXCLUSIVE) return TravellerType.CHILD;
  return TravellerType.ADULT;
}

export function isAgeConsistentWithType(type: TravellerType, dateOfBirth: string | null | undefined): boolean {
  if (!dateOfBirth) return true;
  const age = ageInYears(dateOfBirth);
  if (age === null || age < 0) return false;
  return expectedTravellerTypeForAge(age) === type;
}

export interface BookingTravellerReadiness {
  ready: boolean;
  travellerCount: number;
  hasLead: boolean;
  incompleteTravellers: { id: string; fullName: string; missing: string[] }[];
  errors: string[];
}

export function assessBookingTravellerReadiness(travellers: Traveller[]): BookingTravellerReadiness {
  const errors: string[] = [];
  if (travellers.length === 0) {
    errors.push("At least one traveller is required before confirmation");
  }
  const leads = travellers.filter((t) => t.isLeadTraveller);
  if (travellers.length > 0 && leads.length === 0) {
    errors.push("A lead traveller is required before confirmation");
  }
  if (leads.length > 1) {
    errors.push("Only one lead traveller is allowed");
  }

  const incompleteTravellers = travellers
    .map((t) => {
      const assessment = assessTravellerCompleteness(t);
      return assessment.complete
        ? null
        : { id: t.id, fullName: t.fullName, missing: assessment.missing };
    })
    .filter((x): x is { id: string; fullName: string; missing: string[] } => x !== null);

  if (incompleteTravellers.length > 0) {
    errors.push(
      `Incomplete traveller details: ${incompleteTravellers
        .map((t) => `${t.fullName} (${t.missing.join(", ")})`)
        .join("; ")}`
    );
  }

  return {
    ready: errors.length === 0,
    travellerCount: travellers.length,
    hasLead: leads.length === 1,
    incompleteTravellers,
    errors,
  };
}
