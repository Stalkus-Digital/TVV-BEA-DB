import { BaseService, type ServiceContext } from "@/shared/services";
import { ok, err, type Result } from "@/shared/types";
import { InternalError, type AppError } from "@/shared/errors";
import OpenAI from "openai";

export class OpenAIService extends BaseService {
  private openai: OpenAI | null = null;

  constructor(context: ServiceContext) {
    super(context);
    
    // Lazy initialization of OpenAI client
    const apiKey = process.env.OPENAI_API_KEY;
    if (apiKey) {
      this.openai = new OpenAI({ apiKey });
    } else {
      this.logger.warn("OPENAI_API_KEY is not set. OpenAIService will be disabled.");
    }
  }

  /**
   * Generates a travel package itinerary using OpenAI
   */
  async generatePackageItinerary(prompt: string): Promise<Result<any, AppError>> {
    if (!this.openai) {
      return err(new InternalError("OpenAI API is not configured."));
    }

    try {
      this.logger.info("Calling OpenAI to generate package itinerary", { promptLength: prompt.length });
      
      const response = await this.openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are an expert travel agent. Generate a detailed travel package itinerary based on the user's request. 
Return the output strictly as a JSON object with the following structure:
{
  "title": "...",
  "description": "...",
  "destinations": ["..."],
  "durationDays": 7,
  "itinerary": [
    { "day": 1, "title": "...", "activities": ["..."] }
  ]
}`
          },
          { role: "user", content: prompt }
        ],
        response_format: { type: "json_object" },
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error("Empty response from OpenAI");
      }

      const packageData = JSON.parse(content);
      return ok(packageData);
    } catch (error: any) {
      this.logger.error("Failed to generate package via OpenAI", { error: error.message });
      return err(new InternalError(`OpenAI generation failed: ${error.message}`));
    }
  }
}
