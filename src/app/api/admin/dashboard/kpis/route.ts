import { NextResponse } from "next/server";
import { readAuthContextFromHeaders } from "@/modules/auth";
import { getManagementDashboardService } from "@/modules/crm/services/management-dashboard.service";

export async function GET(request: Request) {
  try {
    const context = readAuthContextFromHeaders(request.headers);
    if (!context || (!context.roles.includes("ADMIN") && !context.roles.includes("SUPER_ADMIN"))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const service = getManagementDashboardService();
    const kpis = await service.getKpis();
    return NextResponse.json(kpis);
  } catch (error) {
    console.error("Dashboard KPI Error:", error);
    return NextResponse.json({ error: "Failed to fetch KPIs" }, { status: 500 });
  }
}
