import type { Result } from "@/shared/types";
import { BaseService, type ServiceContext } from "@/shared/services";
import type { AppError } from "@/shared/errors";
import type { BookingItem } from "../types/booking-item";
import type { BookingItemRepository } from "../repositories/booking-item.repository";

/** Read-only — items are populated only by BookingService.createFromQuote(), frozen from the source Quote's items. No API path adds/edits/removes one (see booking-item.ts's docstring). */
export class BookingItemService extends BaseService {
  constructor(
    context: ServiceContext,
    private readonly items: BookingItemRepository
  ) {
    super(context);
  }

  async listByBooking(bookingId: string): Promise<Result<BookingItem[], AppError>> {
    return this.items.findByBooking(bookingId);
  }
}
