import { prisma } from "@/shared/database/prisma-client";
import { SupplierConfigService } from "@/modules/supplier/services/supplier-config.service";

const REVENUE_STATUSES = ["CONFIRMED", "PAID", "PARTIALLY_PAID", "TICKETED", "COMPLETED"];
const ACTIVE_BOOKING_STATUSES = ["PENDING", "CONFIRMED", "PARTIALLY_PAID"];
const NOT_ARCHIVED = { not: "ARCHIVED" } as const;

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

export interface RevenueMonthPoint {
  month: string;
  label: string;
  amount: number;
}

export interface ManagementDashboardKpis {
  pageTitle: string;
  pageDescription: string;
  revenueCurrency: string;
  revenueVariance: number;
  totalRevenue: number;
  sections: DashboardKpiSection[];
  revenueChart: RevenueMonthPoint[];
}

function roomCountFromDetails(details: unknown): number {
  if (!details || typeof details !== "object") return 0;
  const rec = details as Record<string, unknown>;
  if (Array.isArray(rec.roomTypes)) return rec.roomTypes.length;
  if (typeof rec.rooms === "number" && Number.isFinite(rec.rooms) && rec.rooms > 0) {
    return Math.floor(rec.rooms);
  }
  return 0;
}

function isTripjackHotelDetails(details: unknown): boolean {
  if (!details || typeof details !== "object") return false;
  const rec = details as Record<string, unknown>;
  const markers = [rec.supplier, rec.source, rec.provider, rec.vendor, rec.sourceType];
  for (const marker of markers) {
    if (typeof marker === "string" && marker.toLowerCase().includes("tripjack")) return true;
  }
  if (rec.tripjackHotelId != null || rec.tripJackHotelId != null || rec.tjHotelId != null) return true;
  return false;
}

function formatCount(value: number): string {
  return value.toLocaleString("en-IN");
}

function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}

