import { NextResponse } from 'next/server';
import { prisma } from "@/shared/database/prisma-client";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');
  const search = searchParams.get('search') || '';
  const city = searchParams.get('city') || '';
  const skip = (page - 1) * limit;

  const where: any = {};
  if (search) {
    where.name = { contains: search, mode: 'insensitive' };
  }
  if (city) {
    where.city = { cityName: { contains: city, mode: 'insensitive' } };
  }

  try {
    const [hotels, total] = await Promise.all([
      prisma.tjHotel.findMany({
        where,
        skip,
        take: limit,
        include: {
          country: true,
          city: true,
        },
        orderBy: {
          name: 'asc',
        },
      }),
      prisma.tjHotel.count({ where }),
    ]);

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
