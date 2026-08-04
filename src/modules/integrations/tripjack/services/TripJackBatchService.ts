import { TripJackApiClientService } from './TripJackApiClientService';
import { TripJackDbService } from './TripJackDbService';
import { TripJackTransformer } from '../transformers/TripJackTransformer';
import { prisma } from '@/shared/database/prisma-client';


export class TripJackBatchService {
  constructor(
    private apiClient: TripJackApiClientService = new TripJackApiClientService(),
    private dbService: TripJackDbService = new TripJackDbService()
  ) {}

  /**
   * Syncs Countries in one batch.
   */
  async processCountriesBatch(): Promise<number> {
    const rawCountries = await this.apiClient.fetchCountries();
    const validatedCountries = TripJackTransformer.transformCountries(rawCountries);
    await this.dbService.upsertCountries(validatedCountries);
    return validatedCountries.length;
  }

  /**
   * Processes a single page/cursor of Cities.
   * Returns { nextCursor, count }
   */
  async processCitiesBatch(cursor?: string): Promise<{ nextCursor?: string, hasMore: boolean, count: number }> {
    const response = await this.apiClient.fetchCityRegionIds(2000, cursor);
    const validatedCities = TripJackTransformer.transformCities(response.data);
    
    if (validatedCities.length > 0) {
      await this.dbService.upsertCities(validatedCities);
    }

    return {
      nextCursor: response.nextCursor,
      hasMore: response.hasMore,
      count: validatedCities.length
    };
  }

  /**
   * Processes a single page of Hotel Mapping for a given country.
   */
  async processHotelMappingBatch(countryName: string, page: number): Promise<{ totalPages: number, count: number }> {
    const response = await this.apiClient.fetchHotelMapping(page, 2000, countryName);
    const validatedMappings = TripJackTransformer.transformHotelMappings(response.hotels);

    if (validatedMappings.length > 0) {
      await this.dbService.upsertHotelMapping(validatedMappings);
    }

    return {
      totalPages: response.totalPages,
      count: validatedMappings.length
    };
  }

  /**
   * Processes a single chunk of up to 100 Hotel IDs to fetch static content.
   */
  async processHotelContentBatch(hotelIds: string[]): Promise<{ count: number }> {
    if (hotelIds.length === 0) return { count: 0 };
    
    const response = await this.apiClient.fetchHotelContent(hotelIds);
    const validatedHotels = TripJackTransformer.transformHotelContent(response);

    if (validatedHotels.length > 0) {
      await this.dbService.upsertHotelContent(validatedHotels);
    }

    return { count: validatedHotels.length };
  }
}

