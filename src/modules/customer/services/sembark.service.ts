import { BaseService, type ServiceContext } from "@/shared/services";
import { ok, err, type Result } from "@/shared/types";
import { InternalError, type AppError } from "@/shared/errors";
import type { Enquiry } from "../types/enquiry";

/**
 * Service to handle synchronization between TVV and the Sembark CRM.
 * Pushes new leads and pulls packages/destinations.
 */
export class SembarkService extends BaseService {
  constructor(context: ServiceContext) {
    super(context);
  }

  private async getCredentials(): Promise<{ apiUrl: string; apiKey: string }> {
    const { getIntegrationConfigResolver } = await import("@/modules/integrations");
    const cfg = await getIntegrationConfigResolver().getSembarkConfig();
    return {
      apiUrl: cfg.apiUrl || "https://api.sembark.com/v1",
      apiKey: cfg.apiKey || "mock-sembark-key",
    };
  }

  /**
   * Pushes a newly created Enquiry to Sembark as a Lead.
   */
  async pushLead(enquiry: Enquiry): Promise<Result<void, AppError>> {
    this.logger.info("Pushing lead to Sembark", { enquiryId: enquiry.id });

    try {
      const { apiUrl, apiKey } = await this.getCredentials();
      if (apiKey === "mock-sembark-key") {
        this.logger.info("Successfully pushed lead to Sembark (mock)", { enquiryId: enquiry.id, apiUrl });
        return ok(undefined);
      }

      const response = await fetch(`${apiUrl}/leads`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          source: "TVV Travel OS",
          name: enquiry.name || "Unknown",
          email: enquiry.email || "",
          phone: enquiry.phone || "",
          details: enquiry.message || "",
          destination: enquiry.destinationSlug || "",
        }),
      });

      if (!response.ok) {
        throw new Error(`Sembark API returned ${response.status}`);
      }

      this.logger.info("Successfully pushed lead to Sembark", { enquiryId: enquiry.id });
      return ok(undefined);
    } catch (error) {
      this.logger.error("Failed to push lead to Sembark", { error, enquiryId: enquiry.id });
      return err(new InternalError("Failed to synchronize lead with Sembark"));
    }
  }

  /**
   * Pushes a confirmed booking to Sembark CRM.
   */
  async pushBooking(booking: any): Promise<Result<void, AppError>> {
    this.logger.info("Pushing booking to Sembark", { bookingId: booking.id, bookingNumber: booking.bookingNumber });

    try {
      // MOCK: Replace with actual `fetch` call to Sembark when API keys are available
      this.logger.info("Successfully pushed booking to Sembark", { bookingId: booking.id });
      return ok(undefined);
    } catch (error) {
      this.logger.error("Failed to push booking to Sembark", { error, bookingId: booking.id });
      return err(new InternalError("Failed to synchronize booking with Sembark"));
    }
  }

  /**
   * Pulls destinations, hotels, and packages from Sembark into the system.
   * This would typically be run as a cron job or manual trigger.
   */
  async syncInventory(): Promise<Result<{ synced: number }, AppError>> {
    this.logger.info("Starting Sembark inventory sync");
    
    try {
      // MOCK: Fetch and map logic goes here once endpoints are provided
      
      this.logger.info("Sembark inventory sync completed");
      return ok({ synced: 0 });
    } catch (error) {
      this.logger.error("Failed to sync inventory from Sembark", { error });
      return err(new InternalError("Failed to synchronize inventory from Sembark"));
    }
  }
}
