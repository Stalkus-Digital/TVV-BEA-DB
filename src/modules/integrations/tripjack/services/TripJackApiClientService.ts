import axios, { AxiosInstance } from 'axios';
import { z } from 'zod';

export class TripJackApiClientService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: process.env.TRIPJACK_API_URL || 'https://apitest-hms.tripjack.com/hms',
      headers: {
        'apikey': process.env.TRIPJACK_API_KEY || '',
        'Content-Type': 'application/json'
      }
    });

    this.client.interceptors.response.use(
      response => response,
      error => {
        // Here we could implement Opossum circuit breaking or retry logic
        console.error('[TripJack API Error]', error.response?.data || error.message);
        return Promise.reject(error);
      }
    );
  }

  async fetchCountries(): Promise<string[]> {
    const response = await this.client.get('/v3/content/fetch-countries');
    const data = response.data;
    
    if (!data.status?.success) {
      throw new Error(`Failed to fetch countries: ${JSON.stringify(data.status)}`);
    }

    return data.hotelCountries || [];
  }

  async fetchCityRegionIds(limit: number = 2000, cursor?: string): Promise<{ data: any[], nextCursor?: string, hasMore: boolean }> {
    const response = await this.client.get('/v3/content/fetch-city-regionIds', {
      params: { limit, cursor }
    });
    const data = response.data;
    
    if (!data.status?.success) {
      throw new Error(`Failed to fetch cities: ${JSON.stringify(data.status)}`);
    }

    return {
      data: data.hotelCityRegionIds || [],
      nextCursor: data.nextCursor,
      hasMore: data.hasMore || false
    };
  }

  async fetchHotelMapping(page: number = 0, size: number = 2000, countryName?: string, regionIds?: string[]): Promise<{ hotels: any[], totalPages: number }> {
    const payload: any = { page, size };
    if (countryName) payload.countryName = countryName;
    if (regionIds && regionIds.length > 0) payload.regionIds = regionIds;

    const response = await this.client.post('/v3/content/fetch-hotel-mapping', payload);
    const data = response.data;

    if (!data.status?.success) {
      throw new Error(`Failed to fetch hotel mapping: ${JSON.stringify(data.status)}`);
    }

    return {
      hotels: data.hotels || [],
      totalPages: data.pageable?.totalPages || 0
    };
  }

  async fetchHotelContent(hotelIds: string[]): Promise<any[]> {
    if (hotelIds.length > 100) {
      throw new Error('Maximum 100 hotel IDs allowed per request for fetch-hotel-content');
    }

    const response = await this.client.post('/v3/content/fetch-hotel-content', { hotelIds });
    const data = response.data;

    if (!data.status?.success) {
      throw new Error(`Failed to fetch hotel content: ${JSON.stringify(data.status)}`);
    }

    return data.hotels || [];
  }
}
