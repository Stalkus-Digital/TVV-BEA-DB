import { ok, type PaginationParams, type Result } from "@/shared/types";
import type { BaseRepository } from "@/shared/repositories";
import type { AppError } from "@/shared/errors";
import type { PassengerDocument } from "../types/document";
import { PrismaStore } from "@/shared/database/prisma-store";
import { prisma } from "@/shared/database/prisma-client";

export interface DocumentRepository extends BaseRepository<PassengerDocument, string> {
  findByBooking(bookingId: string): Promise<Result<PassengerDocument[], AppError>>;
}

export class PrismaDocumentRepository extends PrismaStore<any> implements DocumentRepository {
  constructor() {
    super(prisma.passengerDocument);
  }

  async findByBooking(bookingId: string): Promise<Result<PassengerDocument[], AppError>> {
    return ok((await this.delegate.findMany()).filter(( d: any ) => d.bookingId === bookingId));
  }
}
