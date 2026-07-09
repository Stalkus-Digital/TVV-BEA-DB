import { BaseService, type ServiceContext } from "@/shared/services";
import { ok, err, type Result } from "@/shared/types";
import { InternalError, type AppError } from "@/shared/errors";
import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
import { z } from "zod";

// Structured output schema
const ItineraryItemSchema = z.object({
  title: z.string(),
  description: z.string(),
  kind: z.enum(["FLIGHT", "HOTEL", "ACTIVITY", "TRANSFER", "MEALS"]),
});

const ItineraryDaySchema = z.object({
  dayNumber: z.number(),
  title: z.string(),
  items: z.array(ItineraryItemSchema),
});

const PackageGeneratorSchema = z.object({
  title: z.string(),
  durationDays: z.number(),
  durationNights: z.number(),
  basePrice: z.number().describe("Estimated base price for two adults in INR"),
  inclusions: z.array(z.string()),
  exclusions: z.array(z.string()),
  days: z.array(ItineraryDaySchema),
});

export type GeneratedPackage = z.infer<typeof PackageGeneratorSchema>;

export class AiGeneratorService extends BaseService {
  private openai: OpenAI;

  constructor(context: ServiceContext) {
    super(context);
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || "",
    });
  }

  async generatePackage(prompt: string, destination: string, duration: string, budget: string): Promise<Result<GeneratedPackage, AppError>> {
    this.logger.info("Generating AI Package", { destination, duration, budget });

    if (!process.env.OPENAI_API_KEY) {
      return err(new InternalError("OpenAI API key is missing"));
    }

    try {
      const systemPrompt = `You are an expert Luxury Travel Consultant for TVV Travel OS.
Your job is to generate a comprehensive, highly-detailed travel itinerary based on the user's prompt.
Target Destination: ${destination}
Duration string: ${duration}
Budget level: ${budget}

Instructions:
1. 'basePrice' MUST be a realistic estimated integer in INR.
2. 'kind' for items MUST be one of: FLIGHT, HOTEL, ACTIVITY, TRANSFER, MEALS.
3. Keep the 'title' of the package premium and enticing.
4. Ensure 'days' array length matches the days in the 'duration'.
5. MUST RETURN VALID JSON matching the schema exactly.`;

      const response = await this.openai.chat.completions.create({
        model: "gpt-4o-mini", // Using gpt-4o-mini for speed and cost-effectiveness
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt },
        ],
        response_format: { type: "json_object" },
      });

      const content = response.choices[0].message.content;
      if (!content) return err(new InternalError("Failed to parse OpenAI response"));
      const result = PackageGeneratorSchema.parse(JSON.parse(content));
      
      if (!result) {
        return err(new InternalError("Failed to parse OpenAI response"));
      }

      this.logger.info("Successfully generated AI package", { title: result.title });
      return ok(result);
    } catch (error) {
      this.logger.error("OpenAI Generation Error", { error });
      return err(new InternalError("Failed to generate package via OpenAI"));
    }
  }
}
