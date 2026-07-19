import type {
  CustomerBookingRecord,
  CustomerEnquiryRecord,
  CustomerListFilters,
  CustomerQuoteRecord,
  CustomerRelationshipBundle,
  CustomerSortField,
  CustomerSummary,
  CustomerTimelineEvent,
  PublicUser,
  SortDirection,
} from "./types";

export function formatCustomerDate(iso: string): string {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(iso));
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function enquiryMatchesUser(enquiry: CustomerEnquiryRecord, user: Pick<PublicUser, "id" | "email">): boolean {
  if (enquiry.customerId === user.id) return true;
  return normalizeEmail(enquiry.email) === normalizeEmail(user.email);
}

export function quoteMatchesUser(quote: CustomerQuoteRecord, user: Pick<PublicUser, "id" | "email">): boolean {
  if (quote.customerId === user.id) return true;
  const leadEmail = quote.travelerDetails?.leadTraveler.email;
  return leadEmail ? normalizeEmail(leadEmail) === normalizeEmail(user.email) : false;
}

export function bookingMatchesUser(booking: CustomerBookingRecord, user: Pick<PublicUser, "id">): boolean {
  return booking.customerId === user.id;
}

export function getUserEnquiries(
  user: Pick<PublicUser, "id" | "email">,
  enquiries: CustomerEnquiryRecord[]
): CustomerEnquiryRecord[] {
  return enquiries.filter((item) => enquiryMatchesUser(item, user));
}

export function getUserQuotes(
  user: Pick<PublicUser, "id" | "email">,
  quotes: CustomerQuoteRecord[]
): CustomerQuoteRecord[] {
  return quotes.filter((item) => quoteMatchesUser(item, user));
}

export function getUserBookings(
  user: Pick<PublicUser, "id">,
  bookings: CustomerBookingRecord[]
): CustomerBookingRecord[] {
  return bookings.filter((item) => bookingMatchesUser(item, user));
}

function latestIso(values: Array<string | null | undefined>): string | null {
  const timestamps = values.filter(Boolean).map((value) => new Date(value!).getTime());
  if (timestamps.length === 0) return null;
  return new Date(Math.max(...timestamps)).toISOString();
}

function derivePhone(user: Pick<PublicUser, "id" | "email">, enquiries: CustomerEnquiryRecord[]): string | null {
  const matched = getUserEnquiries(user, enquiries)
    .filter((item) => item.phone)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  return matched[0]?.phone ?? null;
}

export function buildCustomerSummary(
  user: PublicUser,
  bundle: CustomerRelationshipBundle
): CustomerSummary {
  const enquiries = getUserEnquiries(user, bundle.enquiries);
  const quotes = getUserQuotes(user, bundle.quotes);
  const bookings = getUserBookings(user, bundle.bookings);

  const lastActivityAt = latestIso([
    user.lastLoginAt,
    user.updatedAt,
    ...enquiries.flatMap((item) => [item.createdAt, item.updatedAt]),
    ...quotes.flatMap((item) => [item.createdAt, item.updatedAt]),
    ...bookings.flatMap((item) => [item.createdAt, item.updatedAt]),
  ]);

  return {
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    isActive: user.isActive,
    emailVerified: Boolean(user.emailVerifiedAt),
    lastLoginAt: user.lastLoginAt,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    phone: derivePhone(user, bundle.enquiries),
    role: null,
    lastActivityAt,
    enquiryCount: enquiries.length,
    quoteCount: quotes.length,
    bookingCount: bookings.length,
  };
}

export function buildCustomerSummaries(users: PublicUser[], bundle: CustomerRelationshipBundle): CustomerSummary[] {
  return users.map((user) => buildCustomerSummary(user, bundle));
}

