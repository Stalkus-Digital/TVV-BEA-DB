import { NextResponse } from "next/server";
import { getSupplierService } from "@/modules/supplier";
import { SupplierCapability } from "@/modules/supplier/types";

/**
 * POST /api/v1/flights/search
 * 
 * Proxies the flight search to the TripJack supplier engine.
 * Accepts search criteria from the frontend and returns mapped flight results.
 *
 * Expected body:
 * {
 *   origin: string;         // IATA airport code e.g. "DEL"
 *   destination: string;    // IATA airport code e.g. "BOM"
 *   departureDate: string;  // YYYY-MM-DD
 *   returnDate?: string;    // YYYY-MM-DD (for round-trips)
 *   adults: number;
 *   children?: number;
 *   infants?: number;
 *   cabinClass?: "ECONOMY" | "BUSINESS" | "FIRST" | "PREMIUM_ECONOMY";
 * }
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { origin, destination, departureDate, returnDate, adults = 1, children = 0, infants = 0, cabinClass = "ECONOMY" } = body;

    if (!origin || !destination || !departureDate) {
      return NextResponse.json(
        { success: false, error: "origin, destination, and departureDate are required" },
        { status: 400 }
      );
    }

    const supplierService = getSupplierService();

    const result = await supplierService.search("tripjack", {
      capability: SupplierCapability.FLIGHTS,
      origin,
      destination,
      departureDate,
      returnDate: returnDate ?? null,
      adults,
      children,
      infants,
      cabinClass,
    });

    if (!result.ok) {
      return NextResponse.json(
        { success: false, error: result.error.message },
        { status: 502 }
      );
    }

    return NextResponse.json({ success: true, data: result.value });
  } catch (error) {
    console.error("[flights/search] Error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
