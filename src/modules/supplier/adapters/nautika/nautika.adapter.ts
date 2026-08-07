import { BaseService, type ServiceContext } from "@/shared/services";
import { ok, err, type Result } from "@/shared/types";
import { InternalError, type AppError } from "@/shared/errors";

export class NautikaAdapter extends BaseService {
  constructor(context: ServiceContext) {
    super(context);
  }

  private async getCredentials() {
    // Will be loaded from integration config when provided
    return {
      apiUrl: process.env.NAUTIKA_API_URL || "https://api.nautika.example.com",
      username: process.env.NAUTIKA_USERNAME || "",
      password: process.env.NAUTIKA_PASSWORD || "",
    };
  }

  async getTripData(from: string, to: string, date: string): Promise<Result<any, AppError>> {
    try {
      const { apiUrl, username, password } = await this.getCredentials();
      
      this.logger.info(`Nautika getTripData called: ${from} to ${to} on ${date}`);
      
      const response = await fetch(`${apiUrl}/api/v1/getTripData`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${password}` // Example auth
        },
        body: JSON.stringify({ from, to, date, username }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        return err(new InternalError(`Nautika API returned status ${response.status}: ${JSON.stringify(data)}`));
      }

      return ok(data.data || data);
    } catch (error: any) {
      this.logger.error("Nautika request exception", { error: error.message });
      return err(new InternalError(`Failed to fetch from Nautika: ${error.message}`));
    }
  }
}