const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export class ManagementDashboardService {
  async getKpis(): Promise<ManagementDashboardKpis> {
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const previousMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
    const chartStart = new Date(now.getFullYear(), now.getMonth() - 5, 1);

    const tripjackEnabled = SupplierConfigService.getInstance().get("tripjackEnabled");

    const [
      holidayPackages,
      hotels,
      hotelRows,
      ferry,
      flights,
      activities,
      destinations,
      totalBookings,
      activeBookings,
      revenueResult,
      currentMonthRevResult,
      previousMonthRevResult,
      revenueBookingCount,
      blogs,
      blogsPublished,
      landingPages,
      newLeads,
      totalEnquiries,
      currencySample,
      revenueBookingsForChart,
      tripjackSupplier,
    ] = await Promise.all([
      prisma.package.count({ where: { status: NOT_ARCHIVED } }),
      prisma.inventoryItem.count({ where: { kind: "HOTEL", status: NOT_ARCHIVED } }),
      prisma.inventoryItem.findMany({
        where: { kind: "HOTEL", status: NOT_ARCHIVED },
        select: { details: true },
      }),
      prisma.ferryRoute.count(),
      prisma.inventoryItem.count({ where: { kind: "FLIGHT", status: NOT_ARCHIVED } }),
      prisma.inventoryItem.count({ where: { kind: "ACTIVITY", status: NOT_ARCHIVED } }),
      prisma.destination.count({ where: { status: NOT_ARCHIVED } }),
      prisma.booking.count(),
      prisma.booking.count({ where: { status: { in: ACTIVE_BOOKING_STATUSES } } }),
      prisma.booking.aggregate({
        _sum: { totalAmount: true },
        where: { status: { in: REVENUE_STATUSES } },
      }),
      prisma.booking.aggregate({
        _sum: { totalAmount: true },
        where: {
          status: { in: REVENUE_STATUSES },
          createdAt: { gte: currentMonthStart },
        },
      }),
      prisma.booking.aggregate({
        _sum: { totalAmount: true },
        where: {
          status: { in: REVENUE_STATUSES },
          createdAt: { gte: previousMonthStart, lte: previousMonthEnd },
        },
      }),
      prisma.booking.count({ where: { status: { in: REVENUE_STATUSES } } }),
      prisma.cmsGuide.count(),
      prisma.cmsGuide.count({ where: { status: "PUBLISHED" } }),
      prisma.landingPage.count(),
      prisma.enquiry.count({ where: { status: "NEW" } }),
      prisma.enquiry.count(),
      prisma.booking.findFirst({
        where: { currency: { not: "" } },
        orderBy: { createdAt: "desc" },
        select: { currency: true },
      }),
      prisma.booking.findMany({
        where: {
          status: { in: REVENUE_STATUSES },
          createdAt: { gte: chartStart },
          OR: [{ amountPaid: { gt: 0 } }, { totalAmount: { gt: 0 } }],
        },
        select: { createdAt: true, amountPaid: true, totalAmount: true, currency: true },
      }),
      prisma.supplierRecord.findFirst({
        where: { code: { equals: "tripjack", mode: "insensitive" } },
        select: { status: true, capabilities: true },
      }),
    ]);

    const rooms = hotelRows.reduce((sum, row) => sum + roomCountFromDetails(row.details), 0);
    const tripjackHotelsListed = hotelRows.filter((row) => isTripjackHotelDetails(row.details)).length;
    const totalRevenue = revenueResult._sum.totalAmount || 0;
    const currentMonthRev = currentMonthRevResult._sum.totalAmount || 0;
    const previousMonthRev = previousMonthRevResult._sum.totalAmount || 0;
    const revenueVariance =
      previousMonthRev > 0
        ? Math.round(((currentMonthRev - previousMonthRev) / previousMonthRev) * 1000) / 10
        : currentMonthRev > 0
          ? 100
          : 0;
    const conversionRate =
      totalEnquiries > 0
        ? Math.round((revenueBookingCount / totalEnquiries) * 10000) / 100
        : 0;

    const revenueCurrency =
      currencySample?.currency?.trim() ||
      revenueBookingsForChart.find((b) => b.currency?.trim())?.currency?.trim() ||
      "";

    function money(amount: number): string {
      if (!revenueCurrency) return formatCount(Math.round(amount));
      try {
        return formatCurrency(amount, revenueCurrency);
      } catch {
        return formatCount(Math.round(amount));
      }
    }

    const tripjackSupplierActive = tripjackSupplier?.status === "ACTIVE";
    const tripjackHotelsCard =
      tripjackHotelsListed > 0
        ? {
            id: "tripjackHotels",
            title: "TripJack hotels listed",
            value: formatCount(tripjackHotelsListed),
            hint: "Hotels tagged as TripJack in inventory",
            icon: "compass" as const,
            numericValue: tripjackHotelsListed,
          }
        : {
            id: "tripjackHotels",
            title: "TripJack hotels listed",
            value: formatCount(0),
            hint: tripjackEnabled
              ? tripjackSupplierActive
                ? "TripJack supplier active — no tagged hotels in inventory yet"
                : "TripJack enabled — live search only; no tagged hotels saved"
              : "TripJack supplier disabled in configuration",
            icon: "compass" as const,
            numericValue: 0,
          };

    const revenueHint =
      revenueVariance !== 0
        ? `${revenueVariance > 0 ? "+" : ""}${revenueVariance}% vs last month`
        : "From confirmed / paid bookings";

    const sections: DashboardKpiSection[] = [
      {
        id: "catalog",
        title: "Catalog",
        description: "Packages, inventory, ferry routes, and destinations.",
        cards: [
          {
            id: "holidayPackages",
            title: "Holiday packages",
            value: formatCount(holidayPackages),
            hint: "Non-archived packages",
            icon: "package",
            numericValue: holidayPackages,
          },
          {
            id: "hotels",
            title: "Hotels",
            value: formatCount(hotels),
            hint: "Managed hotel inventory",
            icon: "building2",
            numericValue: hotels,
          },
          {
            id: "rooms",
            title: "Rooms",
            value: formatCount(rooms),
            hint: "Room types across hotels",
            icon: "bedDouble",
            numericValue: rooms,
          },
          {
            id: "ferry",
            title: "Ferry",
            value: formatCount(ferry),
            hint: "Ferry routes configured",
            icon: "ship",
            numericValue: ferry,
          },
          {
            id: "flights",
            title: "Flights",
            value: formatCount(flights),
            hint: "Flight inventory items",
            icon: "plane",
            numericValue: flights,
          },
          {
            id: "activities",
            title: "Activities",
            value: formatCount(activities),
            hint: "Activity inventory items",
            icon: "activity",
            numericValue: activities,
          },
          {
            id: "destinations",
            title: "Destinations",
            value: formatCount(destinations),
            hint: "Non-archived destinations",
            icon: "mapPin",
            numericValue: destinations,
          },
        ],
      },
      {
        id: "bookings",
        title: "Bookings & inventory ops",
        description: "Bookings, hotel listings, revenue, and conversion.",
        cards: [
          {
            id: "totalBookings",
            title: "Total bookings",
            value: formatCount(totalBookings),
            hint: "All booking records",
            icon: "calendar",
            numericValue: totalBookings,
          },
          {
            id: "activeBookings",
            title: "Active bookings",
            value: formatCount(activeBookings),
            hint: "Pending, confirmed, or partially paid",
            icon: "hotel",
            numericValue: activeBookings,
          },
          {
            id: "hotelsListed",
            title: "Hotels listed",
            value: formatCount(hotels),
            hint: "Managed hotel inventory",
            icon: "building2",
            numericValue: hotels,
          },
          tripjackHotelsCard,
          {
            id: "totalRevenue",
            title: "Total revenue",
            value: money(totalRevenue),
            hint: revenueHint,
            icon: "creditCard",
            numericValue: totalRevenue,
          },
          {
            id: "conversionRate",
            title: "Conversion rate",
            value: formatPercent(conversionRate),
            hint: "Revenue bookings per enquiry",
            icon: "percent",
            numericValue: conversionRate,
          },
        ],
      },
      {
        id: "content",
        title: "Content & leads",
        description: "CMS content and enquiry pipeline.",
        cards: [
          {
            id: "blogs",
            title: "Blogs",
            value: formatCount(blogs),
            hint: `${formatCount(blogsPublished)} published`,
            icon: "bookOpen",
            numericValue: blogs,
          },
          {
            id: "landingPages",
            title: "Landing pages",
            value: formatCount(landingPages),
            hint: "CMS landing page builder",
            icon: "layoutTemplate",
            numericValue: landingPages,
          },
          {
            id: "newLeads",
            title: "New leads",
            value: formatCount(newLeads),
            hint: "Enquiries with status NEW",
            icon: "inbox",
            numericValue: newLeads,
          },
          {
            id: "totalEnquiries",
            title: "Total enquiries",
            value: formatCount(totalEnquiries),
            hint: "All website enquiries",
            icon: "messageSquareQuote",
            numericValue: totalEnquiries,
          },
        ],
      },
    ];

    const buckets = new Map<string, RevenueMonthPoint>();
    for (let i = 5; i >= 0; i -= 1) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const month = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      buckets.set(month, {
        month,
        label: `${MONTH_LABELS[d.getMonth()]} ${d.getFullYear()}`,
        amount: 0,
      });
    }
    for (const booking of revenueBookingsForChart) {
      const date = booking.createdAt;
      const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      const existing = buckets.get(month);
      if (!existing) continue;
      const amount =
        typeof booking.amountPaid === "number" && booking.amountPaid > 0
          ? booking.amountPaid
          : booking.totalAmount || 0;
      existing.amount += amount;
    }

    return {
      pageTitle: "Dashboard",
      pageDescription: "Management overview across catalog, bookings, and content.",
      revenueCurrency,
      revenueVariance,
      totalRevenue,
      sections,
      revenueChart: [...buckets.values()],
    };
  }
}

export function getManagementDashboardService(): ManagementDashboardService {
  return new ManagementDashboardService();
}
