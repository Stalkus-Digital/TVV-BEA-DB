import { NextResponse } from "next/server";
import { prisma } from "@/shared/database/prisma-client";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    let estimate = 0;
    const breakdown = [];

    // Basic calculation logic for production based on days/guests
    if (body.packageId) {
      const pkg = await prisma.package.findUnique({ where: { id: body.packageId }});
      if (pkg) {
        const baseCost = pkg.durationDays * 150; // Dynamic logic based on package
        const total = baseCost * (body.guests || 1);
        estimate += total;
        breakdown.push({ item: "Package Base", cost: total });
      }
    } else {
       const days = body.days || 1;
       const guests = body.guests || 1;
       const tierCost = body.tier === "LUXURY" ? 500 : body.tier === "PREMIUM" ? 250 : 100;
       estimate = days * guests * tierCost;
       breakdown.push({ item: "Custom Build", cost: estimate });
    }

    return NextResponse.json({ success: true, data: { estimate, breakdown } });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
