import { NextResponse, type NextRequest } from "next/server";
import { LandingPageService } from "@/modules/website/services/landing-page.service";

function service() {
  return new LandingPageService({} as any);
}

/** POST /api/admin/landing-pages/[id]/duplicate — clone a page */
export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await service().duplicate(id);
  if (!result.ok) {
    const status = result.error.name === "NotFoundError" ? 404 : 500;
    return NextResponse.json({ success: false, error: result.error.message }, { status });
  }
  return NextResponse.json({ success: true, data: result.value }, { status: 201 });
}
