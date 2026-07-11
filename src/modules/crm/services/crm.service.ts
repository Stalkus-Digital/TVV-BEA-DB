import { BaseService, type ServiceContext } from "@/shared/services";
import { ok, err, type Result } from "@/shared/types";
import { InternalError, type AppError } from "@/shared/errors";
import { prisma } from "@/shared/database/prisma-client";

export interface DashboardMetrics {
  totalRevenue: number;
  revenueVariance: number;
  activeBookings: number;
  newLeads: number;
  conversionRate: number;
  recentActivities: {
    id: string;
    title: string;
    description: string;
    timestamp: string;
    type: "BOOKING" | "LEAD";
  }[];
}

export class CrmService extends BaseService {
  constructor(context: ServiceContext) {
    super(context);
  }

  async getDashboardMetrics(): Promise<Result<DashboardMetrics, AppError>> {
    try {
      // Date boundaries for current and previous month
      const now = new Date();
      const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const previousMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);

      // ✅ HR-7 FIX: Revenue includes ALL revenue-bearing statuses.
      // A booking moves CONFIRMED → PAID/PARTIALLY_PAID/TICKETED after payment.
      // Counting only CONFIRMED would show zero once a booking is paid.
      const REVENUE_STATUSES = ["CONFIRMED", "PAID", "PARTIALLY_PAID", "TICKETED", "COMPLETED"];

      // 1. Total Revenue — ALL confirmed/paid bookings (all time)
      const revenueResult = await prisma.booking.aggregate({
        _sum: { totalAmount: true },
        where: { status: { in: REVENUE_STATUSES } },
      });
      const totalRevenue = revenueResult._sum.totalAmount || 0;

      // 2. Month-over-month revenue variance (real calculation)
      const [currentMonthRevResult, previousMonthRevResult] = await Promise.all([
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
      ]);
      const currentMonthRev = currentMonthRevResult._sum.totalAmount || 0;
      const previousMonthRev = previousMonthRevResult._sum.totalAmount || 0;
      const revenueVariance =
        previousMonthRev > 0
          ? Math.round(((currentMonthRev - previousMonthRev) / previousMonthRev) * 1000) / 10 // 1 decimal
          : currentMonthRev > 0
          ? 100 // First month with revenue — 100% growth from zero
          : 0;

      // 3. Active Bookings — includes PARTIALLY_PAID which was previously missed
      const activeBookings = await prisma.booking.count({
        where: { status: { in: ["PENDING", "CONFIRMED", "PARTIALLY_PAID"] } },
      });

      // 4. New Leads
      const newLeads = await prisma.lead.count({ where: { status: "NEW" } });

      // 5. Conversion Rate — all revenue-bearing bookings / total leads (as %)
      const totalLeads = await prisma.lead.count();
      const totalConfirmed = await prisma.booking.count({ where: { status: { in: REVENUE_STATUSES } } });
      const conversionRate = totalLeads > 0 ? Math.round((totalConfirmed / totalLeads) * 10000) / 100 : 0;

      // 6. Recent Activity — last 5 bookings
      const recentBookings = await prisma.booking.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
      });

      const recentActivities = recentBookings.map((b: any) => ({
        id: b.id,
        title: `New Booking: ${b.bookingNumber}`,
        description: `Customer booked a package for ${b.totalAmount} ${b.currency}`,
        timestamp: b.createdAt.toISOString(),
        type: "BOOKING" as const,
      }));

      return ok({
        totalRevenue,
        revenueVariance,
        activeBookings,
        newLeads,
        conversionRate,
        recentActivities,
      });
    } catch (error) {
      this.logger.error("Failed to fetch CRM metrics", { error });
      return err(new InternalError("Failed to fetch CRM metrics"));
    }
  }
}
