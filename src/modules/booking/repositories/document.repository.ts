import { ok, type PaginationParams, type Result } from "@/shared/types";
import type { BaseRepository } from "@/shared/repositories";
import type { AppError } from "@/shared/errors";
import type { PassengerDocument } from "../types/document";
import { InMemoryStore } from "./in-memory-store";

export interface DocumentRepository extends BaseRepository<PassengerDocument, string> {
  findByBooking(bookingId: string): Promise<Result<PassengerDocument[], AppError>>;
}

export class InMemoryDocumentRepository implements DocumentRepository {
  private readonly store = new InMemoryStore<PassengerDocument>("Passenger document");

  findById = (id: string) => this.store.findById(id);
  findMany = (params?: PaginationParams) => this.store.findMany(params);
  create = (data: Omit<PassengerDocument, "id">) => this.store.create(data);
  update = (id: string, data: Partial<Omit<PassengerDocument, "id">>) => this.store.update(id, data);
  delete = (id: string) => this.store.delete(id);

  async findByBooking(bookingId: string): Promise<Result<PassengerDocument[], AppError>> {
    return ok(this.store.all().filter((d) => d.bookingId === bookingId));
  }
}
