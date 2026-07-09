import { NextResponse } from "next/server";
import { SembarkClient } from "@/modules/supplier/adapters/sembark/sembark.client";
import { createLogger } from "@/shared/logger";

const sembarkClient = new SembarkClient({ logger: createLogger("api.sembark") });

export async function POST() {
  const result = await sembarkClient.pullInventory();
  if (result.ok) {
    return NextResponse.json({
      success: true,
      message: `Successfully synchronized ${result.value.hotels} hotels and ${result.value.destinations} destinations from Sembark.`,
    });
  }
  return NextResponse.json({ error: result.error.message }, { status: 500 });
}
