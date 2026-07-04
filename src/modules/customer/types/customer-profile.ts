export interface EmergencyContact {
  name: string;
  phone: string;
  relation: string | null;
}

/**
 * Supplements Auth's `User` (email/passwordHash/fullName) with the fields
 * a self-service travel profile actually needs. One row per `userId`,
 * created lazily on first profile write — never on registration, since
 * most of these fields are optional and a customer may never fill them in.
 */
export interface CustomerProfile {
  id: string;
  userId: string;
  phone: string | null;
  dateOfBirth: string | null;
  nationality: string | null;
  passportNumber: string | null;
  passportExpiry: string | null;
  passportCountry: string | null;
  emergencyContact: EmergencyContact | null;
  /** Free-form (seat/meal/communication/etc.) — no fixed shape yet. */
  preferences: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
}
