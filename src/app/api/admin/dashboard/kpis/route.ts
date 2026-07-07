import { NextResponse } from "next/server";
import { prisma } from "@/shared/database/prisma-client";

export async function GET() {
  try {
    const [
      totalCustomers,
      totalEnquiries,
      totalQuotes,
      totalBookings,
      activePackages,
      activeDestinations,
      revenueAgg
    ] = await Promise.all([
      prisma.user.count({ where: { role: "CUSTOMER" } }),
      prisma.lead.count(),
      prisma.quote.count(),
      prisma.booking.count(),
      prisma.package.count({ where: { status: "PUBLISHED" } }),
      prisma.destination.count({ where: { status: "PUBLISHED" } }),
      prisma.bookingPayment.aggregate({
        _sum: { amount: true },
        where: { status: "COMPLETED" }
      })
    ]);

    return NextResponse.json({
      data: {
        totalCustomers,
        totalEnquiries,
        totalQuotes,
        totalBookings,
        activePackages,
        inventoryCount: 0, // Placeholder if no generic inventory count
        activeDestinations,
        revenueCollected: revenueAgg._sum.amount || 0,
        revenueCurrency: "INR",
      }
    });
  } catch (error) {
    console.error("Dashboard KPI Error:", error);
    return NextResponse.json({ error: "Failed to fetch KPIs" }, { status: 500 });
  }
}
