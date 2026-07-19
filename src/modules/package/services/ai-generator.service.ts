import { BaseService, type ServiceContext } from "@/shared/services";
import { ok, err, type Result } from "@/shared/types";
import { InternalError, ValidationError, type AppError } from "@/shared/errors";
import OpenAI from "openai";
import { z } from "zod";
import {
  buildAiPackageContext,
  type AiCatalogEntry,
  type AiHotelCatalogEntry,
  type AiPackageContext,
} from "./ai-package-context.service";

const ItineraryItemSchema = z.object({
  title: z.string(),
  description: z.string(),
  kind: z.enum(["FLIGHT", "HOTEL", "ACTIVITY", "TRANSFER", "MEALS"]),
  /** Required when matching inventory — must be an id from the provided catalogs */
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
  activityCatalogSize?: number;
  ferryCatalogSize?: number;
  warnings?: string[];
};

const JSON_EXAMPLE = `{
  "title": "Andaman Island Escape",
  "durationDays": 5,
  "durationNights": 4,
  "basePrice": 85000,
  "inclusions": ["Hotel stays", "Ferry transfer", "Breakfast"],
  "exclusions": ["Flights", "Personal expenses"],
  "days": [
    {
      "dayNumber": 1,
      "title": "Arrival & Port Blair",
      "items": [
        {
          "kind": "HOTEL",
          "title": "Example Hotel",
          "description": "Check-in and evening at leisure",
          "inventoryItemId": "clxxx_hotel_id_or_null"
        },
        {
          "kind": "ACTIVITY",
          "title": "Cellular Jail Light & Sound",
          "description": "Evening show",
          "inventoryItemId": "clxxx_activity_id_or_null"
        }
      ]
    }
  ]
}`;

function formatHotelCatalog(hotels: AiHotelCatalogEntry[]): string {
  if (hotels.length === 0) {
    return "No hotels in inventory. If you include HOTEL, invent a descriptive title and leave inventoryItemId null.";
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

function formatCatalog(entries: AiCatalogEntry[], emptyMessage: string): string {
  if (entries.length === 0) return emptyMessage;
  return entries
    .map((e) => {
      const parts = [
        `id=${e.id}`,
        `title="${e.title}"`,
        e.location ? `location="${e.location}"` : null,
        e.priceInr != null ? `priceINR=${e.priceInr}` : null,
        e.mode ? `mode=${e.mode}` : null,
      ].filter(Boolean);
      return `- ${parts.join(", ")}`;
    })
    .join("\n");
}

function openaiErrorMessage(error: unknown): string {
  if (error instanceof z.ZodError) {
    return `OpenAI response failed schema validation: ${error.issues
      .slice(0, 5)
      .map((i) => `${i.path.join(".") || "root"}: ${i.message}`)
      .join("; ")}`;
  }
  if (error instanceof SyntaxError) {
    return `OpenAI returned invalid JSON: ${error.message}`;
  }
  if (error && typeof error === "object") {
    const e = error as {
      message?: string;
      status?: number;
      code?: string;
      error?: { message?: string; code?: string };
    };
    const status = e.status;
    const code = e.code ?? e.error?.code;
    const msg = e.error?.message ?? e.message;
    if (status === 401 || code === "invalid_api_key") {
      return "OpenAI API key was rejected (401). Re-save and Test your key in Integrations → OpenAI.";
    }
    if (status === 429) {
      return "OpenAI rate limit exceeded. Wait a moment and try again.";
    }
    if (typeof msg === "string" && msg.trim()) {
      return status ? `OpenAI error (${status}): ${msg}` : msg;
    }
  }
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }
  return "Failed to generate package via OpenAI";
}

function pinCatalogItem(
  item: z.infer<typeof ItineraryItemSchema>,
  catalog: AiCatalogEntry[]
): z.infer<typeof ItineraryItemSchema> {
  const catalogIds = new Set(catalog.map((c) => c.id));
  const id = item.inventoryItemId?.trim() || null;
  if (id && catalogIds.has(id)) {
    const match = catalog.find((c) => c.id === id)!;
    return { ...item, inventoryItemId: id, title: match.title };
  }
  const byTitle = catalog.find((c) => c.title.toLowerCase() === item.title.toLowerCase());
  if (byTitle) {
    return { ...item, inventoryItemId: byTitle.id, title: byTitle.title };
  }
  return { ...item, inventoryItemId: null };
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

  private buildSystemPrompt(context: AiPackageContext, destination: string, duration: string, budget: string): string {
    return `You are an expert Luxury Travel Consultant for TVV Travel OS.
Generate a comprehensive travel itinerary from the user's prompt using REAL inventory when available.

Target Destination: ${context.destinationName ?? destination}
Duration string: ${duration}
Budget level: ${budget}
Stay window (for rate context): ${context.checkIn} → ${context.checkOut}
TripJack live rates included: ${context.tripjackUsed ? "yes" : "no"}

Hotel catalog (HOTEL items MUST use an id from this list when non-empty):
${formatHotelCatalog(context.hotels)}

Activity catalog (prefer ACTIVITY items from this list by id when non-empty):
${formatCatalog(context.activities, "No activities in inventory. Invent descriptive ACTIVITY titles and leave inventoryItemId null.")}

Ferry / transfer catalog (prefer TRANSFER ferry items from this list by id when non-empty):
${formatCatalog(context.ferries, "No ferry transfers in inventory. Invent descriptive TRANSFER titles and leave inventoryItemId null.")}

Instructions:
1. 'basePrice' MUST be a realistic estimated integer in INR (use liveTripJackRateINR / avgRateINR / priceINR when present).
2. 'kind' for items MUST be one of: FLIGHT, HOTEL, ACTIVITY, TRANSFER, MEALS.
3. For HOTEL when the hotel catalog is non-empty: set inventoryItemId to an exact catalog id and title to that hotel's title.
4. For ACTIVITY when the activity catalog is non-empty: prefer exact catalog ids; otherwise leave inventoryItemId null.
5. For TRANSFER ferry legs when the ferry catalog is non-empty: prefer exact catalog ids; otherwise leave inventoryItemId null.
6. Do NOT invent inventory IDs. FLIGHT / MEALS: leave inventoryItemId null.
7. Keep the package title premium and enticing.
8. Ensure 'days' array length matches the days in the duration string.
9. MUST RETURN VALID JSON matching this example shape exactly (values are illustrative):
${JSON_EXAMPLE}`;
  }

  private normalizePackage(
    parsed: z.infer<typeof PackageGeneratorSchema>,
    context: AiPackageContext
  ): GeneratedPackage {
    return {
      ...parsed,
      destinationId: context.destinationId,
      tripjackUsed: context.tripjackUsed,
      hotelCatalogSize: context.hotels.length,
      activityCatalogSize: context.activities.length,
      ferryCatalogSize: context.ferries.length,
      warnings: context.warnings,
      days: parsed.days.map((day) => ({
        ...day,
        items: day.items.map((item) => {
          if (item.kind === "HOTEL") return pinCatalogItem(item, context.hotels);
          if (item.kind === "ACTIVITY") return pinCatalogItem(item, context.activities);
          if (item.kind === "TRANSFER") return pinCatalogItem(item, context.ferries);
          return { ...item, inventoryItemId: null };
        }),
      })),
    };
  }

  private async callOpenAi(
    openai: OpenAI,
    systemPrompt: string,
    userPrompt: string,
    repairHint?: string
  ): Promise<string> {
    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ];
    if (repairHint) {
      messages.push({
        role: "user",
        content: `Your previous JSON failed validation. Fix and return ONLY valid JSON.\nValidation errors:\n${repairHint}`,
      });
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages,
      response_format: { type: "json_object" },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) throw new Error("Empty content from OpenAI");
    return content;
  }

  async generatePackage(
    prompt: string,
    destination: string,
    duration: string,
    budget: string,
    retries = 1
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
      return err(new InternalError("Failed to load inventory catalog for AI package builder"));
    }

    const systemPrompt = this.buildSystemPrompt(context, destination, duration, budget);
    let lastErrorMessage = "Failed to generate package via OpenAI";

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        let content = await this.callOpenAi(openai, systemPrompt, prompt);
        let raw: unknown;
        try {
          raw = JSON.parse(content);
        } catch (parseErr) {
          throw parseErr;
        }

        let safe = PackageGeneratorSchema.safeParse(raw);
        if (!safe.success) {
          const zodText = safe.error.issues
            .slice(0, 8)
            .map((i) => `${i.path.join(".") || "root"}: ${i.message}`)
            .join("\n");
          this.logger.warn("AI package schema miss; attempting one repair pass", { zodText });
          content = await this.callOpenAi(openai, systemPrompt, prompt, zodText);
          raw = JSON.parse(content);
          safe = PackageGeneratorSchema.safeParse(raw);
          if (!safe.success) {
            throw safe.error;
          }
        }

        const normalized = this.normalizePackage(safe.data, context);
        this.logger.info("Successfully generated AI package", {
          title: normalized.title,
          hotelsPinned: normalized.days
            .flatMap((d) => d.items)
            .filter((i) => i.kind === "HOTEL" && i.inventoryItemId).length,
          activitiesPinned: normalized.days
            .flatMap((d) => d.items)
            .filter((i) => i.kind === "ACTIVITY" && i.inventoryItemId).length,
          ferriesPinned: normalized.days
            .flatMap((d) => d.items)
            .filter((i) => i.kind === "TRANSFER" && i.inventoryItemId).length,
          tripjackUsed: context.tripjackUsed,
          warningCount: context.warnings.length,
        });
        return ok(normalized);
      } catch (error) {
        lastErrorMessage = openaiErrorMessage(error);
        this.logger.error("OpenAI Generation Error", {
          attempt,
          message: lastErrorMessage,
          error,
        });
        if (attempt >= retries) break;
        this.logger.info("Retrying AI package generation...");
      }
    }

    return err(new InternalError(lastErrorMessage));
  }
}
