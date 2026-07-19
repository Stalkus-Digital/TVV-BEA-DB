import { BaseService, type ServiceContext } from "@/shared/services";
import { ok, err, type Result } from "@/shared/types";
import { InternalError, ValidationError, type AppError } from "@/shared/errors";
import OpenAI from "openai";
import { z } from "zod";
import {
  buildAiPackageContext,
  type AiHotelCatalogEntry,
  type AiPackageContext,
} from "./ai-package-context.service";

const ItineraryItemSchema = z.object({
  title: z.string(),
  description: z.string(),
  kind: z.enum(["FLIGHT", "HOTEL", "ACTIVITY", "TRANSFER", "MEALS"]),
  /** Required for HOTEL when a catalog is provided — must be an id from the hotel list */
  inventoryItemId: z.string().nullable().optional(),
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

export type GeneratedPackage = z.infer<typeof PackageGeneratorSchema> & {
  destinationId?: string | null;
  tripjackUsed?: boolean;
  hotelCatalogSize?: number;
};

function formatHotelCatalog(hotels: AiHotelCatalogEntry[]): string {
  if (hotels.length === 0) {
    return "No hotels are currently in inventory for this destination. Prefer ACTIVITY/TRANSFER/MEALS items; if you must include HOTEL, invent a descriptive title and leave inventoryItemId null.";
  }
  return hotels
    .map((h) => {
      const parts = [
        `id=${h.id}`,
        `title="${h.title}"`,
        h.starRating != null ? `${h.starRating}★` : null,
        h.address ? `address="${h.address}"` : null,
        h.avgRate != null ? `avgRateINR=${h.avgRate}` : null,
        h.liveRateInr != null ? `liveTripJackRateINR=${h.liveRateInr}` : null,
      ].filter(Boolean);
      return `- ${parts.join(", ")}`;
    })
    .join("\n");
}

export class AiGeneratorService extends BaseService {
  constructor(context: ServiceContext) {
    super(context);
  }

  /** OpenAI key must be saved in Integrations vault (not .env alone). */
  private async getOpenAiClientFromVault(): Promise<OpenAI | null> {
    const { getIntegrationService } = await import("@/modules/integrations");
    const vault = await getIntegrationService().resolveVaultValues("openai");
    if (!vault.ok) return null;
    const apiKey = vault.value.apiKey?.trim();
    if (!apiKey) return null;
    return new OpenAI({ apiKey });
  }

  async generatePackage(
    prompt: string,
    destination: string,
    duration: string,
    budget: string,
    retries = 2
  ): Promise<Result<GeneratedPackage, AppError>> {
    this.logger.info("Generating AI Package", { destination, duration, budget, retries });

    const openai = await this.getOpenAiClientFromVault();
    if (!openai) {
      return err(
        new ValidationError(
          "OpenAI is not connected. Save your API key in Integrations → OpenAI and run Test connection."
        )
      );
    }

    let context: AiPackageContext;
    try {
      context = await buildAiPackageContext(destination, duration);
    } catch (error) {
      this.logger.error("Failed to build AI package context", { error });
      return err(new InternalError("Failed to load hotels for AI package builder"));
    }

    const catalogIds = new Set(context.hotels.map((h) => h.id));
    const hotelCatalogBlock = formatHotelCatalog(context.hotels);

    try {
      const systemPrompt = `You are an expert Luxury Travel Consultant for TVV Travel OS.
Generate a comprehensive travel itinerary from the user's prompt using REAL hotels from inventory when available.

Target Destination: ${context.destinationName ?? destination}
Duration string: ${duration}
Budget level: ${budget}
Stay window (for rate context): ${context.checkIn} → ${context.checkOut}
TripJack live rates included: ${context.tripjackUsed ? "yes" : "no"}

Hotel catalog (choose HOTEL stays ONLY from this list by inventory id):
${hotelCatalogBlock}

Instructions:
1. 'basePrice' MUST be a realistic estimated integer in INR (use liveTripJackRateINR / avgRateINR when present).
2. 'kind' for items MUST be one of: FLIGHT, HOTEL, ACTIVITY, TRANSFER, MEALS.
3. For every HOTEL item when the catalog is non-empty: set inventoryItemId to an exact id from the catalog, and set title to that hotel's title.
4. Do NOT invent hotel inventory IDs. If the catalog is empty, set inventoryItemId to null for HOTEL items.
5. FLIGHT / ACTIVITY / TRANSFER / MEALS: leave inventoryItemId null; write clear titles and descriptions.
6. Keep the package title premium and enticing.
7. Ensure 'days' array length matches the days in the duration string.
8. MUST RETURN VALID JSON matching the schema exactly.`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt },
        ],
        response_format: { type: "json_object" },
      });

      const content = response.choices[0].message.content;
      if (!content) throw new Error("Empty content from OpenAI");

      const parsed = PackageGeneratorSchema.parse(JSON.parse(content));

      // Normalize HOTEL inventory ids against catalog
      const normalized: GeneratedPackage = {
        ...parsed,
        destinationId: context.destinationId,
        tripjackUsed: context.tripjackUsed,
        hotelCatalogSize: context.hotels.length,
        days: parsed.days.map((day) => ({
          ...day,
          items: day.items.map((item) => {
            if (item.kind !== "HOTEL") {
              return { ...item, inventoryItemId: null };
            }
            const id = item.inventoryItemId?.trim() || null;
            if (id && catalogIds.has(id)) {
              const hotel = context.hotels.find((h) => h.id === id)!;
              return { ...item, inventoryItemId: id, title: hotel.title };
            }
            // Try fuzzy match by title against catalog
            const byTitle = context.hotels.find(
              (h) => h.title.toLowerCase() === item.title.toLowerCase()
            );
            if (byTitle) {
              return { ...item, inventoryItemId: byTitle.id, title: byTitle.title };
            }
            return { ...item, inventoryItemId: null };
          }),
        })),
      };

      this.logger.info("Successfully generated AI package", {
        title: normalized.title,
        hotelsPinned: normalized.days
          .flatMap((d) => d.items)
          .filter((i) => i.kind === "HOTEL" && i.inventoryItemId).length,
        tripjackUsed: context.tripjackUsed,
      });
      return ok(normalized);
    } catch (error) {
      this.logger.error("OpenAI Generation Error", { error });
      if (retries > 0) {
        this.logger.info("Retrying AI package generation...");
        return this.generatePackage(prompt, destination, duration, budget, retries - 1);
      }
      return err(new InternalError("Failed to generate package via OpenAI after retries"));
    }
  }
}
