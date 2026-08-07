import { NextResponse, type NextRequest } from "next/server";
import { LandingPageService } from "@/modules/website/services/landing-page.service";

function service() {
  return new LandingPageService({} as any);
}

export async function GET() {
  const result = await service().getAll();
  if (!result.ok) return NextResponse.json({ success: false, error: result.error.message }, { status: 500 });
  return NextResponse.json({ success: true, data: result.value });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.title || !body.slug) {
      return NextResponse.json({ success: false, error: "title and slug are required" }, { status: 400 });
    }
    const result = await service().create(body);
    if (!result.ok) {
      const status = result.error.name === "ConflictError" ? 409 : 500;
      return NextResponse.json({ success: false, error: result.error.message }, { status });
    }
    return NextResponse.json({ success: true, data: result.value }, { status: 201 });
  } catch {
    return NextResponse.json({ success: false, error: "Invalid request body" }, { status: 400 });
  }
}
