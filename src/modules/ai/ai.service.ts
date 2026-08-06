import { BaseService, type ServiceContext } from "@/shared/services";
import { ok, err, type Result } from "@/shared/types";
import { InternalError, type AppError } from "@/shared/errors";
import { prisma } from "@/shared/database/prisma-client";
import type { Package as HolidayPackage, Prisma } from "@/generated/prisma/client";

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

      // 1. Fetch Destination and its children to get the location context
      const allDestinations = await prisma.destination.findMany({
        select: { id: true, parentDestinationId: true, name: true }
      });
      const targetDestination = allDestinations.find(d => d.id === data.destination);
      if (!targetDestination) {
        return err(new InternalError(`Destination not found: ${data.destination}`));
      }

      // Build set of valid IDs (self + all direct children/descendants in this small tree)
      const validDestinationIds = new Set<string>([data.destination]);
      let added = true;
      while (added) {
        added = false;
        for (const dest of allDestinations) {
          if (dest.parentDestinationId && validDestinationIds.has(dest.parentDestinationId) && !validDestinationIds.has(dest.id)) {
            validDestinationIds.add(dest.id);
            added = true;
          }
        }
      }

      // 2. Fetch real inventory for these locations
      const inventoryItems = await prisma.inventoryItem.findMany({
        where: {
          destinationId: { in: Array.from(validDestinationIds) },
          status: "ACTIVE"
        },
        select: { id: true, kind: true, title: true, destinationId: true }
      });

      const hotels = inventoryItems.filter(i => i.kind === "HOTEL").map(i => ({ id: i.id, name: i.title }));
      const activities = inventoryItems.filter(i => i.kind === "ACTIVITY").map(i => ({ id: i.id, name: i.title }));

      const prompt = `
      You are an expert travel agent. Generate a detailed, enticing holiday package for ${targetDestination.name} for ${data.durationDays} days.
      The theme is ${data.theme || "general leisure"}.
      
      IMPORTANT: You must build the itinerary using ONLY the following real hotels and activities from our inventory. Do not invent fake hotels or activities.
      
      Available Hotels:
      ${JSON.stringify(hotels)}
      
      Available Activities:
      ${JSON.stringify(activities)}
      
      Respond strictly in JSON format matching this schema:
      {
        "title": "String (catchy title)",
        "description": "String (enticing description)",
        "price": number (estimated price in INR),
        "days": [
          {
            "dayNumber": number,
            "title": "String (day title)",
            "description": "String (what happens on this day)",
            "items": [
              {
                "kind": "HOTEL" | "ACTIVITY" | "TRANSFER",
                "inventoryItemId": "String (Must match one of the provided IDs, null if TRANSFER)",
                "title": "String (name of the hotel/activity/transfer)",
                "description": "String (short description)"
              }
            ]
          }
        ]
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

      const daysData = parsed.days || [];
      const packageDays: Prisma.PackageDayCreateWithoutPackageInput[] = daysData.map((day: any, dIdx: number) => ({
        dayNumber: day.dayNumber || dIdx + 1,
        title: day.title || `Day ${dIdx + 1}`,
        description: day.description || "",
        items: {
          create: (day.items || []).map((item: any, idx: number) => ({
            kind: item.kind || "ACTIVITY",
            resolutionMode: item.inventoryItemId ? "INVENTORY" : "MANUAL",
            inventoryItemId: item.inventoryItemId || null,
            title: item.title || "Activity",
            description: item.description || null,
            pricingMode: "INCLUDED",
            position: idx,
            images: [],
          }))
        }
      }));

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
          days: {
            create: packageDays
          }
        }
      });

      return ok(newPackage);
    } catch (error) {
      this.logger.error("Failed to generate AI package", { error, data });
      return err(new InternalError("Failed to generate AI holiday package"));
    }
  }
}
