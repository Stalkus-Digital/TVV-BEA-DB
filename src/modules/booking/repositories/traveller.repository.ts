import { ok, type PaginationParams, type Result } from "@/shared/types";
import type { BaseRepository } from "@/shared/repositories";
import type { AppError } from "@/shared/errors";
import type { Traveller } from "../types/traveller";
import { InMemoryStore } from "./in-memory-store";

export interface TravellerRepository extends BaseRepository<Traveller, string> {
  findByBooking(bookingId: string): Promise<Result<Traveller[], AppError>>;
}

export class InMemoryTravellerRepository implements TravellerRepository {
  private readonly store = new InMemoryStore<Traveller>("Traveller");

  findById = (id: string) => this.store.findById(id);
  findMany = (params?: PaginationParams) => this.store.findMany(params);
  create = (data: Omit<Traveller, "id">) => this.store.create(data);
  update = (id: string, data: Partial<Omit<Traveller, "id">>) => this.store.update(id, data);
  delete = (id: string) => this.store.delete(id);

  async findByBooking(bookingId: string): Promise<Result<Traveller[], AppError>> {
    return ok(this.store.all().filter((t) => t.bookingId === bookingId));
  }
}
