import { NextResponse } from "next/server";
import { getOpenAIService } from "@/modules/system";

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return NextResponse.json({ success: false, error: "Prompt is required" }, { status: 400 });
    }

    const openAIService = getOpenAIService();
    const result = await openAIService.generatePackageItinerary(prompt);

    if (!result.ok) {
      return NextResponse.json({ success: false, error: result.error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: result.value }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
