import { randomUUID } from "node:crypto";
import {
  DEFAULT_PAGINATION,
  err,
  ok,
  toPaginatedResult,
  type PaginatedResult,
  type PaginationParams,
  type Result,
} from "@/shared/types";
import type { BaseRepository } from "@/shared/repositories";
import { NotFoundError, type AppError } from "@/shared/errors";
import type { Airport, City, Country, Region, State } from "../types/geography";

/** Generic in-memory CRUD used by all five geography repositories below — same pattern as Inventory's repository, no database yet. */
class InMemoryStore<T extends { id: string }> {
  private readonly store = new Map<string, T>();

  async findById(id: string): Promise<Result<T | null, AppError>> {
    return ok(this.store.get(id) ?? null);
  }

  async findMany(params: PaginationParams = {}): Promise<Result<PaginatedResult<T>, AppError>> {
    const items = Array.from(this.store.values());
    const page = params.page ?? DEFAULT_PAGINATION.page;
    const pageSize = params.pageSize ?? DEFAULT_PAGINATION.pageSize;
    const start = (page - 1) * pageSize;
    return ok(toPaginatedResult(items.slice(start, start + pageSize), items.length, { page, pageSize }));
  }

  async create(data: Omit<T, "id">, entityLabel: string): Promise<Result<T, AppError>> {
    const id = randomUUID();
    const record = { ...data, id } as T;
    this.store.set(id, record);
    return ok(record);
  }

  async update(id: string, data: Partial<Omit<T, "id">>, entityLabel: string): Promise<Result<T, AppError>> {
    const existing = this.store.get(id);
    if (!existing) return err(new NotFoundError(`${entityLabel} "${id}" not found`));
    const updated = { ...existing, ...data } as T;
    this.store.set(id, updated);
    return ok(updated);
  }

  async delete(id: string, entityLabel: string): Promise<Result<void, AppError>> {
    if (!this.store.has(id)) return err(new NotFoundError(`${entityLabel} "${id}" not found`));
    this.store.delete(id);
    return ok(undefined);
  }

  all(): T[] {
    return Array.from(this.store.values());
  }
}

export interface CountryRepository extends BaseRepository<Country, string> {
  findByIsoCode(isoCode: string): Promise<Result<Country | null, AppError>>;
}

export class InMemoryCountryRepository implements CountryRepository {
  private readonly store = new InMemoryStore<Country>();
  findById = (id: string) => this.store.findById(id);
  findMany = (params?: PaginationParams) => this.store.findMany(params);
  create = (data: Omit<Country, "id">) => this.store.create(data, "Country");
  update = (id: string, data: Partial<Omit<Country, "id">>) => this.store.update(id, data, "Country");
  delete = (id: string) => this.store.delete(id, "Country");
  async findByIsoCode(isoCode: string): Promise<Result<Country | null, AppError>> {
    return ok(this.store.all().find((c) => c.isoCode === isoCode) ?? null);
  }
}

export interface StateRepository extends BaseRepository<State, string> {
  findByCountry(countryId: string): Promise<Result<State[], AppError>>;
}

export class InMemoryStateRepository implements StateRepository {
  private readonly store = new InMemoryStore<State>();
  findById = (id: string) => this.store.findById(id);
  findMany = (params?: PaginationParams) => this.store.findMany(params);
  create = (data: Omit<State, "id">) => this.store.create(data, "State");
  update = (id: string, data: Partial<Omit<State, "id">>) => this.store.update(id, data, "State");
  delete = (id: string) => this.store.delete(id, "State");
  async findByCountry(countryId: string): Promise<Result<State[], AppError>> {
    return ok(this.store.all().filter((s) => s.countryId === countryId));
  }
}

export interface RegionRepository extends BaseRepository<Region, string> {}

export class InMemoryRegionRepository implements RegionRepository {
  private readonly store = new InMemoryStore<Region>();
  findById = (id: string) => this.store.findById(id);
  findMany = (params?: PaginationParams) => this.store.findMany(params);
  create = (data: Omit<Region, "id">) => this.store.create(data, "Region");
  update = (id: string, data: Partial<Omit<Region, "id">>) => this.store.update(id, data, "Region");
  delete = (id: string) => this.store.delete(id, "Region");
}

export interface CityRepository extends BaseRepository<City, string> {
  findByCountry(countryId: string): Promise<Result<City[], AppError>>;
  findByState(stateId: string): Promise<Result<City[], AppError>>;
}

export class InMemoryCityRepository implements CityRepository {
  private readonly store = new InMemoryStore<City>();
  findById = (id: string) => this.store.findById(id);
  findMany = (params?: PaginationParams) => this.store.findMany(params);
  create = (data: Omit<City, "id">) => this.store.create(data, "City");
  update = (id: string, data: Partial<Omit<City, "id">>) => this.store.update(id, data, "City");
  delete = (id: string) => this.store.delete(id, "City");
  async findByCountry(countryId: string): Promise<Result<City[], AppError>> {
    return ok(this.store.all().filter((c) => c.countryId === countryId));
  }
  async findByState(stateId: string): Promise<Result<City[], AppError>> {
    return ok(this.store.all().filter((c) => c.stateId === stateId));
  }
}

export interface AirportRepository extends BaseRepository<Airport, string> {
  findByCity(cityId: string): Promise<Result<Airport[], AppError>>;
  findByIataCode(iataCode: string): Promise<Result<Airport | null, AppError>>;
}

export class InMemoryAirportRepository implements AirportRepository {
  private readonly store = new InMemoryStore<Airport>();
  findById = (id: string) => this.store.findById(id);
  findMany = (params?: PaginationParams) => this.store.findMany(params);
  create = (data: Omit<Airport, "id">) => this.store.create(data, "Airport");
  update = (id: string, data: Partial<Omit<Airport, "id">>) => this.store.update(id, data, "Airport");
  delete = (id: string) => this.store.delete(id, "Airport");
  async findByCity(cityId: string): Promise<Result<Airport[], AppError>> {
    return ok(this.store.all().filter((a) => a.cityId === cityId));
  }
  async findByIataCode(iataCode: string): Promise<Result<Airport | null, AppError>> {
    return ok(this.store.all().find((a) => a.iataCode === iataCode) ?? null);
  }
}
