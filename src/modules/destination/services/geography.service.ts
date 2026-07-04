import { err, isErr, ok, type PaginatedResult, type PaginationParams, type Result } from "@/shared/types";
import { BaseService, type ServiceContext } from "@/shared/services";
import { NotFoundError, type AppError } from "@/shared/errors";
import type { Airport, City, Country, Region, State } from "../types/geography";
import type {
  AirportRepository,
  CityRepository,
  CountryRepository,
  RegionRepository,
  StateRepository,
} from "../repositories/geography.repository";
import {
  validateCreateAirport,
  validateCreateCity,
  validateCreateCountry,
  validateCreateRegion,
  validateCreateState,
} from "../validation/geography.validation";

/**
 * One service for all five geography entities — they're simple reference
 * data with near-identical CRUD, consolidated the same way their
 * types/validation/repositories were (see docs/06_DESTINATION_ENGINE.md).
 */
export class GeographyService extends BaseService {
  constructor(
    context: ServiceContext,
    private readonly countries: CountryRepository,
    private readonly states: StateRepository,
    private readonly regions: RegionRepository,
    private readonly cities: CityRepository,
    private readonly airports: AirportRepository
  ) {
    super(context);
  }

  // Countries
  async listCountries(params: PaginationParams = {}): Promise<Result<PaginatedResult<Country>, AppError>> {
    return this.countries.findMany(params);
  }

  async createCountry(input: unknown): Promise<Result<Country, AppError>> {
    const validated = validateCreateCountry(input);
    if (isErr(validated)) return validated;
    this.logger.info("Creating country", { isoCode: validated.value.isoCode });
    const now = new Date().toISOString();
    return this.countries.create({ ...validated.value, createdAt: now, updatedAt: now });
  }

  // States
  async listStates(countryId?: string): Promise<Result<State[], AppError>> {
    if (countryId) return this.states.findByCountry(countryId);
    const result = await this.states.findMany();
    if (isErr(result)) return result;
    return ok(result.value.items);
  }

  async createState(input: unknown): Promise<Result<State, AppError>> {
    const validated = validateCreateState(input);
    if (isErr(validated)) return validated;
    this.logger.info("Creating state", { countryId: validated.value.countryId });
    const now = new Date().toISOString();
    return this.states.create({ ...validated.value, createdAt: now, updatedAt: now });
  }

  // Regions
  async listRegions(params: PaginationParams = {}): Promise<Result<PaginatedResult<Region>, AppError>> {
    return this.regions.findMany(params);
  }

  async createRegion(input: unknown): Promise<Result<Region, AppError>> {
    const validated = validateCreateRegion(input);
    if (isErr(validated)) return validated;
    this.logger.info("Creating region", { name: validated.value.name });
    const now = new Date().toISOString();
    return this.regions.create({ ...validated.value, createdAt: now, updatedAt: now });
  }

  // Cities
  async listCities(filter: { countryId?: string; stateId?: string } = {}): Promise<Result<City[], AppError>> {
    if (filter.stateId) return this.cities.findByState(filter.stateId);
    if (filter.countryId) return this.cities.findByCountry(filter.countryId);
    const result = await this.cities.findMany();
    if (isErr(result)) return result;
    return ok(result.value.items);
  }

  async createCity(input: unknown): Promise<Result<City, AppError>> {
    const validated = validateCreateCity(input);
    if (isErr(validated)) return validated;
    this.logger.info("Creating city", { countryId: validated.value.countryId });
    const now = new Date().toISOString();
    return this.cities.create({ ...validated.value, createdAt: now, updatedAt: now });
  }

  // Airports
  async listAirports(cityId?: string): Promise<Result<Airport[], AppError>> {
    if (cityId) return this.airports.findByCity(cityId);
    const result = await this.airports.findMany();
    if (isErr(result)) return result;
    return ok(result.value.items);
  }

  async createAirport(input: unknown): Promise<Result<Airport, AppError>> {
    const validated = validateCreateAirport(input);
    if (isErr(validated)) return validated;
    this.logger.info("Creating airport", { iataCode: validated.value.iataCode });
    const now = new Date().toISOString();
    return this.airports.create({ ...validated.value, createdAt: now, updatedAt: now });
  }

  async getCountryById(id: string): Promise<Result<Country, AppError>> {
    const result = await this.countries.findById(id);
    if (isErr(result)) return result;
    if (!result.value) return err(new NotFoundError(`Country "${id}" not found`));
    return ok(result.value);
  }
}
