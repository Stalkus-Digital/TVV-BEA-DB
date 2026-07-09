import { err, ok, type PaginatedResult, type PaginationParams, type Result } from "@/shared/types";
import { NotFoundError, type AppError } from "@/shared/errors";
import { prisma } from "@/shared/database/prisma-client";
import type { Airport, City, Country, Region, State } from "../types/geography";
import type { AirportRepository, CityRepository, CountryRepository, RegionRepository, StateRepository } from "./geography.repository";

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 20;

function pageArgs(params: PaginationParams = {}) {
  const page = params.page ?? DEFAULT_PAGE;
  const pageSize = params.pageSize ?? DEFAULT_PAGE_SIZE;
  return { skip: (page - 1) * pageSize, take: pageSize, page, pageSize };
}

function toDates<T extends { createdAt: Date; updatedAt: Date }>(row: T): Omit<T, "createdAt" | "updatedAt"> & { createdAt: string; updatedAt: string } {
  return { ...row, createdAt: row.createdAt.toISOString(), updatedAt: row.updatedAt.toISOString() };
}

export class PrismaCountryRepository implements CountryRepository {
  async findById(id: string): Promise<Result<Country | null, AppError>> {
    const row = await prisma.country.findUnique({ where: { id } });
    return ok(row ? toDates(row) : null);
  }
  async findByIsoCode(isoCode: string): Promise<Result<Country | null, AppError>> {
    const row = await prisma.country.findFirst({ where: { isoCode } });
    return ok(row ? toDates(row) : null);
  }
  async findMany(params: PaginationParams = {}): Promise<Result<PaginatedResult<Country>, AppError>> {
    const { skip, take, page, pageSize } = pageArgs(params);
    const [rows, total] = await Promise.all([prisma.country.findMany({ skip, take }), prisma.country.count()]);
    return ok({ items: rows.map(toDates), page, pageSize, total, totalPages: Math.max(1, Math.ceil(total / pageSize)) });
  }
  async create(data: Omit<Country, "id">): Promise<Result<Country, AppError>> {
    const row = await prisma.country.create({ data });
    return ok(toDates(row));
  }
  async update(id: string, data: Partial<Omit<Country, "id">>): Promise<Result<Country, AppError>> {
    try {
      const row = await prisma.country.update({ where: { id }, data });
      return ok(toDates(row));
    } catch {
      return err(new NotFoundError(`Country "${id}" not found`));
    }
  }
  async delete(id: string): Promise<Result<void, AppError>> {
    try {
      await prisma.country.delete({ where: { id } });
      return ok(undefined);
    } catch {
      return err(new NotFoundError(`Country "${id}" not found`));
    }
  }
}

export class PrismaStateRepository implements StateRepository {
  async findById(id: string): Promise<Result<State | null, AppError>> {
    const row = await prisma.state.findUnique({ where: { id } });
    return ok(row ? toDates(row) : null);
  }
  async findByCountry(countryId: string): Promise<Result<State[], AppError>> {
    const rows = await prisma.state.findMany({ where: { countryId } });
    return ok(rows.map(toDates));
  }
  async findMany(params: PaginationParams = {}): Promise<Result<PaginatedResult<State>, AppError>> {
    const { skip, take, page, pageSize } = pageArgs(params);
    const [rows, total] = await Promise.all([prisma.state.findMany({ skip, take }), prisma.state.count()]);
    return ok({ items: rows.map(toDates), page, pageSize, total, totalPages: Math.max(1, Math.ceil(total / pageSize)) });
  }
  async create(data: Omit<State, "id">): Promise<Result<State, AppError>> {
    const row = await prisma.state.create({ data });
    return ok(toDates(row));
  }
  async update(id: string, data: Partial<Omit<State, "id">>): Promise<Result<State, AppError>> {
    try {
      const row = await prisma.state.update({ where: { id }, data });
      return ok(toDates(row));
    } catch {
      return err(new NotFoundError(`State "${id}" not found`));
    }
  }
  async delete(id: string): Promise<Result<void, AppError>> {
    try {
      await prisma.state.delete({ where: { id } });
      return ok(undefined);
    } catch {
      return err(new NotFoundError(`State "${id}" not found`));
    }
  }
}

