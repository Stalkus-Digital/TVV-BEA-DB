import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/shared/database/prisma-client";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q");
    const type = searchParams.get("type"); // 'city' or 'hotel'
    
    if (!q || q.length < 2) {
      return NextResponse.json({ success: true, data: [] });
    }

    let results: any = { cities: [], hotels: [] };

    // Search Cities
    if (!type || type === "city") {
      const cities = await prisma.tjCityRegion.findMany({
        where: {
          OR: [
            { cityName: { contains: q } },
            { regionName: { contains: q } },
            { fullRegionName: { contains: q } }
          ]
        },
        take: 10,
        select: {
          cityRegionId: true,
          cityName: true,
          regionName: true,
          countryName: true,
          fullRegionName: true,
        }
      });
      results.cities = cities;
    }

    // Search Hotels
    if (!type || type === "hotel") {
      const hotels = await prisma.tjHotel.findMany({
        where: {
          name: { contains: q }
        },
        take: 20,
        select: {
          tjHotelId: true,
          name: true,
          starRating: true,
          countryName: true,
          address: true,
          cityRegionId: true,
        }
      });
      results.hotels = hotels;
    }

    // If a specific type is requested, return flat array for easy autocomplete
    if (type === "city") return NextResponse.json({ success: true, data: results.cities });
    if (type === "hotel") return NextResponse.json({ success: true, data: results.hotels });

    // Otherwise return both
    return NextResponse.json({ success: true, data: results });

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
