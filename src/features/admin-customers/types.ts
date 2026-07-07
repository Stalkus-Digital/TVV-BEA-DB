export interface PublicUser {
  id: string;
  email: string;
  fullName: string;
  isActive: boolean;
  failedLoginAttempts: number;
  lockedUntil: string | null;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerSummary {
  id: string;
  email: string;
  fullName: string;
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
  phone: string | null;
  /** Null when role API is unavailable — not fabricated. */
  role: string | null;
  lastActivityAt: string | null;
  enquiryCount: number;
  quoteCount: number;
  bookingCount: number;
}

export type CustomerSortField =
  | "name"
  | "email"
  | "createdAt"
  | "lastActivity"
  | "enquiryCount"
  | "quoteCount"
  | "bookingCount";

export type SortDirection = "asc" | "desc";

export interface CustomerListFilters {
  search?: string;
  sortBy?: CustomerSortField;
  sortDir?: SortDirection;
  page?: number;
  pageSize?: number;
}

export interface PaginatedCustomers {
  items: CustomerSummary[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface CustomerEnquiryRecord {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  status: string;
  type: string;
  customerId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerQuoteRecord {
  id: string;
  quoteNumber: string;
  title: string;
  status: string;
  customerId: string | null;
  createdAt: string;
  updatedAt: string;
  travelerDetails?: {
    leadTraveler: { email: string };
  };
}

export interface CustomerBookingRecord {
  id: string;
  bookingNumber: string;
  status: string;
  customerId: string | null;
  totalAmount: number;
  currency: string;
  amountPaid: number;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerRelationshipBundle {
  enquiries: CustomerEnquiryRecord[];
  quotes: CustomerQuoteRecord[];
  bookings: CustomerBookingRecord[];
}

export interface CustomerTimelineEvent {
  id: string;
  kind: "enquiry" | "quote" | "booking" | "account";
  title: string;
  subtitle: string;
  status: string;
  createdAt: string;
}
