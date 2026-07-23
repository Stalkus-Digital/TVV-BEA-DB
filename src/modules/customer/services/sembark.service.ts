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
      // User requested fixed token for Sembark CRM integration
      const apiKey = "947|RJhx2Fu56QFQkrNDIpkdr2kBG92wXn3j5VcjLMPV7590866f";
      const apiUrl = "https://api.sembark.com/integrations/v1/trip-plan-requests";

      const payload = {
        source: "TVV Travel OS",
        name: enquiry.name || "Unknown",
        email: enquiry.email || "",
        phone: enquiry.phone || "",
        details: enquiry.message || "",
        destination: enquiry.destinationSlug || "",
        status: enquiry.status
      };

      let attempt = 0;
      let success = false;
      while (attempt < 3 && !success) {
        try {
          const response = await fetch(apiUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify(payload),
          });
          
          if (!response.ok) {
            throw new Error(`Sembark API returned ${response.status}`);
          }
          success = true;
        } catch (err: any) {
          attempt++;
          this.logger.warn(`Sembark pushLead failed (attempt ${attempt}/3)`, { error: err.message, enquiryId: enquiry.id });
          if (attempt >= 3) throw err;
          await new Promise(res => setTimeout(res, Math.pow(2, attempt) * 1000));
        }
      }

      this.logger.info("Successfully pushed lead to Sembark", { enquiryId: enquiry.id });
      return ok(undefined);
    } catch (error) {
      this.logger.error("Failed to push lead to Sembark", { error, enquiryId: enquiry.id });
      return err(new InternalError("Failed to synchronize lead with Sembark"));
    }
  }

  /**
   * Pushes booking details and status to Sembark CRM.
   */
  async pushBooking(booking: any): Promise<Result<void, AppError>> {
    this.logger.info("Pushing booking to Sembark CRM", { bookingId: booking.id });
    try {
      const apiKey = "947|RJhx2Fu56QFQkrNDIpkdr2kBG92wXn3j5VcjLMPV7590866f";
      const apiUrl = "https://api.sembark.com/integrations/v1/bookings";

      const payload = {
        source: "TVV Travel OS",
        bookingId: booking.id,
        bookingNumber: booking.bookingNumber,
        totalAmount: booking.totalAmount,
        status: booking.status,
        paymentStatus: booking.paymentStatus,
        createdAt: booking.createdAt,
      };

      let attempt = 0;
      let success = false;
      while (attempt < 3 && !success) {
        try {
          const response = await fetch(apiUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify(payload),
          });
          
          if (!response.ok) {
            throw new Error(`Sembark API returned ${response.status}`);
          }
          success = true;
        } catch (err: any) {
          attempt++;
          this.logger.warn(`Sembark pushBooking failed (attempt ${attempt}/3)`, { error: err.message, bookingId: booking.id });
          if (attempt >= 3) throw err;
          await new Promise(res => setTimeout(res, Math.pow(2, attempt) * 1000));
        }
      }

      this.logger.info("Successfully pushed booking to Sembark", { bookingId: booking.id });
      return ok(undefined);
    } catch (error) {
      this.logger.error("Failed to push booking to Sembark", { error, bookingId: booking.id });
      return err(new InternalError("Failed to synchronize booking with Sembark"));
    }
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
