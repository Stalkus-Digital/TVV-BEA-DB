import { prisma } from "@/shared/database/prisma-client";
import { createLogger } from "@/shared/logger";
import { IntegrationStatus } from "@/modules/integrations/types/integration";

const logger = createLogger("package.ai.context");

export interface AiHotelCatalogEntry {
  id: string;
  title: string;
  starRating: number | null;
  avgRate: number | null;
  address: string | null;
  tjHotelId: string | null;
  /** Indicative live rate from TripJack when available */
  liveRateInr: number | null;
  currency: string | null;
}

export interface AiPackageContext {
  destinationId: string | null;
  destinationName: string | null;
  hotels: AiHotelCatalogEntry[];
  tripjackUsed: boolean;
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

/**
 * Loads destination hotels from inventory and optionally enriches with TripJack rates.
 */
export async function buildAiPackageContext(
  destinationName: string,
  duration: string
): Promise<AiPackageContext> {
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
  }

  if (!dest) {
    return {
      destinationId: null,
      destinationName: null,
      hotels: [],
      tripjackUsed: false,
      checkIn,
      checkOut,
    };
  }

  const hotelRows = await prisma.inventoryItem.findMany({
    where: {
      kind: "HOTEL",
      status: "ACTIVE",
      destinationId: dest.id,
    },
    orderBy: { title: "asc" },
    take: 80,
  });

  let hotels: AiHotelCatalogEntry[] = hotelRows.map((row) => {
    const details = (row.details ?? {}) as Record<string, unknown>;
    return {
      id: row.id,
      title: row.title,
      starRating: typeof details.starRating === "number" ? details.starRating : null,
      avgRate: typeof details.avgRate === "number" ? details.avgRate : null,
      address: typeof details.address === "string" ? details.address : null,
      tjHotelId: extractTjHotelId(details),
      liveRateInr: null,
      currency: null,
    };
  });

  let tripjackUsed = false;

  const hids = hotels
    .map((h) => h.tjHotelId)
    .filter((id): id is string => Boolean(id))
    .map((id) => Number(id))
    .filter((n) => Number.isFinite(n) && n > 0)
    .slice(0, 100);

  if (hids.length > 0) {
    try {
      const { getIntegrationService } = await import("@/modules/integrations");
      const tj = await getIntegrationService().getByKey("tripjack");
      const tripjackConnected =
        tj.ok && tj.value.status === IntegrationStatus.CONNECTED && tj.value.lastTestOk === true;

      if (tripjackConnected) {
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
            // HOTEL::{tjHotelId}::{correlationId}
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
        } else {
          logger.warn("TripJack hotel search failed for AI context; continuing with DB catalog", {
            error: searchResult.error.message,
          });
        }
      }
    } catch (error) {
      logger.warn("TripJack enrichment skipped", { error });
    }
  }

  return {
    destinationId: dest.id,
    destinationName: dest.name,
    hotels,
    tripjackUsed,
    checkIn,
    checkOut,
  };
}
