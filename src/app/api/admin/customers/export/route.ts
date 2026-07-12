import { NextResponse } from "next/server";
import { prisma } from "@/shared/database/prisma-client";

export async function GET() {
  try {
    const customers = await prisma.user.findMany({
      select: {
        id: true,
        fullName: true,
        email: true,
        createdAt: true,
      },
    });

    const headers = ["ID", "Full Name", "Email", "Joined Date"];
    const rows = customers.map((c) => [
      c.id,
      c.fullName || "",
      c.email,
      c.createdAt.toISOString(),
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

    return new NextResponse(csvContent, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": 'attachment; filename="customers_export.csv"',
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
