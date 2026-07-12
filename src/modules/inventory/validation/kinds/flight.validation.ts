import { err, ok, type Result } from "@/shared/types";
import { ValidationError } from "@/shared/errors";
import type { FlightRouteDetails } from "../../types/kinds";

export function validateFlightDetails(input: unknown): Result<FlightRouteDetails, ValidationError> {
  if (typeof input !== "object" || input === null) {
    return err(new ValidationError("Flight route details must be an object"));
  }
  const rawInput = input as Record<string, unknown>;
  const rawOrigin = rawInput.originAirportCode ?? rawInput.origin;
  const rawDest = rawInput.destinationAirportCode ?? rawInput.destination;
  
  console.log("flight validation parsed origin/dest:", rawOrigin, rawDest);

  if (typeof rawOrigin !== "string" || rawOrigin.trim().length !== 3) {
    return err(new ValidationError(`origin (${rawOrigin}) must be a 3-letter code`));
  }
  if (typeof rawDest !== "string" || rawDest.trim().length !== 3) {
    return err(new ValidationError(`destination (${rawDest}) must be a 3-letter code`));
  }

  const originCode = rawOrigin.trim().toUpperCase();
  const destCode = rawDest.trim().toUpperCase();

  return ok({
    originAirportCode: originCode.toUpperCase(),
    destinationAirportCode: destCode.toUpperCase(),
    carrier: typeof rawInput.carrier === "string" ? rawInput.carrier : undefined,
    flightNo: typeof rawInput.flightNo === "string" ? rawInput.flightNo : undefined,
    origin: typeof rawInput.origin === "string" ? rawInput.origin : undefined,
    destination: typeof rawInput.destination === "string" ? rawInput.destination : undefined,
    departure: typeof rawInput.departure === "string" ? rawInput.departure : undefined,
    arrival: typeof rawInput.arrival === "string" ? rawInput.arrival : undefined,
    duration: typeof rawInput.duration === "string" ? rawInput.duration : undefined,
    fare: typeof rawInput.fare === "number" ? rawInput.fare : undefined,
    baggage: typeof rawInput.baggage === "string" ? rawInput.baggage : undefined,
  });
}
