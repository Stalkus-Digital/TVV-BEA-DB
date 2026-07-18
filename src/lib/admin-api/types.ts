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

export type DashboardKpiIcon =
  | "package"
  | "building2"
  | "bedDouble"
  | "ship"
  | "plane"
  | "activity"
  | "mapPin"
  | "calendar"
  | "hotel"
  | "compass"
  | "creditCard"
  | "percent"
  | "bookOpen"
  | "layoutTemplate"
  | "inbox"
  | "messageSquareQuote"
  | "fileText";

export interface DashboardKpiCard {
  id: string;
  title: string;
  value: string;
  hint: string;
  icon: DashboardKpiIcon;
  numericValue: number | null;
}

export interface DashboardKpiSection {
  id: string;
  title: string;
  description: string;
  cards: DashboardKpiCard[];
}

export interface DashboardKpis {
  pageTitle: string;
  pageDescription: string;
  revenueCurrency: string;
  revenueVariance: number;
  totalRevenue: number;
  sections: DashboardKpiSection[];
  revenueChart: RevenueMonthPoint[];
}

export interface RevenueMonthPoint {
  month: string;
  label: string;
  amount: number;
}
