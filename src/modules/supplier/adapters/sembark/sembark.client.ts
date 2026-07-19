import { BaseService, type ServiceContext } from "@/shared/services";
import { ok, err, type Result } from "@/shared/types";
import { InternalError, type AppError } from "@/shared/errors";
import type { Lead } from "@/generated/prisma/client";

export class SembarkClient extends BaseService {
  constructor(context: ServiceContext) {
    super(context);
  }

  private async getCredentials(): Promise<{ webhookUrl: string; apiKey: string }> {
    const { getIntegrationConfigResolver } = await import("@/modules/integrations");
    const cfg = await getIntegrationConfigResolver().getSembarkConfig();
    return {
      webhookUrl: cfg.webhookUrl || "https://api.sembark.com/v1/leads",
      apiKey: cfg.apiKey || "MOCK_SEMBARK_KEY",
    };
  }

  async pushLead(lead: Lead): Promise<Result<void, AppError>> {
    try {
      const { webhookUrl, apiKey } = await this.getCredentials();
      if (apiKey === "MOCK_SEMBARK_KEY") {
        this.logger.info("Mock Sembark: Pushing lead", { leadId: lead.id, name: lead.name });
        await new Promise((resolve) => setTimeout(resolve, 500));
        return ok(undefined);
      }

      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          sourceId: lead.id,
          name: lead.name,
          email: lead.email,
          phone: lead.phone,
          source: "TVV Website",
          sourceUrl: lead.sourceUrl,
          createdAt: lead.createdAt.toISOString(),
        }),
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

  async pullInventory(): Promise<Result<{ hotels: number; destinations: number }, AppError>> {
    try {
      this.logger.info("Mock Sembark: Pulling inventory");
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return ok({ hotels: 42, destinations: 12 });
    } catch (error) {
      return err(new InternalError("Failed to pull Sembark inventory"));
    }
  }
}
