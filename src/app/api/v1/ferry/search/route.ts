import { NextResponse } from "next/server";
import { prisma } from "@/shared/database/prisma-client";

/**
 * POST /api/v1/ferry/search
 *
 * Returns available ferry routes and rates for the given origin/destination.
 * Currently backed by the admin-managed static FerryRate table.
 * When a live ferry operator API is integrated, this route will proxy to it instead.
 *
 * Expected body:
 * {
 *   from: string;    // port/city name or code
 *   to: string;      // port/city name or code
 *   date: string;    // YYYY-MM-DD (departure date)
 *   passengers?: number;
 * }
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { from, to, passengers = 1 } = body;

    if (!from || !to) {
      return NextResponse.json(
        { success: false, error: "from and to are required" },
        { status: 400 }
      );
    }

    // Fetch all rates from the static ferry rate table
    const allRates = await prisma.ferryRate.findMany({
      orderBy: { markupPrice: "asc" },
    });

    // Filter by route: flexible match — "Port Blair → Havelock", "portblair-havelock", etc.
    const normalise = (s: string) => s.toLowerCase().replace(/[\s\-_]+/g, "");
    const fromNorm = normalise(from);
    const toNorm = normalise(to);

    const matching = allRates.filter((r) => {
      const routeNorm = normalise(r.route);
      return (
        routeNorm.includes(fromNorm) ||
        routeNorm.includes(toNorm) ||
        (fromNorm.length > 2 && routeNorm.includes(fromNorm.substring(0, 4))) ||
        (toNorm.length > 2 && routeNorm.includes(toNorm.substring(0, 4)))
      );
    });

    if (matching.length === 0) {
      return NextResponse.json({
        success: true,
        data: [],
        message: "No ferry routes found for this origin/destination. Contact us for custom ferry bookings.",
      });
    }

    // Shape each rate into a bookable option
    const options = matching.map((r) => ({
      id: r.id,
      route: r.route,
      provider: r.provider,
      class: r.class,
      basePrice: r.basePrice,
      totalPrice: r.markupPrice * passengers,
      pricePerPax: r.markupPrice,
      currency: "INR",
      passengers,
      // Note: real departure times and seat availability require live API integration.
      availability: "ON_REQUEST",
      updatedAt: r.updatedAt,
    }));

    return NextResponse.json({ success: true, data: options });
  } catch (error) {
    console.error("[ferry/search] Error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
