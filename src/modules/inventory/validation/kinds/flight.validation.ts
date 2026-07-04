import { err, ok, type Result } from "@/shared/types";
import { ValidationError } from "@/shared/errors";
import type { FlightRouteDetails } from "../../types/kinds";

export function validateFlightDetails(input: unknown): Result<FlightRouteDetails, ValidationError> {
  if (typeof input !== "object" || input === null) {
    return err(new ValidationError("Flight route details must be an object"));
  }
  const { originAirportCode, destinationAirportCode } = input as Record<string, unknown>;

  if (typeof originAirportCode !== "string" || originAirportCode.trim().length !== 3) {
    return err(new ValidationError("originAirportCode must be a 3-letter IATA code"));
  }
  if (typeof destinationAirportCode !== "string" || destinationAirportCode.trim().length !== 3) {
    return err(new ValidationError("destinationAirportCode must be a 3-letter IATA code"));
  }

  return ok({
    originAirportCode: originAirportCode.toUpperCase(),
    destinationAirportCode: destinationAirportCode.toUpperCase(),
  });
}
