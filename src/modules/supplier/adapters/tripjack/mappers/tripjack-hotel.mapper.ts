import type { TripJackHotelListingResultDTO } from "../dto/response/hotel-search-response.dto";

/** See tripjack-flight.mapper.ts for the isolation rationale — same reasoning applies here. */
export interface MappedInventoryHotel {
  title: string;
  minimumPrice: number;
  currency: string;
}

export class TripJackHotelMapper {
  toInventoryHotel(dto: TripJackHotelListingResultDTO): MappedInventoryHotel {
    let minPrice = 0;
    let currency = "INR";
    
    if (dto.options && dto.options.length > 0) {
      const pricing = dto.options[0].pricing;
      // Formula: totalPrice = basePrice + taxes + mf + mft
      // TripJack v3 options[].pricing.totalPrice should already include this, but we extract it to be sure.
      minPrice = pricing.totalPrice;
      currency = pricing.currency;
    }

    return {
      title: dto.name,
      minimumPrice: minPrice,
      currency: currency,
    };
  }
}
