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
        item.id.toLowerCase().includes(query)
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

export function enquiryContextLabel(enquiry: Enquiry): string {
  if (enquiry.destinationSlug) return enquiry.destinationSlug;
  if (enquiry.packageSlug) return enquiry.packageSlug;
  if (enquiry.source) return enquiry.source;
  return "—";
}
