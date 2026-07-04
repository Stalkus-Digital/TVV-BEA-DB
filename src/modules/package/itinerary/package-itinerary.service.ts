import { err, isErr, ok, type Result } from "@/shared/types";
import { BaseService, type ServiceContext } from "@/shared/services";
import { ValidationError, type AppError } from "@/shared/errors";
import { getDestinationService } from "@/modules/destination";
import { generateSkeletonItinerary, type GeneratedItineraryDay } from "./itinerary-generator";

export interface GenerateItineraryRequest {
  destinationId: string;
  durationDays: number;
}

/**
 * The one place in this module that calls Destination Engine's service
 * directly — the approved direction per docs/02 ("Package Builder ↓
 * Inventory Service" / "↓ Destination Engine"), same as Inventory's own
 * (still-inert) bridge to Supplier. Resolves a destination name, then
 * delegates to the pure, non-AI generator.
 */
export class PackageItineraryService extends BaseService {
  constructor(context: ServiceContext) {
    super(context);
  }

  async generate(input: unknown): Promise<Result<GeneratedItineraryDay[], AppError>> {
    if (typeof input !== "object" || input === null) {
      return err(new ValidationError("Request body must be an object"));
    }
    const { destinationId, durationDays } = input as Record<string, unknown>;
    if (typeof destinationId !== "string" || destinationId.trim().length === 0) {
      return err(new ValidationError("destinationId is required"));
    }
    if (typeof durationDays !== "number" || durationDays <= 0) {
      return err(new ValidationError("durationDays must be a positive number"));
    }

    const destination = await getDestinationService().getById(destinationId);
    if (isErr(destination)) return destination;

    this.logger.info("Generating itinerary skeleton", { destinationId, durationDays });
    return ok(generateSkeletonItinerary(destination.value.name, durationDays));
  }
}
