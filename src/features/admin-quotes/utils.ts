import type { CustomerRelationshipBundle, PublicUser } from "@/features/admin-customers/types";
import type {
  Quote,
  QuoteListFilters,
  QuoteListRow,
  QuoteTimelineEvent,
  QuoteVersion,
} from "./types";

function quoteMatchesCustomer(user: Pick<PublicUser, "id" | "email">, quote: Quote): boolean {
  if (quote.customerId === user.id) return true;
  return quote.travelerDetails.leadTraveler.email.trim().toLowerCase() === user.email.trim().toLowerCase();
}

export function formatQuoteDate(iso: string): string {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(iso));
}

export function formatQuoteMoney(amount: number | null | undefined, currency: string): string {
  if (amount == null) return "—";
  return `${currency} ${amount.toLocaleString("en-IN")}`;
}

export function resolveCustomerLabel(
  quote: Pick<Quote, "customerId" | "travelerDetails">,
  usersById: Map<string, PublicUser>
): string {
  if (quote.customerId) {
    const user = usersById.get(quote.customerId);
    if (user) return user.fullName || user.email;
  }
  return quote.travelerDetails.leadTraveler.name || quote.travelerDetails.leadTraveler.email;
}

export function resolveCustomerUserId(
  quote: Pick<Quote, "customerId" | "travelerDetails">,
  users: PublicUser[]
): string | null {
  if (quote.customerId) return quote.customerId;
  const email = quote.travelerDetails.leadTraveler.email.trim().toLowerCase();
  const match = users.find((user) => user.email.trim().toLowerCase() === email);
  return match?.id ?? null;
}

export function applyQuoteSearch(items: Quote[], search?: string): Quote[] {
  const query = search?.trim().toLowerCase();
  if (!query) return items;

  return items.filter(
    (item) =>
      item.quoteNumber.toLowerCase().includes(query) ||
      item.title.toLowerCase().includes(query) ||
      item.travelerDetails.leadTraveler.name.toLowerCase().includes(query) ||
      item.travelerDetails.leadTraveler.email.toLowerCase().includes(query) ||
      item.id.toLowerCase().includes(query)
  );
}

export function applyQuoteCustomerFilter(items: Quote[], customerId?: string, users: PublicUser[] = []): Quote[] {
  if (!customerId) return items;
  const user = users.find((entry) => entry.id === customerId);
  if (!user) return items.filter((item) => item.customerId === customerId);

  return items.filter((item) => quoteMatchesCustomer(user, item));
}

export function applyQuoteDateFilter(
  items: Quote[],
  dateFrom?: string,
  dateTo?: string
): Quote[] {
  let result = items;
  if (dateFrom) {
    const from = new Date(dateFrom).getTime();
    result = result.filter((item) => new Date(item.createdAt).getTime() >= from);
  }
  if (dateTo) {
    const to = new Date(dateTo);
    to.setHours(23, 59, 59, 999);
    result = result.filter((item) => new Date(item.createdAt).getTime() <= to.getTime());
  }
  return result;
}

export function sortQuotes(
  items: QuoteListRow[],
  sortBy: QuoteListFilters["sortBy"] = "createdAt",
  sortDir: QuoteListFilters["sortDir"] = "desc"
): QuoteListRow[] {
  const dir = sortDir === "asc" ? 1 : -1;
  return [...items].sort((a, b) => {
    let left: string | number = 0;
    let right: string | number = 0;
    switch (sortBy) {
      case "title":
        left = a.title.toLowerCase();
        right = b.title.toLowerCase();
        break;
      case "status":
        left = a.status;
        right = b.status;
        break;
      case "validTo":
        left = new Date(a.validTo).getTime();
        right = new Date(b.validTo).getTime();
        break;
      case "totalAmount":
        left = a.totalAmount ?? -1;
        right = b.totalAmount ?? -1;
        break;
      default:
        left = new Date(a.createdAt).getTime();
        right = new Date(b.createdAt).getTime();
    }
    if (left < right) return -1 * dir;
    if (left > right) return 1 * dir;
    return 0;
  });
}

export function paginateQuotes<T>(items: T[], page: number, pageSize: number) {
  const start = (page - 1) * pageSize;
  return {
    items: items.slice(start, start + pageSize),
    page,
    pageSize,
    total: items.length,
    totalPages: Math.max(1, Math.ceil(items.length / pageSize)),
  };
}

export function needsClientQuoteFiltering(filters: QuoteListFilters): boolean {
  return Boolean(
    filters.search?.trim() ||
      filters.dateFrom ||
      filters.dateTo ||
      filters.customerId ||
      (filters.sortBy && filters.sortBy !== "createdAt") ||
      filters.sortDir === "asc"
  );
}

export function buildQuoteTimeline(quote: Quote, versions: QuoteVersion[]): QuoteTimelineEvent[] {
  const events: QuoteTimelineEvent[] = [
    {
      id: `${quote.id}-created`,
      kind: "created",
      title: "Quote created",
      subtitle: quote.quoteNumber,
      createdAt: quote.createdAt,
    },
  ];

  for (const version of versions) {
    events.push({
      id: version.id,
      kind: "version",
      title: `Version ${version.versionNumber} sent`,
      subtitle: version.changeNote ?? "Snapshot frozen",
      createdAt: version.createdAt,
    });
  }

  if (quote.approvedAt) {
    events.push({
      id: `${quote.id}-approved`,
      kind: "approved",
      title: "Quote approved",
      subtitle: quote.quoteNumber,
      createdAt: quote.approvedAt,
    });
  }

  if (quote.rejectedAt) {
    events.push({
      id: `${quote.id}-rejected`,
      kind: "rejected",
      title: "Quote rejected",
      subtitle: quote.rejectionReason ?? "No reason recorded",
      createdAt: quote.rejectedAt,
    });
  }

  if (quote.convertedAt) {
    events.push({
      id: `${quote.id}-converted`,
      kind: "converted",
      title: "Converted to booking handoff",
      subtitle: quote.convertedBookingId ? `Booking ${quote.convertedBookingId}` : "Booking ID not linked yet",
      createdAt: quote.convertedAt,
    });
  }

  if (quote.updatedAt !== quote.createdAt) {
    events.push({
      id: `${quote.id}-updated`,
      kind: "updated",
      title: "Quote updated",
      subtitle: `Status: ${quote.status}`,
      createdAt: quote.updatedAt,
    });
  }

  return events.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function getRelatedBookingsForQuote(
  quote: Quote,
  bundle: CustomerRelationshipBundle | undefined,
  users: PublicUser[]
) {
  if (!bundle) return [];
  const userId = resolveCustomerUserId(quote, users);
  if (!userId) return [];
  return bundle.bookings.filter((booking) => booking.customerId === userId);
}

export function getRelatedEnquiriesForQuote(
  quote: Quote,
  bundle: CustomerRelationshipBundle | undefined,
  users: PublicUser[]
) {
  if (!bundle) return [];
  const userId = resolveCustomerUserId(quote, users);
  if (!userId) {
    const email = quote.travelerDetails.leadTraveler.email.trim().toLowerCase();
    return bundle.enquiries.filter((item) => item.email.trim().toLowerCase() === email);
  }
  const user = users.find((entry) => entry.id === userId);
  if (!user) return [];
  return bundle.enquiries.filter(
    (item) => item.customerId === userId || item.email.trim().toLowerCase() === user.email.trim().toLowerCase()
  );
}
