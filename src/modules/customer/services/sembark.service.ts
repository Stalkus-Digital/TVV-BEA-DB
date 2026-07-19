import { BaseService, type ServiceContext } from "@/shared/services";
import { ok, err, type Result } from "@/shared/types";
import { InternalError, type AppError } from "@/shared/errors";
import type { Enquiry } from "../types/enquiry";

/**
 * Pushes enquiries/leads from TVV to Sembark CRM for lead management.
 * Does not sync inventory — Sembark is lead-only.
 */
export class SembarkService extends BaseService {
  constructor(context: ServiceContext) {
    super(context);
  }

  /**
   * Vault-only credentials. Env fallbacks are ignored so we never pretend to be connected.
   */
  private async getVaultCredentials(): Promise<{ apiUrl: string; apiKey: string } | null> {
    const { getIntegrationService } = await import("@/modules/integrations/module");
    const result = await getIntegrationService().resolveVaultValues("sembark");
    if (!result.ok) return null;
    const apiKey = result.value.apiKey?.trim();
    const apiUrl = (result.value.apiUrl || "https://api.sembark.com/v1").trim();
    if (!apiKey) return null;
    return { apiUrl, apiKey };
  }

  /**
   * Pushes a newly created Enquiry to Sembark as a Lead.
   * Skips silently when Sembark is not configured in Integrations.
   */
  async pushLead(enquiry: Enquiry): Promise<Result<void, AppError>> {
    this.logger.info("Pushing lead to Sembark", { enquiryId: enquiry.id });

    try {
      const creds = await this.getVaultCredentials();
      if (!creds) {
        this.logger.info("Sembark not configured in Integrations — skipping lead push", {
          enquiryId: enquiry.id,
        });
        return ok(undefined);
      }

      const response = await fetch(`${creds.apiUrl.replace(/\/$/, "")}/leads`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${creds.apiKey}`,
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
   * Booking sync is not used for Sembark (lead management only).
   */
  async pushBooking(booking: { id: string; bookingNumber?: string }): Promise<Result<void, AppError>> {
    this.logger.info("Skipping Sembark booking push (lead management only)", {
      bookingId: booking.id,
      bookingNumber: booking.bookingNumber,
    });
    return ok(undefined);
  }

  /**
   * Inventory sync is not supported — Sembark is lead management only.
   * Kept for webhook compatibility; always a no-op.
   */
  async syncInventory(): Promise<Result<{ synced: number }, AppError>> {
    this.logger.info("Sembark inventory sync skipped (lead management only)");
    return ok({ synced: 0 });
  }
}
