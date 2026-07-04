import { err, ok, type Result } from "@/shared/types";
import { ValidationError } from "@/shared/errors";

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

export interface CreateCountryInput {
  name: string;
  isoCode: string;
}

export function validateCreateCountry(input: unknown): Result<CreateCountryInput, ValidationError> {
  if (typeof input !== "object" || input === null) return err(new ValidationError("Request body must be an object"));
  const { name, isoCode } = input as Record<string, unknown>;
  if (!isNonEmptyString(name)) return err(new ValidationError("name is required"));
  if (!isNonEmptyString(isoCode) || isoCode.trim().length !== 2) {
    return err(new ValidationError("isoCode must be a 2-letter ISO country code"));
  }
  return ok({ name, isoCode: isoCode.toUpperCase() });
}

export interface CreateStateInput {
  countryId: string;
  name: string;
}

export function validateCreateState(input: unknown): Result<CreateStateInput, ValidationError> {
  if (typeof input !== "object" || input === null) return err(new ValidationError("Request body must be an object"));
  const { countryId, name } = input as Record<string, unknown>;
  if (!isNonEmptyString(countryId)) return err(new ValidationError("countryId is required"));
  if (!isNonEmptyString(name)) return err(new ValidationError("name is required"));
  return ok({ countryId, name });
}

export interface CreateRegionInput {
  name: string;
  countryId: string | null;
}

export function validateCreateRegion(input: unknown): Result<CreateRegionInput, ValidationError> {
  if (typeof input !== "object" || input === null) return err(new ValidationError("Request body must be an object"));
  const { name, countryId } = input as Record<string, unknown>;
  if (!isNonEmptyString(name)) return err(new ValidationError("name is required"));
  if (countryId !== undefined && countryId !== null && !isNonEmptyString(countryId)) {
    return err(new ValidationError("countryId must be a string or null"));
  }
  return ok({ name, countryId: (countryId as string | null | undefined) ?? null });
}

export interface CreateCityInput {
  countryId: string;
  stateId: string | null;
  name: string;
}

export function validateCreateCity(input: unknown): Result<CreateCityInput, ValidationError> {
  if (typeof input !== "object" || input === null) return err(new ValidationError("Request body must be an object"));
  const { countryId, stateId, name } = input as Record<string, unknown>;
  if (!isNonEmptyString(countryId)) return err(new ValidationError("countryId is required"));
  if (stateId !== undefined && stateId !== null && !isNonEmptyString(stateId)) {
    return err(new ValidationError("stateId must be a string or null"));
  }
  if (!isNonEmptyString(name)) return err(new ValidationError("name is required"));
  return ok({ countryId, stateId: (stateId as string | null | undefined) ?? null, name });
}

export interface CreateAirportInput {
  cityId: string;
  iataCode: string;
  name: string;
}

export function validateCreateAirport(input: unknown): Result<CreateAirportInput, ValidationError> {
  if (typeof input !== "object" || input === null) return err(new ValidationError("Request body must be an object"));
  const { cityId, iataCode, name } = input as Record<string, unknown>;
  if (!isNonEmptyString(cityId)) return err(new ValidationError("cityId is required"));
  if (!isNonEmptyString(iataCode) || iataCode.trim().length !== 3) {
    return err(new ValidationError("iataCode must be a 3-letter IATA code"));
  }
  if (!isNonEmptyString(name)) return err(new ValidationError("name is required"));
  return ok({ cityId, iataCode: iataCode.toUpperCase(), name });
}
