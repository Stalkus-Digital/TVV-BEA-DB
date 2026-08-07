import { NextResponse, type NextRequest } from "next/server";
import { LandingPageService } from "@/modules/website/services/landing-page.service";

function service() {
  return new LandingPageService({} as any);
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await service().getById(id);
  if (!result.ok) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
  return NextResponse.json({ success: true, data: result.value });
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const result = await service().update(id, body);
    if (!result.ok) {
      const status = result.error.name === "ConflictError" ? 409 : 500;
      return NextResponse.json({ success: false, error: result.error.message }, { status });
    }
    return NextResponse.json({ success: true, data: result.value });
  } catch {
    return NextResponse.json({ success: false, error: "Invalid request" }, { status: 400 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await service().delete(id);
  if (!result.ok) return NextResponse.json({ success: false, error: result.error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