export class PrismaRegionRepository implements RegionRepository {
  async findById(id: string): Promise<Result<Region | null, AppError>> {
    const row = await prisma.region.findUnique({ where: { id } });
    return ok(row ? toDates(row) : null);
  }
  async findByCountry(countryId: string): Promise<Result<Region[], AppError>> {
    const rows = await prisma.region.findMany({ where: { countryId } });
    return ok(rows.map(toDates));
  }
  async findMany(params: PaginationParams = {}): Promise<Result<PaginatedResult<Region>, AppError>> {
    const { skip, take, page, pageSize } = pageArgs(params);
    const [rows, total] = await Promise.all([prisma.region.findMany({ skip, take }), prisma.region.count()]);
    return ok({ items: rows.map(toDates), page, pageSize, total, totalPages: Math.max(1, Math.ceil(total / pageSize)) });
  }
  async create(data: Omit<Region, "id">): Promise<Result<Region, AppError>> {
    const row = await prisma.region.create({ data });
    return ok(toDates(row));
  }
  async update(id: string, data: Partial<Omit<Region, "id">>): Promise<Result<Region, AppError>> {
    try {
      const row = await prisma.region.update({ where: { id }, data });
      return ok(toDates(row));
    } catch {
      return err(new NotFoundError(`Region "${id}" not found`));
    }
  }
  async delete(id: string): Promise<Result<void, AppError>> {
    try {
      await prisma.region.delete({ where: { id } });
      return ok(undefined);
    } catch {
      return err(new NotFoundError(`Region "${id}" not found`));
    }
  }
}

export class PrismaCityRepository implements CityRepository {
  async findById(id: string): Promise<Result<City | null, AppError>> {
    const row = await prisma.city.findUnique({ where: { id } });
    return ok(row ? toDates(row) : null);
  }
  async findByCountry(countryId: string): Promise<Result<City[], AppError>> {
    const rows = await prisma.city.findMany({ where: { countryId } });
    return ok(rows.map(toDates));
  }
  async findByState(stateId: string): Promise<Result<City[], AppError>> {
    const rows = await prisma.city.findMany({ where: { stateId } });
    return ok(rows.map(toDates));
  }
  async findMany(params: PaginationParams = {}): Promise<Result<PaginatedResult<City>, AppError>> {
    const { skip, take, page, pageSize } = pageArgs(params);
    const [rows, total] = await Promise.all([prisma.city.findMany({ skip, take }), prisma.city.count()]);
    return ok({ items: rows.map(toDates), page, pageSize, total, totalPages: Math.max(1, Math.ceil(total / pageSize)) });
  }
  async create(data: Omit<City, "id">): Promise<Result<City, AppError>> {
    const row = await prisma.city.create({ data });
    return ok(toDates(row));
  }
  async update(id: string, data: Partial<Omit<City, "id">>): Promise<Result<City, AppError>> {
    try {
      const row = await prisma.city.update({ where: { id }, data });
      return ok(toDates(row));
    } catch {
      return err(new NotFoundError(`City "${id}" not found`));
    }
  }
  async delete(id: string): Promise<Result<void, AppError>> {
    try {
      await prisma.city.delete({ where: { id } });
      return ok(undefined);
    } catch {
      return err(new NotFoundError(`City "${id}" not found`));
    }
  }
}

export class PrismaAirportRepository implements AirportRepository {
  async findById(id: string): Promise<Result<Airport | null, AppError>> {
    const row = await prisma.airport.findUnique({ where: { id } });
    return ok(row ? toDates(row) : null);
  }
  async findByCity(cityId: string): Promise<Result<Airport[], AppError>> {
    const rows = await prisma.airport.findMany({ where: { cityId } });
    return ok(rows.map(toDates));
  }
  async findByIataCode(iataCode: string): Promise<Result<Airport | null, AppError>> {
    const row = await prisma.airport.findFirst({ where: { iataCode } });
    return ok(row ? toDates(row) : null);
  }
  async findMany(params: PaginationParams = {}): Promise<Result<PaginatedResult<Airport>, AppError>> {
    const { skip, take, page, pageSize } = pageArgs(params);
    const [rows, total] = await Promise.all([prisma.airport.findMany({ skip, take }), prisma.airport.count()]);
    return ok({ items: rows.map(toDates), page, pageSize, total, totalPages: Math.max(1, Math.ceil(total / pageSize)) });
  }
  async create(data: Omit<Airport, "id">): Promise<Result<Airport, AppError>> {
    const row = await prisma.airport.create({ data });
    return ok(toDates(row));
  }
  async update(id: string, data: Partial<Omit<Airport, "id">>): Promise<Result<Airport, AppError>> {
    try {
      const row = await prisma.airport.update({ where: { id }, data });
      return ok(toDates(row));
    } catch {
      return err(new NotFoundError(`Airport "${id}" not found`));
    }
  }
  async delete(id: string): Promise<Result<void, AppError>> {
    try {
      await prisma.airport.delete({ where: { id } });
      return ok(undefined);
    } catch {
      return err(new NotFoundError(`Airport "${id}" not found`));
    }
  }
}
