import { BaseService, type ServiceContext } from "@/shared/services";
import { ok, err, type Result } from "@/shared/types";
import { InternalError, type AppError } from "@/shared/errors";
import { prisma } from "@/shared/database/prisma-client";
import type { Lead } from "@/generated/prisma/client";

export class SembarkClient extends BaseService {
  private readonly webhookUrl: string;
  private readonly apiKey: string;

  constructor(context: ServiceContext) {
    super(context);
    this.webhookUrl = process.env.SEMBARK_WEBHOOK_URL || "https://api.sembark.com/v1/leads";
    this.apiKey = process.env.SEMBARK_API_KEY || "MOCK_SEMBARK_KEY";
  }

  async pushLead(lead: Lead): Promise<Result<void, AppError>> {
    try {
      if (this.apiKey === "MOCK_SEMBARK_KEY") {
        this.logger.info("Mock Sembark: Pushing lead", { leadId: lead.id, name: lead.name });
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 500));
        return ok(undefined);
      }

      const response = await fetch(this.webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          sourceId: lead.id,
          name: lead.name,
          email: lead.email,
          phone: lead.phone,
          source: "TVV Website",
          sourceUrl: lead.sourceUrl,
          createdAt: lead.createdAt.toISOString(),
        })
      });

      if (!response.ok) {
        throw new Error(`Sembark returned ${response.status}`);
      }

      return ok(undefined);
    } catch (error) {
      this.logger.error("Failed to push lead to Sembark", { error, leadId: lead.id });
      return err(new InternalError("Failed to push lead to Sembark"));
    }
  }

  async pullInventory(): Promise<Result<{ hotels: number, destinations: number }, AppError>> {
    try {
      this.logger.info("Mock Sembark: Pulling inventory");
      // Simulate network sync
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real implementation, we would fetch from Sembark API and upsert into Prisma.
      return ok({ hotels: 42, destinations: 12 });
    } catch (error) {
      return err(new InternalError("Failed to pull Sembark inventory"));
    }
  }
}
