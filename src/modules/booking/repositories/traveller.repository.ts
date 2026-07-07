import { ok, type PaginationParams, type Result } from "@/shared/types";
import type { BaseRepository } from "@/shared/repositories";
import type { AppError } from "@/shared/errors";
import type { Traveller } from "../types/traveller";
import { PrismaStore } from "@/shared/database/prisma-store";
import { prisma } from "@/shared/database/prisma-client";

export interface TravellerRepository extends BaseRepository<Traveller, string> {
  findByBooking(bookingId: string): Promise<Result<Traveller[], AppError>>;
}

export class PrismaTravellerRepository extends PrismaStore<any> implements TravellerRepository {
  constructor() {
    super(prisma.traveller);
  }

  async findByBooking(bookingId: string): Promise<Result<Traveller[], AppError>> {
    return ok((await this.delegate.findMany()).filter(( t: any ) => t.bookingId === bookingId));
  }
}
