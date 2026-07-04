import type { AppError } from "@/shared/errors";
import type { Result } from "@/shared/types";
import { getPackageItineraryService } from "../module";
import type { GeneratedItineraryDay } from "../itinerary/itinerary-generator";

export async function generateItineraryHandler(body: unknown): Promise<Result<GeneratedItineraryDay[], AppError>> {
  return getPackageItineraryService().generate(body);
}