export function applyCustomerSearch(items: CustomerSummary[], search?: string): CustomerSummary[] {
  const query = search?.trim().toLowerCase();
  if (!query) return items;

  return items.filter(
    (item) =>
      item.fullName.toLowerCase().includes(query) ||
      item.email.toLowerCase().includes(query) ||
      item.phone?.toLowerCase().includes(query) ||
      item.id.toLowerCase().includes(query)
  );
}

export function applyEmailVerifiedFilter(
  items: CustomerSummary[],
  emailVerified?: CustomerListFilters["emailVerified"]
): CustomerSummary[] {
  if (!emailVerified || emailVerified === "all") return items;
  if (emailVerified === "verified") return items.filter((item) => item.emailVerified);
  return items.filter((item) => !item.emailVerified);
}

function sortValue(item: CustomerSummary, field: CustomerSortField): string | number {
  switch (field) {
    case "name":
      return item.fullName.toLowerCase();
    case "email":
      return item.email.toLowerCase();
    case "createdAt":
      return new Date(item.createdAt).getTime();
    case "lastActivity":
      return item.lastActivityAt ? new Date(item.lastActivityAt).getTime() : 0;
    case "enquiryCount":
      return item.enquiryCount;
    case "quoteCount":
      return item.quoteCount;
    case "bookingCount":
      return item.bookingCount;
  }
}

export function sortCustomers(
  items: CustomerSummary[],
  sortBy: CustomerSortField = "lastActivity",
  sortDir: SortDirection = "desc"
): CustomerSummary[] {
  const sorted = [...items].sort((a, b) => {
    const left = sortValue(a, sortBy);
    const right = sortValue(b, sortBy);
    if (left < right) return sortDir === "asc" ? -1 : 1;
    if (left > right) return sortDir === "asc" ? 1 : -1;
    return 0;
  });
  return sorted;
}

export function paginateCustomers(items: CustomerSummary[], page: number, pageSize: number) {
  const start = (page - 1) * pageSize;
  return {
    items: items.slice(start, start + pageSize),
    page,
    pageSize,
    total: items.length,
    totalPages: Math.max(1, Math.ceil(items.length / pageSize)),
  };
}

export function buildCustomerList(
  users: PublicUser[],
  bundle: CustomerRelationshipBundle,
  filters: CustomerListFilters
) {
  const summaries = buildCustomerSummaries(users, bundle);
  const searched = applyCustomerSearch(summaries, filters.search);
  const verifiedFiltered = applyEmailVerifiedFilter(searched, filters.emailVerified);
  const sorted = sortCustomers(verifiedFiltered, filters.sortBy ?? "lastActivity", filters.sortDir ?? "desc");
  return paginateCustomers(sorted, filters.page ?? 1, filters.pageSize ?? 20);
}

export function buildCustomerTimeline(
  user: PublicUser,
  bundle: CustomerRelationshipBundle
): CustomerTimelineEvent[] {
  const enquiries = getUserEnquiries(user, bundle.enquiries);
  const quotes = getUserQuotes(user, bundle.quotes);
  const bookings = getUserBookings(user, bundle.bookings);

  const events: CustomerTimelineEvent[] = [
    {
      id: `account-${user.id}`,
      kind: "account",
      title: "Account registered",
      subtitle: user.email,
      status: user.isActive ? "ACTIVE" : "INACTIVE",
      createdAt: user.createdAt,
    },
    ...enquiries.map((item) => ({
      id: item.id,
      kind: "enquiry" as const,
      title: item.name,
      subtitle: item.type,
      status: item.status,
      createdAt: item.createdAt,
    })),
    ...quotes.map((item) => ({
      id: item.id,
      kind: "quote" as const,
      title: item.title,
      subtitle: item.quoteNumber,
      status: item.status,
      createdAt: item.createdAt,
    })),
    ...bookings.map((item) => ({
      id: item.id,
      kind: "booking" as const,
      title: item.bookingNumber,
      subtitle: `${item.currency} ${item.totalAmount.toLocaleString("en-IN")}`,
      status: item.status,
      createdAt: item.createdAt,
    })),
  ];

  return events.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}
