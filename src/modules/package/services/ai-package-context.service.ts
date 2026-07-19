import { prisma } from "@/shared/database/prisma-client";
import { createLogger } from "@/shared/logger";
import { IntegrationStatus } from "@/modules/integrations/types/integration";
import { TransferMode } from "@/modules/inventory/types/kinds/transfer.types";

const logger = createLogger("package.ai.context");

export interface AiCatalogEntry {
  id: string;
  title: string;
  kind: "HOTEL" | "ACTIVITY" | "TRANSFER";
  starRating?: number | null;
  avgRate?: number | null;
  address?: string | null;
  location?: string | null;
  priceInr?: number | null;
  mode?: string | null;
  tjHotelId?: string | null;
  liveRateInr?: number | null;
  currency?: string | null;
}

export interface AiHotelCatalogEntry extends AiCatalogEntry {
  kind: "HOTEL";
  starRating: number | null;
  avgRate: number | null;
  address: string | null;
  tjHotelId: string | null;
  liveRateInr: number | null;
  currency: string | null;
}

export interface AiPackageContext {
  destinationId: string | null;
  destinationName: string | null;
  hotels: AiHotelCatalogEntry[];
  activities: AiCatalogEntry[];
  ferries: AiCatalogEntry[];
  tripjackUsed: boolean;
  warnings: string[];
  checkIn: string;
  checkOut: string;
}

function parseNights(duration: string, fallback = 3): number {
  const nightsMatch = duration.match(/(\d+)\s*nights?/i);
  if (nightsMatch) return Math.max(1, parseInt(nightsMatch[1], 10));
  const daysMatch = duration.match(/(\d+)\s*days?/i);
  if (daysMatch) return Math.max(1, parseInt(daysMatch[1], 10) - 1);
  return fallback;
}

function formatDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function extractTjHotelId(details: unknown): string | null {
  if (!details || typeof details !== "object") return null;
  const d = details as Record<string, unknown>;
  const raw = d.tjHotelId ?? d.hid ?? d.tripjackHotelId;
  if (raw === undefined || raw === null) return null;
  return String(raw);
}

function isFerryTransfer(details: unknown, title: string): boolean {
  if (/ferry/i.test(title)) return true;
  if (!details || typeof details !== "object") return false;
  const d = details as Record<string, unknown>;
  return d.mode === TransferMode.FERRY || String(d.mode ?? "").toUpperCase() === "FERRY";
}

function activityPrice(details: Record<string, unknown>): number | null {
  for (const key of ["offerPrice", "starterPrice", "adultPrice"] as const) {
    const v = details[key];
    if (typeof v === "number") return v;
  }
  return null;
}

/**
 * Loads destination hotels, activities, and ferry transfers from inventory.
 * TripJack hotel-rate enrichment is optional and never blocks generation.
 */
