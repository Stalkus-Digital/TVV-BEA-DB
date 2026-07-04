import { isErr, ok, type Result } from "@/shared/types";
import { BaseService, type ServiceContext } from "@/shared/services";
import type { AppError } from "@/shared/errors";
import { BookingStatus, getBookingService, getInvoiceService, getVoucherService, type Booking } from "@/modules/booking";
import { getQuoteService, type Quote } from "@/modules/quote";
import { getUserHandler } from "@/modules/auth";
import type { CustomerAccount } from "../services/customer-profile.service";
import { CustomerProfileService } from "../services/customer-profile.service";
import type { NotificationRepository } from "../repositories/notification.repository";

const RECENT_LIMIT = 5;
const UPCOMING_TRIP_STATUSES: Booking["status"][] = [BookingStatus.CONFIRMED, BookingStatus.PARTIALLY_PAID, BookingStatus.PAID, BookingStatus.TICKETED];

export interface DashboardStatistics {
  totalQuotes: number;
  totalBookings: number;
  totalSpend: number;
  memberSince: string;
}

export interface DashboardBookingStatusCounts {
  draft: number;
  confirmed: number;
  partiallyPaid: number;
  paid: number;
  ticketed: number;
  completed: number;
  cancelled: number;
}

export interface CustomerDashboard {
  profile: CustomerAccount;
  upcomingTrips: Booking[];
  recentQuotes: Quote[];
  recentBookings: Booking[];
  bookingStatus: DashboardBookingStatusCounts;
  /** Placeholder — see `Notification` type docstring. Always accurate (a real, if always-zero-today, count), never a hardcoded literal. */
  unreadNotifications: number;
  documentCounts: { invoices: number; vouchers: number };
  statistics: DashboardStatistics;
}

const EMPTY_BOOKING_STATUS: DashboardBookingStatusCounts = {
  draft: 0,
  confirmed: 0,
  partiallyPaid: 0,
  paid: 0,
  ticketed: 0,
  completed: 0,
  cancelled: 0,
};

function tallyBookingStatus(bookings: Booking[]): DashboardBookingStatusCounts {
  const counts = { ...EMPTY_BOOKING_STATUS };
  for (const booking of bookings) {
    if (booking.status === BookingStatus.DRAFT) counts.draft++;
    else if (booking.status === BookingStatus.CONFIRMED) counts.confirmed++;
    else if (booking.status === BookingStatus.PARTIALLY_PAID) counts.partiallyPaid++;
    else if (booking.status === BookingStatus.PAID) counts.paid++;
    else if (booking.status === BookingStatus.TICKETED) counts.ticketed++;
    else if (booking.status === BookingStatus.COMPLETED) counts.completed++;
    else if (booking.status === BookingStatus.CANCELLED) counts.cancelled++;
  }
  return counts;
}

const MAX_BOOKINGS_SCANNED = 100;

/**
 * Aggregates every read this sprint's brief asked the dashboard to return.
 * `upcomingTrips` is a best-effort proxy — Booking has no explicit
 * "travel start date" field yet, so this uses non-terminal booking status
 * (confirmed/paid/ticketed, not draft/completed/cancelled) rather than
 * fabricating a date. `documentCounts` only counts invoices/vouchers, not
 * the placeholder ticket/insurance/passport/visa kinds — see
 * `/api/me/documents` for the full breakdown.
 */
export class DashboardService extends BaseService {
  constructor(
    context: ServiceContext,
    private readonly profileService: CustomerProfileService,
    private readonly notifications: NotificationRepository
  ) {
    super(context);
  }

  async getDashboard(userId: string): Promise<Result<CustomerDashboard, AppError>> {
    const account = await this.profileService.getAccount(userId);
    if (isErr(account)) return account;

    const [bookings, quotes, unread, user] = await Promise.all([
      getBookingService().list({ customerId: userId, page: 1, pageSize: MAX_BOOKINGS_SCANNED }),
      getQuoteService().list({ customerId: userId, page: 1, pageSize: RECENT_LIMIT }),
      this.notifications.countUnread(userId),
      getUserHandler(userId),
    ]);
    if (isErr(bookings)) return bookings;
    if (isErr(quotes)) return quotes;
    if (isErr(unread)) return unread;
    if (isErr(user)) return user;

    const allBookings = bookings.value.items;
    const upcomingTrips = allBookings.filter((b) => UPCOMING_TRIP_STATUSES.includes(b.status));
    const recentBookings = [...allBookings].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, RECENT_LIMIT);
    const totalSpend = allBookings.reduce((sum, b) => sum + b.amountPaid, 0);

    const invoiceVoucherCounts = await this.countInvoicesAndVouchers(allBookings);

    return ok({
      profile: account.value,
      upcomingTrips,
      recentQuotes: quotes.value.items,
      recentBookings,
      bookingStatus: tallyBookingStatus(allBookings),
      unreadNotifications: unread.value,
      documentCounts: invoiceVoucherCounts,
      statistics: {
        totalQuotes: quotes.value.total,
        totalBookings: bookings.value.total,
        totalSpend,
        memberSince: user.value.createdAt,
      },
    });
  }

  private async countInvoicesAndVouchers(bookings: Booking[]): Promise<{ invoices: number; vouchers: number }> {
    let invoices = 0;
    let vouchers = 0;
    for (const booking of bookings) {
      const [invoiceResult, voucherResult] = await Promise.all([
        getInvoiceService().listByBooking(booking.id),
        getVoucherService().listByBooking(booking.id),
      ]);
      if (invoiceResult.ok) invoices += invoiceResult.value.length;
      if (voucherResult.ok) vouchers += voucherResult.value.length;
    }
    return { invoices, vouchers };
  }
}
