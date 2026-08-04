import axios, { AxiosInstance } from 'axios';
import { TripJackConfig } from '@/modules/supplier/adapters/tripjack/config/tripjack.config';
import { TripJackAuth } from '@/modules/supplier/adapters/tripjack/services/tripjack-auth.service';
import { createLogger } from '@/shared/logger';

export class TripJackApiClientService {
  private client: AxiosInstance;
  private auth: TripJackAuth;

  constructor() {
    // Ensure the baseURL correctly targets the HMS specific subdomain and path
    let baseUrl = process.env.TRIPJACK_API_URL || 'https://apitest.tripjack.com';
    baseUrl = baseUrl.replace(/\/+$/, ''); // remove trailing slash
    
    // If the base URL is the standard TripJack one, inject '-hms'
    if (baseUrl.includes('apitest.tripjack.com')) {
      baseUrl = baseUrl.replace('apitest.tripjack.com', 'apitest-hms.tripjack.com');
    } else if (baseUrl.includes('tripjack.com') && !baseUrl.includes('hms')) {
      baseUrl = baseUrl.replace('tripjack.com', 'hms.tripjack.com');
    }

    this.client = axios.create({
      baseURL: `${baseUrl}/hms/v3/content`,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Dynamically resolve the auth token using the official TripJackAuth flow
    // This supports both static TRIPJACK_TOKEN from .env, OR dynamic agencyId/password login
    const config = TripJackConfig.getInstance();
    this.auth = new TripJackAuth(config, createLogger('TripJackBackgroundWorker'));

    this.client.interceptors.request.use(async (req) => {
      // Must refresh config from DB before each run in case admin updated credentials
      await config.refreshFromIntegrations();
      const tokenResult = await this.auth.getToken();
      if ('value' in tokenResult && typeof tokenResult.value === 'string') {
        req.headers['apikey'] = tokenResult.value;
      }
      return req;
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
    const response = await this.client.get('/fetch-countries');
    const data = response.data;
    
    if (!data.status?.success) {
      throw new Error(`Failed to fetch countries: ${JSON.stringify(data.status)}`);
    }

    return data.hotelCountries || [];
  }

  async fetchCityRegionIds(limit: number = 2000, cursor?: string): Promise<{ data: any[], nextCursor?: string, hasMore: boolean }> {
    const response = await this.client.get('/fetch-city-regionIds', {
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

    const response = await this.client.post('/fetch-hotel-mapping', payload);
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

    const response = await this.client.post('/fetch-hotel-content', { hotelIds });
    const data = response.data;

    if (!data.status?.success) {
      throw new Error(`Failed to fetch hotel content: ${JSON.stringify(data.status)}`);
    }

    return data.hotels || [];
  }
}
