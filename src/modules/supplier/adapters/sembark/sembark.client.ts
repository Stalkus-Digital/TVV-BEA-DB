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
    return this.postToSembark("/leads", {
      sourceId: lead.id,
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
      source: "TVV Website",
      sourceUrl: lead.sourceUrl,
      createdAt: lead.createdAt.toISOString(),
    });
  }

  async syncCustomer(customer: any): Promise<Result<void, AppError>> {
    return this.postToSembark("/customers", {
      customerId: customer.id,
      firstName: customer.firstName,
      lastName: customer.lastName,
      email: customer.email,
      phone: customer.phone,
    });
  }

  async syncBooking(booking: any): Promise<Result<void, AppError>> {
    return this.postToSembark("/bookings", {
      bookingId: booking.id,
      bookingNumber: booking.bookingNumber,
      totalAmount: booking.totalAmount,
      currency: booking.currency,
      status: booking.status,
      paymentStatus: booking.paymentStatus,
      createdAt: booking.createdAt,
    });
  }

  async syncBookingStatus(bookingId: string, status: string): Promise<Result<void, AppError>> {
    return this.postToSembark(`/bookings/${bookingId}/status`, { status });
  }

  async syncPayment(bookingId: string, payment: any): Promise<Result<void, AppError>> {
    return this.postToSembark(`/bookings/${bookingId}/payments`, {
      paymentId: payment.id,
      amount: payment.amount,
      method: payment.method,
      status: payment.status,
      reference: payment.reference,
    });
  }

  private async postToSembark(endpoint: string, payload: any): Promise<Result<void, AppError>> {
    try {
      const { webhookUrl, apiKey } = await this.getCredentials();
      const baseUrl = webhookUrl.replace(/\/v1\/leads$/, "/v1").replace(/\/$/, "");
      const fullUrl = `${baseUrl}${endpoint}`;

      if (apiKey === "MOCK_SEMBARK_KEY") {
        this.logger.info(`Mock Sembark POST ${endpoint}`, { payload });
        await new Promise((resolve) => setTimeout(resolve, 300));
        return ok(undefined);
      }

      const response = await fetch(fullUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Sembark returned ${response.status}`);
      }

      return ok(undefined);
    } catch (error) {
      this.logger.error(`Failed to push to Sembark ${endpoint}`, { error });
      return err(new InternalError(`Failed to push to Sembark ${endpoint}`));
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
