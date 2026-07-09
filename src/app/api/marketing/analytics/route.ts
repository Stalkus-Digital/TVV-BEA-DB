import { NextResponse } from "next/server";
import { prisma } from "@/shared/database/prisma-client";

export async function GET(request: Request) {
  try {
    const pages = await prisma.pageAnalytics.findMany({
      orderBy: { views: "desc" },
    });

    const totalViews = pages.reduce((acc, p) => acc + p.views, 0);
    const uniqueVisitors = pages.reduce((acc, p) => acc + p.uniqueVisitors, 0);
    const topPages = pages.slice(0, 10);

    return NextResponse.json({
      traffic: {
        totalViews,
        uniqueVisitors,
        totalSessions: Math.round(totalViews / 2.5), // Example metric
      },
      topPages,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
