import { apiConfig, ok, fail, type ServiceResult } from "@/lib/api";
import { ApiError } from "@/lib/api/errors";
import type { Airport, FlightItinerary, FlightSearchInput, FlightSearchResponse } from "@/lib/models";
import { airportsMock, flightItinerariesMock } from "@/lib/mock";

export const flightsService = {
  async airports(query?: string): Promise<ServiceResult<Airport[]>> {
    if (apiConfig.useMock) {
      const q = query?.toLowerCase().trim();
      const filtered = q
        ? airportsMock.filter((a) => `${a.code} ${a.city} ${a.name}`.toLowerCase().includes(q))
        : airportsMock;
      return ok(filtered, "mock");
    }
    return fail<Airport[]>(ApiError.notImplemented("Flights"), "live");
  },

  async search(input: FlightSearchInput): Promise<ServiceResult<FlightSearchResponse>> {
    if (apiConfig.useMock) {
      const matched = flightItinerariesMock.filter((it) => {
        const seg = it.legs[0].segments[0];
        const last = it.legs[0].segments[it.legs[0].segments.length - 1];
        return seg.from.code === input.from && last.to.code === input.to;
      });
      const results: FlightItinerary[] = matched.length > 0 ? matched : flightItinerariesMock.slice(0, 3);
      return ok({
        query: input,
        results,
        meta: {
          total: results.length,
          fetchedAt: new Date().toISOString(),
          vendors: ["mock"],
        },
      }, "mock");
    }
    return fail<FlightSearchResponse>(ApiError.notImplemented("Flights"), "live");
  },
};

export type FlightsService = typeof flightsService;
