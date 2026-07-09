import { NextResponse } from "next/server";
import { prisma } from "@/shared/database/prisma-client";
import type { FormStatistics } from "@/features/admin-marketing/types";

export async function GET(request: Request) {
  try {
    const [enquiries, quotes] = await Promise.all([
      prisma.enquiry.findMany(),
      prisma.quote.findMany()
    ]);

    const stats: FormStatistics = {
      enquiryTotal: enquiries.length,
      convertedEnquiries: enquiries.filter(e => e.status === "CONVERTED").length,
      enquiryByType: {},
      enquiryByStatus: {},
      quoteTotal: quotes.length,
      quoteByStatus: {}
    };

    for (const e of enquiries) {
      stats.enquiryByType[e.type] = (stats.enquiryByType[e.type] || 0) + 1;
      stats.enquiryByStatus[e.status] = (stats.enquiryByStatus[e.status] || 0) + 1;
    }
    
    for (const q of quotes) {
      stats.quoteByStatus[q.status] = (stats.quoteByStatus[q.status] || 0) + 1;
    }

    return NextResponse.json(stats);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
