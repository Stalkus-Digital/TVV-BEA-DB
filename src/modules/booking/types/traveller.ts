export const TravellerType = {
  ADULT: "ADULT",
  CHILD: "CHILD",
  INFANT: "INFANT",
} as const;

export type TravellerType = (typeof TravellerType)[keyof typeof TravellerType];

export const Gender = {
  MALE: "MALE",
  FEMALE: "FEMALE",
  OTHER: "OTHER",
} as const;

export type Gender = (typeof Gender)[keyof typeof Gender];

export interface EmergencyContact {
  name: string;
  phone: string;
  relation: string | null;
}

export interface Traveller {
  id: string;
  bookingId: string;
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
  createdAt: string;
  updatedAt: string;
}
