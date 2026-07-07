import { randomUUID } from "node:crypto";
import { PrismaStore } from "@/shared/database/prisma-store";
import { prisma } from "@/shared/database/prisma-client";
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

export class PrismaCountryRepository extends PrismaStore<any> implements CountryRepository {
  constructor() {
    super(prisma.country);
  }
  async findByIsoCode(isoCode: string): Promise<Result<Country | null, AppError>> {
    return ok((await this.delegate.findMany()).find(( c: any ) => c.isoCode === isoCode) ?? null);
  }
}

export interface StateRepository extends BaseRepository<State, string> {
  findByCountry(countryId: string): Promise<Result<State[], AppError>>;
}

export class PrismaStateRepository extends PrismaStore<any> implements StateRepository {
  constructor() {
    super(prisma.state);
  }
  async findByCountry(countryId: string): Promise<Result<State[], AppError>> {
    return ok((await this.delegate.findMany()).filter(( s: any ) => s.countryId === countryId));
  }
}

export interface RegionRepository extends BaseRepository<Region, string> {}

export class PrismaRegionRepository extends PrismaStore<any> implements RegionRepository {
  constructor() {
    super(prisma.region);
  }
}

export interface CityRepository extends BaseRepository<City, string> {
  findByCountry(countryId: string): Promise<Result<City[], AppError>>;
  findByState(stateId: string): Promise<Result<City[], AppError>>;
}

export class PrismaCityRepository extends PrismaStore<any> implements CityRepository {
  constructor() {
    super(prisma.city);
  }
  async findByCountry(countryId: string): Promise<Result<City[], AppError>> {
    return ok((await this.delegate.findMany()).filter(( c: any ) => c.countryId === countryId));
  }
  async findByState(stateId: string): Promise<Result<City[], AppError>> {
    return ok((await this.delegate.findMany()).filter(( c: any ) => c.stateId === stateId));
  }
}

export interface AirportRepository extends BaseRepository<Airport, string> {
  findByCity(cityId: string): Promise<Result<Airport[], AppError>>;
  findByIataCode(iataCode: string): Promise<Result<Airport | null, AppError>>;
}

export class PrismaAirportRepository extends PrismaStore<any> implements AirportRepository {
  constructor() {
    super(prisma.airport);
  }
  async findByCity(cityId: string): Promise<Result<Airport[], AppError>> {
    return ok((await this.delegate.findMany()).filter(( a: any ) => a.cityId === cityId));
  }
  async findByIataCode(iataCode: string): Promise<Result<Airport | null, AppError>> {
    return ok((await this.delegate.findMany()).find(( a: any ) => a.iataCode === iataCode) ?? null);
  }
}
