import type { AppError } from "@/shared/errors";
import type { PaginatedResult, Result } from "@/shared/types";
import { getGeographyService } from "../module";
import type { Airport, City, Country, Region, State } from "../types/geography";

export async function listCountriesHandler(): Promise<Result<PaginatedResult<Country>, AppError>> {
  return getGeographyService().listCountries();
}

export async function createCountryHandler(body: unknown): Promise<Result<Country, AppError>> {
  return getGeographyService().createCountry(body);
}

export async function listStatesHandler(countryId?: string): Promise<Result<State[], AppError>> {
  return getGeographyService().listStates(countryId);
}

export async function createStateHandler(body: unknown): Promise<Result<State, AppError>> {
  return getGeographyService().createState(body);
}

export async function listRegionsHandler(countryId?: string): Promise<Result<Region[], AppError>> {
  return getGeographyService().listRegions(countryId);
}

export async function createRegionHandler(body: unknown): Promise<Result<Region, AppError>> {
  return getGeographyService().createRegion(body);
}

export async function listCitiesHandler(filter: { countryId?: string; stateId?: string }): Promise<Result<City[], AppError>> {
  return getGeographyService().listCities(filter);
}

export async function createCityHandler(body: unknown): Promise<Result<City, AppError>> {
  return getGeographyService().createCity(body);
}

export async function listAirportsHandler(cityId?: string): Promise<Result<Airport[], AppError>> {
  return getGeographyService().listAirports(cityId);
}

export async function createAirportHandler(body: unknown): Promise<Result<Airport, AppError>> {
  return getGeographyService().createAirport(body);
}
