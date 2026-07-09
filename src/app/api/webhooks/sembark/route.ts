import { NextResponse } from "next/server";
import { moduleRegistry } from "@/shared/di";
import { SembarkService } from "@/modules/customer/services/sembark.service";
import { createLogger } from "@/shared/logger";

const logger = createLogger("api.webhooks.sembark");

export async function POST(req: Request) {
  try {
    // 1. Verify webhook signature (MOCK for now)
    const authHeader = req.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.SEMBARK_WEBHOOK_SECRET || "mock-secret"}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = await req.json();
    logger.info("Received Sembark Webhook", { event: payload.event });

    // 2. Fetch the Sembark Service
    // In a real environment, you'd resolve this from the DI container properly
    const sembarkService = new SembarkService({ logger: createLogger("customer.sembark") });

    if (payload.event === "inventory.updated") {
      // Trigger a sync
      await sembarkService.syncInventory();
      return NextResponse.json({ success: true, message: "Inventory sync triggered" });
    }

    return NextResponse.json({ success: true, message: "Webhook acknowledged" });
  } catch (error) {
    logger.error("Error processing Sembark webhook", { error });
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
