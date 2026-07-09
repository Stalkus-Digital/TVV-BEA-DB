import { NextResponse } from "next/server";
import { getCrmService } from "@/modules/crm";
import { readAuthContextFromHeaders } from "@/modules/auth";

export async function GET(request: Request) {
  try {
    const context = readAuthContextFromHeaders(request.headers);
    if (!context || (!context.roles.includes("ADMIN") && !context.roles.includes("SUPER_ADMIN"))) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const crmService = getCrmService();
    const metricsResult = await crmService.getDashboardMetrics();

    if (!metricsResult.ok) {
      return NextResponse.json(
        { error: metricsResult.error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(metricsResult.value);
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
