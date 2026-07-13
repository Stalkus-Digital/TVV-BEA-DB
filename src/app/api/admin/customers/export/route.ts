import { NextResponse } from "next/server";
import { getCustomerProfileService } from "@/modules/customer";
import { getUserHandler } from "@/modules/auth";
import { isErr } from "@/shared/types";

export async function GET() {
  try {
    const profilesResult = await getCustomerProfileService().listCustomers();
    if (isErr(profilesResult)) {
      return NextResponse.json({ error: profilesResult.error.message }, { status: 500 });
    }
    
    const users = [];
    for (const p of profilesResult.value) {
      const user = await getUserHandler(p.id); 
      if (!isErr(user)) users.push(user.value);
    }

    const headers = ["ID", "Full Name", "Email", "Joined Date"];
    const rows = users.map((c) => [
      c.id,
      c.fullName || "",
      c.email,
      new Date(c.createdAt).toISOString(),
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
