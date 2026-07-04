export const EnquiryType = {
  GENERAL: "GENERAL",
  PACKAGE: "PACKAGE",
  DESTINATION: "DESTINATION",
  CALLBACK: "CALLBACK",
  CORPORATE: "CORPORATE",
} as const;

export type EnquiryType = (typeof EnquiryType)[keyof typeof EnquiryType];

export const EnquiryStatus = {
  NEW: "NEW",
  CONTACTED: "CONTACTED",
  CONVERTED: "CONVERTED",
  CLOSED: "CLOSED",
} as const;

export type EnquiryStatus = (typeof EnquiryStatus)[keyof typeof EnquiryStatus];

/**
 * Lead capture for the public `POST /api/enquiries` endpoint — raw,
 * unqualified interest, stored for a future CRM integration (not built
 * this sprint). Never the same thing as a Quote: a Quote is a priced
 * itinerary a sales agent has already built.
 */
export interface Enquiry {
  id: string;
  type: EnquiryType;
  name: string;
  email: string;
  phone: string | null;
  message: string | null;
  destinationSlug: string | null;
  packageSlug: string | null;
  /** Set only when the submitter was an authenticated customer — derived server-side, never accepted from the request body. */
  customerId: string | null;
  source: string | null;
  status: EnquiryStatus;
  /** Admin/agent this lead is assigned to — null when unassigned. */
  assignedToUserId: string | null;
  createdAt: string;
  updatedAt: string;
}

/** A single note in an enquiry's activity trail — admin-authored only. */
export interface EnquiryNote {
  id: string;
  enquiryId: string;
  authorUserId: string | null;
  body: string;
  createdAt: string;
}
