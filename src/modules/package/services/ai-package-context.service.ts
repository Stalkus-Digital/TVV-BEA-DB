import { prisma } from "@/shared/database/prisma-client";
import { createLogger } from "@/shared/logger";
import { IntegrationStatusEnum } from "@/modules/integrations/types/integration-status";
import { TransferMode } from "@/modules/inventory/types/kinds/transfer.types";
import { SupplierCapability } from "@/modules/supplier/types/supplier-capability";

const logger = createLogger("package.ai.context");

export interface AiCatalogEntry {
  id: string;
  title: string;
  kind: "HOTEL" | "ACTIVITY" | "TRANSFER" | "FLIGHT";
  starRating?: number | null;
  avgRate?: number | null;
  address?: string | null;
  location?: string | null;
  priceInr?: number | null;
  mode?: string | null;
  tjHotelId?: string | null;
  liveRateInr?: number | null;
  currency?: string | null;
  airline?: string | null;
  flightNumber?: string | null;
  departureTime?: string | null;
  arrivalTime?: string | null;
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

export interface AiFlightCatalogEntry extends AiCatalogEntry {
  kind: "FLIGHT";
  priceInr: number | null;
  airline: string | null;
  flightNumber: string | null;
  departureTime: string | null;
  arrivalTime: string | null;
}

export interface AiPackageContext {
  destinationId: string | null;
  destinationName: string | null;
  hotels: AiHotelCatalogEntry[];
  activities: AiCatalogEntry[];
  ferries: AiCatalogEntry[];
  flights: AiFlightCatalogEntry[];
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
 * Pulls Static TjHotels and Live TripJack flights if origin is provided.
 */
export async function buildAiPackageContext(
  destinationName: string,
  duration: string,
  options?: {
    origin?: string;
    flightDestination?: string;
    departureDate?: string;
    returnDate?: string;
  }
): Promise<AiPackageContext> {
  const warnings: string[] = [];
  const nights = parseNights(duration);
  
  let checkIn = options?.departureDate;
  let checkOut = options?.returnDate;

  if (!checkIn) {
    const checkInDate = new Date();
    checkInDate.setDate(checkInDate.getDate() + 14);
    checkIn = formatDate(checkInDate);
  }
  
  if (!checkOut) {
    const checkOutDate = new Date(checkIn);
    checkOutDate.setDate(checkOutDate.getDate() + nights);
    checkOut = formatDate(checkOutDate);
  }

  let dest = await prisma.destination.findFirst({
    where: { name: { contains: destinationName, mode: "insensitive" } },
  });
  
  if (!dest) {
    dest = await prisma.destination.findFirst();
    if (dest) {
      warnings.push(`No destination matched "${destinationName}" — using "${dest.name}" as fallback.`);
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
      flights: [],
      tripjackUsed: false,
      warnings,
      checkIn,
      checkOut,
    };
  }

  // 1. Load Local Inventory Items (Activities, Ferries, and fallback manual Hotels)
  const [manualHotelRows, activityRows, transferRows, tjHotelRows] = await Promise.all([
    prisma.inventoryItem.findMany({
      where: { kind: "HOTEL", status: "ACTIVE", destinationId: dest.id },
      orderBy: { title: "asc" },
      take: 20,
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
    // ✅ Load up to 40 TripJack Static Hotels matching the destination city name
    prisma.tjHotel.findMany({
      where: { city: { cityName: { contains: destinationName, mode: 'insensitive' } } },
      take: 40,
    })
  ]);

  let hotels: AiHotelCatalogEntry[] = manualHotelRows.map((row) => {
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

  // Append Static TripJack Hotels
  for (const tj of tjHotelRows) {
    let parsedStar: number | null = null;
    if (typeof tj.starRating === 'string') {
       const s = parseInt(tj.starRating.replace(/[^0-9]/g, ''), 10);
       if (!isNaN(s)) parsedStar = s;
    }
    
    let addrStr: string | null = null;
    if (tj.address) {
       const addrObj = tj.address as any;
       if (typeof addrObj === 'string') addrStr = addrObj;
       else if (addrObj.addressLine1) addrStr = addrObj.addressLine1;
    }

    hotels.push({
      id: tj.id,
      title: tj.name,
      kind: "HOTEL" as const,
      starRating: parsedStar,
      avgRate: null,
      address: addrStr,
      tjHotelId: tj.tjHotelId,
      liveRateInr: null,
      currency: null,
    });
  }

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
    warnings.push(`No hotels (manual or TripJack) found for "${dest.name}".`);
  }

  let tripjackUsed = false;
  let flights: AiFlightCatalogEntry[] = [];

  try {
    const { getIntegrationService } = await import("@/modules/integrations");
    const tj = await getIntegrationService().getByKey("tripjack");
    const tripjackConnected =
      tj.ok && tj.value.status === IntegrationStatusEnum.CONNECTED && tj.value.lastTestOk === true;

    if (!tripjackConnected) {
      warnings.push("TripJack not connected — live flights and live hotel rates skipped.");
    } else {
      const { getSupplierService } = await import("@/modules/supplier");
      
      // ✅ 1. Live Flights Search
      if (options?.origin && options?.flightDestination) {
        try {
          const flightResult = await getSupplierService().search("tripjack", {
            capability: SupplierCapability.FLIGHTS,
            origin: options.origin,
            destination: options.flightDestination,
            departureDate: checkIn,
            returnDate: checkOut,
            adults: 2,
          });

          if (!flightResult.ok) {
             warnings.push(`Flight search failed: ${flightResult.error.message}`);
          } else if (flightResult.value.length > 0) {
            tripjackUsed = true;
            flights = flightResult.value.slice(0, 20).map((f: any) => ({
              id: f.referenceId,
              title: `${f.airline} Flight ${f.flightNumber}`,
              kind: "FLIGHT" as const,
              priceInr: f.minimumPrice ?? null,
              airline: f.airline ?? null,
              flightNumber: f.flightNumber ?? null,
              departureTime: f.departureTime ?? null,
              arrivalTime: f.arrivalTime ?? null,
            }));
          } else {
            warnings.push(`No flights found for ${options.origin} to ${options.flightDestination}`);
          }
        } catch(err: any) {
          logger.warn("Live Flight Search failed", { error: err.message });
        }
      }

      // ✅ 2. Live Hotel Rates (limit 100 to avoid TJ rate limits)
      const hids = hotels
        .map((h) => h.tjHotelId)
        .filter((id): id is string => Boolean(id))
        .map((id) => Number(id))
        .filter((n) => Number.isFinite(n) && n > 0)
        .slice(0, 100);

      if (hids.length > 0) {
        try {
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
          }
        } catch (error: any) {
          logger.warn("TripJack enrichment skipped", { error: error.message });
        }
      }
    }
  } catch (error: any) {
    logger.warn("TripJack status check skipped", { error: error.message });
  }

  return {
    destinationId: dest.id,
    destinationName: dest.name,
    hotels,
    activities,
    ferries,
    flights,
    tripjackUsed,
    warnings,
    checkIn,
    checkOut,
  };
}
