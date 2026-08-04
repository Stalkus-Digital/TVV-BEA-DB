import { TripJackApiClientService } from './TripJackApiClientService';
import { TripJackDbService } from './TripJackDbService';

export class TripJackSyncOrchestratorService {
  constructor(
    private apiClient: TripJackApiClientService = new TripJackApiClientService(),
    private dbService: TripJackDbService = new TripJackDbService()
  ) {}

  async syncCountries(): Promise<void> {
    console.log('[TripJack] Starting Countries Sync...');
    const countries = await this.apiClient.fetchCountries();
    await this.dbService.upsertCountries(countries);
    console.log(`[TripJack] Successfully synced ${countries.length} countries.`);
  }

  async syncCities(): Promise<void> {
    console.log('[TripJack] Starting Cities Sync...');
    let hasMore = true;
    let cursor: string | undefined = undefined;
    let totalSynced = 0;

    while (hasMore) {
      const response = await this.apiClient.fetchCityRegionIds(2000, cursor);
      if (response.data && response.data.length > 0) {
        await this.dbService.upsertCities(response.data);
        totalSynced += response.data.length;
        console.log(`[TripJack] Synced batch of ${response.data.length} cities. Total: ${totalSynced}`);
      }
      
      hasMore = response.hasMore;
      cursor = response.nextCursor;
      
      // Delay to respect potential rate limits
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    console.log(`[TripJack] Successfully synced all cities. Total: ${totalSynced}`);
  }

  async syncHotelMapping(): Promise<void> {
    // Note: We need either countryName or regionIds for hotel mapping.
    // This job would first fetch all countries from our DB, then loop through them.
    console.log('[TripJack] Starting Hotel Mapping Sync (Not fully implemented - requires looping over countries from DB)...');
    // Implementation would fetch countries from DB, then for each country:
    // let page = 0;
    // let totalPages = 1;
    // while (page < totalPages) {
    //   const response = await this.apiClient.fetchHotelMapping(page, 2000, country.name);
    //   await this.dbService.upsertHotelMapping(response.hotels);
    //   totalPages = response.totalPages;
    //   page++;
    // }
  }

  async syncHotelContent(hotelIds: string[]): Promise<void> {
    console.log(`[TripJack] Starting Hotel Content Sync for ${hotelIds.length} hotels...`);
    // Split into chunks of 100
    const chunkSize = 100;
    for (let i = 0; i < hotelIds.length; i += chunkSize) {
      const chunk = hotelIds.slice(i, i + chunkSize);
      const hotels = await this.apiClient.fetchHotelContent(chunk);
      await this.dbService.upsertHotelContent(hotels);
      console.log(`[TripJack] Synced content for chunk ${i / chunkSize + 1}`);
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }
}
