import { BaseService, type ServiceContext } from "@/shared/services";
import { ok, err, type Result } from "@/shared/types";
import { InternalError, type AppError } from "@/shared/errors";
import { prisma } from "@/shared/database/prisma-client";
import type { Package as HolidayPackage } from "@/generated/prisma/client";

export interface GeneratePackageDto {
  destination: string;
  durationDays: number;
  theme?: string;
}

export class AIService extends BaseService {
  constructor(context: ServiceContext) {
    super(context);
  }

  async generateHolidayPackage(data: GeneratePackageDto): Promise<Result<HolidayPackage, AppError>> {
    try {
      const { getIntegrationConfigResolver } = await import("@/modules/integrations");
      const openAiKey = await getIntegrationConfigResolver().getOpenAiApiKey();
      if (!openAiKey) {
        return err(new InternalError("OpenAI API key is missing"));
      }

      this.logger.info("Generating AI package", { destination: data.destination });

      const prompt = `
      You are an expert travel agent. Generate a detailed, enticing holiday package for ${data.destination} for ${data.durationDays} days.
      The theme is ${data.theme || "general leisure"}.
      
      Respond strictly in JSON format matching this schema:
      {
        "title": "String (catchy title)",
        "description": "String (enticing description)",
        "price": number (estimated price in INR)
      }
      `;

      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${openAiKey}`
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.7,
        })
      });

      if (!response.ok) {
        throw new Error(`OpenAI returned ${response.status}`);
      }

      const aiData = await response.json();
      const content = aiData.choices?.[0]?.message?.content;
      if (!content) throw new Error("No content from OpenAI");

      const parsed = JSON.parse(content);
      

      
      const startDate = new Date();
      startDate.setDate(startDate.getDate() + 14); // 2 weeks from now
      
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + data.durationDays);

      const newPackage = await prisma.package.create({
        data: {
          title: parsed.title,
          code: `AI-${Date.now()}`,
          slug: `ai-${Date.now()}`,
          destinationId: data.destination,
          sourceType: "AI",
          durationDays: data.durationDays,
          durationNights: data.durationDays - 1,
          status: "DRAFT",
          seo: {},
          faqs: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        }
      });

      return ok(newPackage);
    } catch (error) {
      this.logger.error("Failed to generate AI package", { error, data });
      return err(new InternalError("Failed to generate AI holiday package"));
    }
  }
}
