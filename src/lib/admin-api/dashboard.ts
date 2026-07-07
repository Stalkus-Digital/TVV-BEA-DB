import { adminApiClient } from "./client";
import { adminEndpoints } from "./endpoints";
import type {
  ActivityItem,
  BookingSummary,
  DashboardKpis,
  EnquirySummary,
  PaginatedResult,
  QuoteSummary,
  RevenueMonthPoint,
  SystemHealthResponse,
} from "./types";

async function fetchTotal(path: string, params?: Record<string, string | number | boolean | undefined>): Promise<number> {
  const result = await adminApiClient.get<PaginatedResult<unknown>>(path, { params: { page: 1, pageSize: 1, ...params } });
  return result?.total ?? 0;
}

async function fetchAllPages<T>(
  path: string,
  params?: Record<string, string | number | boolean | undefined>,
  pageSize = 100
): Promise<T[]> {
  const items: T[] = [];
  let page = 1;
  let totalPages = 1;

  while (page <= totalPages) {
    const result = await adminApiClient.get<PaginatedResult<T>>(path, { params: { ...params, page, pageSize } });
    if (!result) break;
    items.push(...result.items);
    totalPages = result.totalPages;
    page += 1;
  }

  return items;
}

async function countActiveDestinations(): Promise<number> {
  const destinations = await fetchAllPages<{ status: string }>(adminEndpoints.destinations);
  return destinations.filter((d) => d.status === "ACTIVE").length;
}

async function sumBookingRevenue(): Promise<{ amount: number; currency: string }> {
  const bookings = await fetchAllPages<BookingSummary>(adminEndpoints.bookings);
  const amount = bookings.reduce((sum, booking) => sum + (booking.amountPaid ?? 0), 0);
  const currency = bookings.find((b) => b.currency)?.currency ?? "INR";
  return { amount, currency };
}

export async function fetchDashboardKpis(): Promise<DashboardKpis> {
  const result = await adminApiClient.get<{ data: DashboardKpis }>("/dashboard/kpis");
  if (!result || !result.data) {
    throw new Error("Failed to load KPIs");
  }
  return result.data;
}

export async function fetchSystemHealth(): Promise<SystemHealthResponse> {
  const result = await adminApiClient.get<SystemHealthResponse>(adminEndpoints.systemHealth, { noAuth: true });
  if (!result) throw new Error("System health unavailable");
  return result;
}

function toActivityItems(
  enquiries: EnquirySummary[],
  quotes: QuoteSummary[],
  bookings: BookingSummary[]
): ActivityItem[] {
  const enquiryItems: ActivityItem[] = enquiries.map((item) => ({
    id: item.id,
    kind: "enquiry",
    title: item.name,
    subtitle: item.email,
    status: item.status,
    createdAt: item.createdAt,
    meta: item.type,
  }));

  const quoteItems: ActivityItem[] = quotes.map((item) => ({
    id: item.id,
    kind: "quote",
    title: item.title,
    subtitle: item.quoteNumber,
    status: item.status,
    createdAt: item.createdAt,
  }));

  const bookingItems: ActivityItem[] = bookings.map((item) => ({
    id: item.id,
    kind: "booking",
    title: item.bookingNumber,
    subtitle: `${item.currency} ${item.totalAmount.toLocaleString("en-IN")}`,
    status: item.status,
    createdAt: item.createdAt,
  }));

  return [...enquiryItems, ...quoteItems, ...bookingItems]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 8);
}

export async function fetchRecentActivity(): Promise<ActivityItem[]> {
  const [enquiries, quotes, bookings] = await Promise.all([
    adminApiClient.get<PaginatedResult<EnquirySummary>>(adminEndpoints.enquiries, { params: { page: 1, pageSize: 5 } }),
    adminApiClient.get<PaginatedResult<QuoteSummary>>(adminEndpoints.quotes, { params: { page: 1, pageSize: 5 } }),
    adminApiClient.get<PaginatedResult<BookingSummary>>(adminEndpoints.bookings, { params: { page: 1, pageSize: 5 } }),
  ]);

  return toActivityItems(enquiries?.items ?? [], quotes?.items ?? [], bookings?.items ?? []);
}

const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export async function fetchRevenueChart(): Promise<RevenueMonthPoint[]> {
  const bookings = await fetchAllPages<BookingSummary>(adminEndpoints.bookings);
  const buckets = new Map<string, RevenueMonthPoint>();

  for (const booking of bookings) {
    if (!booking.amountPaid || booking.amountPaid <= 0) continue;
    const date = new Date(booking.createdAt);
    const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    const existing = buckets.get(month) ?? {
      month,
      label: `${MONTH_LABELS[date.getMonth()]} ${date.getFullYear()}`,
      amount: 0,
    };
    existing.amount += booking.amountPaid;
    buckets.set(month, existing);
  }

  return [...buckets.values()].sort((a, b) => a.month.localeCompare(b.month)).slice(-6);
}
