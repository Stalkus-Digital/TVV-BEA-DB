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
      // 1. Total Revenue (sum of totalAmount for CONFIRMED bookings)
      const revenueResult = await prisma.booking.aggregate({
        _sum: {
          totalAmount: true,
        },
        where: {
          status: "CONFIRMED",
        },
      });
      const totalRevenue = revenueResult._sum.totalAmount || 0;
      
      // Calculate variance (mocked for now, normally compare current vs previous month)
      const revenueVariance = totalRevenue > 0 ? 12.5 : 0;

      // 2. Active Bookings
      const activeBookings = await prisma.booking.count({
        where: {
          status: {
            in: ["PENDING", "CONFIRMED"],
          },
        },
      });

      // 3. New Leads
      const newLeads = await prisma.lead.count({
        where: {
          status: "NEW",
        },
      });

      // 4. Conversion Rate (CONFIRMED Bookings / Total Leads)
      const totalLeads = await prisma.lead.count();
      const conversionRate = totalLeads > 0 ? (activeBookings / totalLeads) * 100 : 0;

      // 5. Recent Activity
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
