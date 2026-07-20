export const DocumentKind = {
  PASSPORT: "PASSPORT",
  VISA: "VISA",
  NATIONAL_ID: "NATIONAL_ID",
  OTHER: "OTHER",
  /** Retained for customer-portal / legacy records */
  TICKET: "TICKET",
  INSURANCE: "INSURANCE",
} as const;

export type DocumentKind = (typeof DocumentKind)[keyof typeof DocumentKind];

export const DocumentUploadStatus = {
  UPLOADED: "UPLOADED",
  METADATA: "METADATA",
  MISSING: "MISSING",
} as const;

export type DocumentUploadStatus = (typeof DocumentUploadStatus)[keyof typeof DocumentUploadStatus];

export const DocumentVerificationStatus = {
  PENDING: "PENDING",
  VERIFIED: "VERIFIED",
  REJECTED: "REJECTED",
} as const;

export type DocumentVerificationStatus =
  (typeof DocumentVerificationStatus)[keyof typeof DocumentVerificationStatus];

/**
 * Voucher and Invoice are NOT DocumentKind values — they're first-class
 * structured entities. fileUrl may stay null when only metadata is recorded
 * (blob storage not fully wired).
 */
export interface PassengerDocument {
  id: string;
  bookingId: string;
  travellerId: string | null;
  kind: DocumentKind;
  fileUrl: string | null;
  fileName: string | null;
  issuedAt: string | null;
  expiresAt: string | null;
  notes: string | null;
  verificationStatus: DocumentVerificationStatus;
  createdAt: string;
  /** Derived — not persisted */
  uploadStatus?: DocumentUploadStatus;
  /** Derived — not persisted */
  isExpired?: boolean;
}

export function deriveDocumentUploadStatus(
  doc: Pick<PassengerDocument, "fileUrl" | "fileName">
): DocumentUploadStatus {
  if (doc.fileUrl) return DocumentUploadStatus.UPLOADED;
  if (doc.fileName) return DocumentUploadStatus.METADATA;
  return DocumentUploadStatus.MISSING;
}

export function isDocumentExpired(expiresAt: string | null, asOf: Date = new Date()): boolean {
  if (!expiresAt) return false;
  const exp = new Date(expiresAt);
  if (Number.isNaN(exp.getTime())) return false;
  return exp.getTime() < asOf.getTime();
}

export function enrichPassengerDocument(doc: PassengerDocument): PassengerDocument {
  return {
    ...doc,
    verificationStatus: doc.verificationStatus ?? DocumentVerificationStatus.PENDING,
    uploadStatus: deriveDocumentUploadStatus(doc),
    isExpired: isDocumentExpired(doc.expiresAt),
  };
}

/** Soft operational warnings — passport expected per traveller when nationality set. */
export function missingDocumentWarnings(
  travellers: { id: string; fullName: string; visaRequired: boolean }[],
  documents: PassengerDocument[]
): string[] {
  const warnings: string[] = [];
  for (const traveller of travellers) {
    const docs = documents.filter((d) => d.travellerId === traveller.id);
    const hasPassport = docs.some((d) => d.kind === DocumentKind.PASSPORT);
    if (!hasPassport) {
      warnings.push(`Missing passport record for ${traveller.fullName}`);
    }
    if (traveller.visaRequired) {
      const hasVisa = docs.some((d) => d.kind === DocumentKind.VISA);
      if (!hasVisa) {
        warnings.push(`Missing visa record for ${traveller.fullName} (visa required)`);
      }
    }
  }
  for (const doc of documents) {
    if (isDocumentExpired(doc.expiresAt)) {
      warnings.push(`${doc.kind} document expired${doc.fileName ? ` (${doc.fileName})` : ""}`);
    }
  }
  return warnings;
}
