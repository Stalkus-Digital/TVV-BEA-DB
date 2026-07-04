import type { TripJackHotelSearchResultDTO } from "../dto";

/** See tripjack-flight.mapper.ts for the isolation rationale — same reasoning applies here. */
export interface MappedInventoryHotel {
  starRating: number;
  address: string;
  title: string;
}

export class TripJackHotelMapper {
  toInventoryHotel(dto: TripJackHotelSearchResultDTO): MappedInventoryHotel {
    return {
      starRating: dto.starRating,
      address: dto.address,
      title: dto.name,
    };
  }
}
