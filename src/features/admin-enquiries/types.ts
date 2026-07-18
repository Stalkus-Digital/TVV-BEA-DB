export const EnquiryType = {
  GENERAL: "GENERAL",
  PACKAGE: "PACKAGE",
  DESTINATION: "DESTINATION",
  HOTEL: "HOTEL",
  ACTIVITY: "ACTIVITY",
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

export interface Enquiry {
  id: string;
  type: EnquiryType;
  name: string;
  email: string;
  phone: string | null;
  message: string | null;
  destinationSlug: string | null;
  packageSlug: string | null;
  hotelSlug: string | null;
  activitySlug: string | null;
  customerId: string | null;
  source: string | null;
  status: EnquiryStatus;
  assignedToUserId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface EnquiryNote {
  id: string;
  enquiryId: string;
  authorUserId: string | null;
  body: string;
  createdAt: string;
}

export interface PaginatedEnquiries {
  items: Enquiry[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface StaffUser {
  id: string;
  email: string;
  fullName: string;
  isActive: boolean;
}

/** Server-supported filters plus client-only search/date. */
export interface EnquiryListFilters {
  status?: EnquiryStatus;
  type?: EnquiryType;
  assignedToUserId?: string;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  pageSize?: number;
}
