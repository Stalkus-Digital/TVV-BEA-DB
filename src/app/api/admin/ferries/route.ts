import { NextResponse } from "next/server";
import { FerryService } from "@/modules/ferry/ferry.service";
import { createLogger } from "@/shared/logger";

const ferryService = new FerryService({ logger: createLogger("api.ferry") });

export async function GET() {
  const result = await ferryService.getAllRates();
  if (result.ok) {
    return NextResponse.json(result.value);
  }
  return NextResponse.json({ error: result.error.message }, { status: 500 });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = await ferryService.createRate(body);
    if (result.ok) {
      return NextResponse.json(result.value, { status: 201 });
    }
    return NextResponse.json({ error: result.error.message }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    if (!body.id) return NextResponse.json({ error: "id is required" }, { status: 400 });
    
    const result = await ferryService.updateRate(body);
    if (result.ok) {
      return NextResponse.json(result.value);
    }
    return NextResponse.json({ error: result.error.message }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
}

export async function DELETE(req: Request) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });

    const result = await ferryService.deleteRate(id);
    if (result.ok) {
      return NextResponse.json({ success: true });
    }
    return NextResponse.json({ error: result.error.message }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
