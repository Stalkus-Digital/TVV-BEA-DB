import type { Enquiry, EnquiryListFilters } from "./types";

export function formatEnquiryDate(iso: string): string {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(iso));
}

export function relativeEnquiryDate(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diffMs / 60_000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return formatEnquiryDate(iso);
}

export function applyClientEnquiryFilters(
  items: Enquiry[],
  filters: Pick<EnquiryListFilters, "search" | "dateFrom" | "dateTo">
): Enquiry[] {
  let result = items;

  const query = filters.search?.trim().toLowerCase();
  if (query) {
    result = result.filter(
      (item) =>
        item.name.toLowerCase().includes(query) ||
        item.email.toLowerCase().includes(query) ||
        item.phone?.toLowerCase().includes(query) ||
        item.id.toLowerCase().includes(query) ||
        item.destinationSlug?.toLowerCase().includes(query) ||
        item.packageSlug?.toLowerCase().includes(query) ||
        item.hotelSlug?.toLowerCase().includes(query) ||
        item.activitySlug?.toLowerCase().includes(query)
    );
  }

  if (filters.dateFrom) {
    const from = new Date(filters.dateFrom).getTime();
    result = result.filter((item) => new Date(item.createdAt).getTime() >= from);
  }

  if (filters.dateTo) {
    const to = new Date(filters.dateTo);
    to.setHours(23, 59, 59, 999);
    result = result.filter((item) => new Date(item.createdAt).getTime() <= to.getTime());
  }

  return result;
}

export function paginateItems<T>(items: T[], page: number, pageSize: number) {
  const start = (page - 1) * pageSize;
  return {
    items: items.slice(start, start + pageSize),
    page,
    pageSize,
    total: items.length,
    totalPages: Math.max(1, Math.ceil(items.length / pageSize)),
  };
}

export function needsClientFiltering(filters: EnquiryListFilters): boolean {
  return Boolean(filters.search?.trim() || filters.dateFrom || filters.dateTo);
}

function humanizeSlug(slug: string): string {
  return slug
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function enquiryContextLabel(enquiry: Enquiry): string {
  if (enquiry.destinationSlug) return humanizeSlug(enquiry.destinationSlug);
  if (enquiry.packageSlug) return humanizeSlug(enquiry.packageSlug);
  if (enquiry.hotelSlug) return humanizeSlug(enquiry.hotelSlug);
  if (enquiry.activitySlug) return humanizeSlug(enquiry.activitySlug);
  const details = parseEnquiryMessage(enquiry.message);
  if (details.destination) return details.destination;
  if (details.bookingLabel) return details.bookingLabel;
  return "—";
}

/** Structured trip details stored in enquiry.message as JSON (website forms). */
export interface EnquiryMessageDetails {
  text?: string;
  destination?: string;
  tripType?: string;
  travelDates?: string;
  duration?: string;
  fromCity?: string;
  partySize?: string;
  guests?: number;
  guestCount?: number;
  budget?: string;
  marketingOk?: boolean;
  bookingLabel?: string;
  total?: number | string;
  startDate?: string;
}

export function parseEnquiryMessage(message: string | null | undefined): EnquiryMessageDetails {
  if (!message?.trim()) return {};
  try {
    const parsed = JSON.parse(message) as unknown;
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return parsed as EnquiryMessageDetails;
    }
  } catch {
    // plain text message from older leads
  }
  return { text: message };
}

export function enquiryDetailsSummary(enquiry: Enquiry): string[] {
  const d = parseEnquiryMessage(enquiry.message);
  const lines: string[] = [];
  if (d.destination) lines.push(d.destination);
  if (d.tripType) lines.push(d.tripType);
  const guests = d.guests ?? d.guestCount;
  if (guests) lines.push(`${guests} guests`);
  if (d.partySize && !guests) lines.push(d.partySize);
  if (d.travelDates || d.startDate) lines.push(String(d.travelDates || d.startDate));
  if (d.budget) lines.push(d.budget);
  if (d.total) lines.push(`Total: ${d.total}`);
  return lines;
}
