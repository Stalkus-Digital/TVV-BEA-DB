export const DocumentKind = {
  PASSPORT: "PASSPORT",
  VISA: "VISA",
  TICKET: "TICKET",
  INSURANCE: "INSURANCE",
} as const;

export type DocumentKind = (typeof DocumentKind)[keyof typeof DocumentKind];

/**
 * Voucher and Invoice are NOT DocumentKind values — they're first-class
 * structured entities (see booking-voucher.ts / booking-invoice.ts) with
 * their own generated data model, not a metadata+file record like a
 * passport scan. `fileUrl` stays null by construction — no blob storage is
 * wired in this project yet (per docs/02's Persistence Layer, still
 * unimplemented), same "reserved but inert" discipline used throughout.
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
  createdAt: string;
}
