import { getIntegrationConfigResolver } from "@/modules/integrations";
import { BaseService, type ServiceContext } from "@/shared/services";
import { ok, err, type Result } from "@/shared/types";
import { InternalError, type AppError } from "@/shared/errors";

export class MakruzzAdapter extends BaseService {
  private token: string | null = null;
  private tokenExpiry: number = 0;

  constructor(context: ServiceContext) {
    super(context);
  }

  private async getCredentials() {
    const { getIntegrationConfigResolver } = await import("@/modules/integrations");
    const cfg = await getIntegrationConfigResolver().getMakruzzConfig();
    if (!cfg.apiUrl || !cfg.username || !cfg.password) {
      throw new Error("Makruzz credentials are not fully configured");
    }
    return {
      apiUrl: cfg.apiUrl.replace(/\/$/, ""),
      username: cfg.username,
      password: cfg.password,
    };
  }

  /**
   * Authenticate with Makruzz and get the `Mak_Authorization` token.
   * Caches the token in memory for 1 hour.
   */
  async login(): Promise<Result<string, AppError>> {
    try {
      if (this.token && Date.now() < this.tokenExpiry) {
        return ok(this.token);
      }

      const { apiUrl, username, password } = await this.getCredentials();
      const response = await fetch(`${apiUrl}/api/v12/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();
      if (!response.ok || !data.token) {
        this.logger.error("Makruzz login failed", { data });
        return err(new InternalError(`Makruzz login failed: ${data.message || response.statusText}`));
      }

      this.token = data.token;
      this.tokenExpiry = Date.now() + 60 * 60 * 1000; // 1 hour
      return ok(this.token as string);
    } catch (error: any) {
      this.logger.error("Makruzz login exception", { error: error.message });
      return err(new InternalError("Failed to login to Makruzz"));
    }
  }

  private async request<T>(endpoint: string, method: "GET" | "POST" | "PUT" | "DELETE" = "GET", body?: any): Promise<Result<T, AppError>> {
    try {
      const tokenResult = await this.login();
      if (!tokenResult.ok) return err(tokenResult.error);

      const { apiUrl } = await this.getCredentials();
      const response = await fetch(`${apiUrl}${endpoint}`, {
        method,
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Mak_Authorization": tokenResult.value,
        },
        body: body ? JSON.stringify(body) : undefined,
      });

      const data = await response.json();
      if (!response.ok || data.status === "error" || data.status === 0) {
        this.logger.error(`Makruzz API error [${endpoint}]`, { data });
        return err(new InternalError(`Makruzz API Error: ${data.message || data.error || response.statusText}`));
      }

      return ok(data as T);
    } catch (error: any) {
      this.logger.error(`Makruzz request exception [${endpoint}]`, { error: error.message });
      return err(new InternalError(`Failed to fetch from Makruzz: ${error.message}`));
    }
  }

  async getSectors(): Promise<Result<any, AppError>> {
    return this.request("/api/v12/get_sectors");
  }

  async scheduleSearch(sourceId: string, destinationId: string, journeyDate: string): Promise<Result<any, AppError>> {
    return this.request("/api/v12/schedule_search", "POST", {
      source: sourceId,
      destination: destinationId,
      journey_date: journeyDate,
    });
  }

  async scheduleSearchRange(sourceId: string, destinationId: string, fromDate: string, toDate: string): Promise<Result<any, AppError>> {
    return this.request("/api/v12/schedule_search_range", "POST", {
      source: sourceId,
      destination: destinationId,
      from_date: fromDate,
      to_date: toDate,
    });
  }

  async savePassengers(payload: any): Promise<Result<any, AppError>> {
    return this.request("/api/v12/savePassengers", "POST", payload);
  }

  async confirmBooking(paymentId: string, referenceId: string): Promise<Result<any, AppError>> {
    return this.request("/api/v12/confirm_booking", "POST", {
      payment_id: paymentId,
      reference_id: referenceId,
    });
  }

  async printTicket(pnr: string): Promise<Result<any, AppError>> {
    return this.request("/api/v12/print_ticket", "POST", { pnr });
  }

  async bookingCancel(pnr: string, ticketNos: string[]): Promise<Result<any, AppError>> {
    return this.request("/api/v12/booking_cancel", "POST", {
      pnr,
      ticket_nos: ticketNos.join(","),
    });
  }

  async walletBalance(): Promise<Result<any, AppError>> {
    return this.request("/api/v12/wallet_balance");
  }
}

let makruzzSingleton: MakruzzAdapter | null = null;
export function getMakruzzAdapter(context: ServiceContext): MakruzzAdapter {
  if (!makruzzSingleton) makruzzSingleton = new MakruzzAdapter(context);
  return makruzzSingleton;
}
