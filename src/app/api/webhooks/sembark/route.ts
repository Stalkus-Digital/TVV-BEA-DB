import { NextResponse } from "next/server";
import { SembarkService } from "@/modules/customer/services/sembark.service";
import { createLogger } from "@/shared/logger";
import { getIntegrationConfigResolver } from "@/modules/integrations";

const logger = createLogger("api.webhooks.sembark");

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    const cfg = await getIntegrationConfigResolver().getSembarkConfig();
    const expected = cfg.webhookSecret || "mock-secret";
    if (authHeader !== `Bearer ${expected}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = await req.json();
    logger.info("Received Sembark Webhook", { event: payload.event });

    const sembarkService = new SembarkService({ logger: createLogger("customer.sembark") });

    if (payload.event === "inventory.updated") {
      await sembarkService.syncInventory();
      return NextResponse.json({ success: true, message: "Inventory sync triggered" });
    }

    return NextResponse.json({ success: true, message: "Webhook acknowledged" });
  } catch (error) {
    logger.error("Error processing Sembark webhook", { error });
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
