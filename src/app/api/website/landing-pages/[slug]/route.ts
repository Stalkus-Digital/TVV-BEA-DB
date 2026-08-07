import { NextResponse, type NextRequest } from "next/server";
import { LandingPageService } from "@/modules/website/services/landing-page.service";

export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const service = new LandingPageService({} as any);
    const result = await service.getBySlug(slug);

    if (!result.ok) {
      return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(result.value);
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to fetch landing page" }, { status: 500 });
  }
}
