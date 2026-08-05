import { NextResponse } from 'next/server';
import { prisma } from "@/shared/database/prisma-client";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');
  const search = searchParams.get('search') || '';
  const city = searchParams.get('city') || '';
  const skip = (page - 1) * limit;

  try {
    let hotels;
    let total;

    if (city) {
      const cityQuery = `%${city}%`;
      const nameQuery = `%${search}%`;
      
      // Ultimate Permissive Search: Scans the name, countryName, and the ENTIRE address JSON block as raw text
      hotels = await prisma.$queryRaw<any[]>`
        SELECT *
        FROM tj_hotels
        WHERE (
          name ILIKE ${cityQuery} 
          OR "countryName" ILIKE ${cityQuery} 
          OR address::text ILIKE ${cityQuery}
        )
        AND name ILIKE ${nameQuery}
        ORDER BY name ASC
        LIMIT ${limit} OFFSET ${skip}
      `;
      
      const totalRes = await prisma.$queryRaw<any[]>`
        SELECT COUNT(*)::int as count
        FROM tj_hotels
        WHERE (
          name ILIKE ${cityQuery} 
          OR "countryName" ILIKE ${cityQuery} 
          OR address::text ILIKE ${cityQuery}
        )
        AND name ILIKE ${nameQuery}
      `;
      total = totalRes[0].count;
    } else {
      const where: any = {};
      if (search) {
        where.name = { contains: search, mode: 'insensitive' };
      }
      
      const [prismaHotels, prismaTotal] = await Promise.all([
        prisma.tjHotel.findMany({
          where,
          skip,
          take: limit,
          orderBy: { name: 'asc' },
        }),
        prisma.tjHotel.count({ where }),
      ]);
      hotels = prismaHotels;
      total = prismaTotal;
    }

    return NextResponse.json({
      success: true,
      data: hotels,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error('Failed to fetch hotels:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch hotels' },
      { status: 500 }
    );
  }
}