export async function buildAiPackageContext(
  destinationName: string,
  duration: string
): Promise<AiPackageContext> {
  const warnings: string[] = [];
  const nights = parseNights(duration);
  const checkInDate = new Date();
  checkInDate.setDate(checkInDate.getDate() + 14);
  const checkOutDate = new Date(checkInDate);
  checkOutDate.setDate(checkOutDate.getDate() + nights);
  const checkIn = formatDate(checkInDate);
  const checkOut = formatDate(checkOutDate);

  let dest = await prisma.destination.findFirst({
    where: { name: { contains: destinationName, mode: "insensitive" } },
  });
  if (!dest) {
    dest = await prisma.destination.findFirst();
    if (dest) {
      warnings.push(
        `No destination matched "${destinationName}" — using "${dest.name}" as fallback.`
      );
    }
  }

  if (!dest) {
    warnings.push("No destinations found in the database.");
    return {
      destinationId: null,
      destinationName: null,
      hotels: [],
      activities: [],
      ferries: [],
      tripjackUsed: false,
      warnings,
      checkIn,
      checkOut,
    };
  }

  const [hotelRows, activityRows, transferRows] = await Promise.all([
    prisma.inventoryItem.findMany({
      where: { kind: "HOTEL", status: "ACTIVE", destinationId: dest.id },
      orderBy: { title: "asc" },
      take: 80,
    }),
    prisma.inventoryItem.findMany({
      where: { kind: "ACTIVITY", status: "ACTIVE", destinationId: dest.id },
      orderBy: { title: "asc" },
      take: 60,
    }),
    prisma.inventoryItem.findMany({
      where: {
        kind: "TRANSFER",
        status: "ACTIVE",
        OR: [{ destinationId: dest.id }, { title: { contains: "ferry", mode: "insensitive" } }],
      },
      orderBy: { title: "asc" },
      take: 60,
    }),
  ]);

  let hotels: AiHotelCatalogEntry[] = hotelRows.map((row) => {
    const details = (row.details ?? {}) as Record<string, unknown>;
    return {
      id: row.id,
      title: row.title,
      kind: "HOTEL" as const,
      starRating: typeof details.starRating === "number" ? details.starRating : null,
      avgRate: typeof details.avgRate === "number" ? details.avgRate : null,
      address: typeof details.address === "string" ? details.address : null,
      tjHotelId: extractTjHotelId(details),
      liveRateInr: null,
      currency: null,
    };
  });

  const activities: AiCatalogEntry[] = activityRows.map((row) => {
    const details = (row.details ?? {}) as Record<string, unknown>;
    return {
      id: row.id,
      title: row.title,
      kind: "ACTIVITY" as const,
      location: typeof details.location === "string" ? details.location : null,
      priceInr: activityPrice(details),
    };
  });

  const ferries: AiCatalogEntry[] = transferRows
    .filter((row) => isFerryTransfer(row.details, row.title))
    .map((row) => {
      const details = (row.details ?? {}) as Record<string, unknown>;
      return {
        id: row.id,
        title: row.title,
        kind: "TRANSFER" as const,
        mode: typeof details.mode === "string" ? details.mode : TransferMode.FERRY,
      };
    });

  if (hotels.length === 0) {
    warnings.push(`No hotels in inventory for "${dest.name}".`);
  }
  if (activities.length === 0) {
    warnings.push(`No activities found in inventory for "${dest.name}".`);
  }
  if (ferries.length === 0) {
    warnings.push(`No ferry transfers found in inventory for "${dest.name}".`);
  }

  let tripjackUsed = false;
  const hids = hotels
    .map((h) => h.tjHotelId)
    .filter((id): id is string => Boolean(id))
    .map((id) => Number(id))
    .filter((n) => Number.isFinite(n) && n > 0)
    .slice(0, 100);

  try {
    const { getIntegrationService } = await import("@/modules/integrations");
    const tj = await getIntegrationService().getByKey("tripjack");
    const tripjackConnected =
      tj.ok && tj.value.status === IntegrationStatus.CONNECTED && tj.value.lastTestOk === true;

    if (!tripjackConnected) {
      warnings.push("TripJack not connected — live hotel rates skipped.");
    } else if (hids.length === 0) {
      warnings.push(
        "TripJack connected but no TripJack hotel IDs on inventory hotels — live rates skipped."
      );
    } else {
      try {
        const { getSupplierService } = await import("@/modules/supplier");
        const { SupplierCapability } = await import("@/modules/supplier/types/supplier-capability");
        const searchResult = await getSupplierService().search("tripjack", {
          capability: SupplierCapability.HOTELS,
          hotelIds: hids,
          checkIn,
          checkOut,
          rooms: [{ adults: 2 }],
          currency: "INR",
          nationality: "106",
        });

        if (searchResult.ok) {
          tripjackUsed = true;
          const rateByTjId = new Map<string, { price: number; currency: string }>();
          for (const hit of searchResult.value) {
            const ref = String(hit.referenceId ?? "");
            const parts = ref.split("::");
            const tjId = parts[1];
            const price = typeof hit.minimumPrice === "number" ? hit.minimumPrice : null;
            const currency = typeof hit.currency === "string" ? hit.currency : "INR";
            if (tjId && price != null) {
              rateByTjId.set(tjId, { price, currency });
            }
          }
          hotels = hotels.map((h) => {
            if (!h.tjHotelId) return h;
            const rate = rateByTjId.get(h.tjHotelId);
            if (!rate) return h;
            return { ...h, liveRateInr: rate.price, currency: rate.currency };
          });
          if (rateByTjId.size === 0) {
            warnings.push("TripJack search returned no matching hotel rates.");
          }
        } else {
          warnings.push(`TripJack search failed — live rates skipped (${searchResult.error.message}).`);
          logger.warn("TripJack hotel search failed for AI context; continuing with DB catalog", {
            error: searchResult.error.message,
          });
        }
      } catch (error) {
        warnings.push("TripJack search failed — live rates skipped.");
        logger.warn("TripJack enrichment skipped", { error });
      }
    }
  } catch (error) {
    warnings.push("TripJack status check failed — live rates skipped.");
    logger.warn("TripJack status check skipped", { error });
  }

  return {
    destinationId: dest.id,
    destinationName: dest.name,
    hotels,
    activities,
    ferries,
    tripjackUsed,
    warnings,
    checkIn,
    checkOut,
  };
}
