export interface PaginatedResult<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface EnquirySummary {
  id: string;
  name: string;
  email: string;
  status: string;
  type: string;
  createdAt: string;
}

export interface QuoteSummary {
  id: string;
  quoteNumber: string;
  title: string;
  status: string;
  createdAt: string;
}

export interface BookingSummary {
  id: string;
  bookingNumber: string;
  status: string;
  totalAmount: number;
  amountPaid: number;
  currency: string;
  createdAt: string;
}

export interface SystemHealthModule {
  name: string;
  status: string;
  latencyMs: number;
}

export interface SystemHealthResponse {
  status: string;
  modules: SystemHealthModule[];
  generatedAt: string;
}

export type ActivityKind = "enquiry" | "quote" | "booking";

export interface ActivityItem {
  id: string;
  kind: ActivityKind;
  title: string;
  subtitle: string;
  status: string;
  createdAt: string;
  meta?: string;
}

export interface DashboardKpis {
  totalRevenue: number;
  revenueVariance: number;
  activeBookings: number;
  newLeads: number;
  conversionRate: number;
  revenueCurrency: string;
}

export interface RevenueMonthPoint {
  month: string;
  label: string;
  amount: number;
}
