import { BaseService, type ServiceContext } from "@/shared/services";
import { ok, err, type Result } from "@/shared/types";
import { InternalError, type AppError } from "@/shared/errors";

export class GreenOceanAdapter extends BaseService {
  constructor(context: ServiceContext) {
    super(context);
  }

  private async getCredentials() {
    return {
      apiUrl: process.env.GREEN_OCEAN_API_URL || "https://api.greenocean.example.com",
      username: process.env.GREEN_OCEAN_USERNAME || "",
      password: process.env.GREEN_OCEAN_PASSWORD || "",
    };
  }

  async getRouteDetails(fromId: number, toId: number, adults: number, infants: number, travelDate: string): Promise<Result<any, AppError>> {
    try {
      const { apiUrl } = await this.getCredentials();
      
      this.logger.info(`Green Ocean getRouteDetails called: ${fromId} to ${toId} on ${travelDate}`);
      
      const response = await fetch(`${apiUrl}/api/v1/route-details`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Add auth headers if needed
        },
        body: JSON.stringify({ from_id: fromId, dest_to: toId, number_of_adults: adults, number_of_infants: infants, travel_date: travelDate }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        return err(new InternalError(`Green Ocean API returned status ${response.status}: ${JSON.stringify(data)}`));
      }

      return ok(data.data || data);
    } catch (error: any) {
      this.logger.error("Green Ocean request exception", { error: error.message });
      return err(new InternalError(`Failed to fetch from Green Ocean: ${error.message}`));
    }
  }
}
