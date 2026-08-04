import { TripJackApiClientService } from './services/TripJackApiClientService';
import { TripJackDbService } from './services/TripJackDbService';
import { TripJackSyncOrchestratorService } from './services/TripJackSyncOrchestratorService';

export const tripJackModule = {
  services: {
    // The following services will be initialized by the dependency injection container
    // apiClient: new TripJackApiClientService(),
    // db: new TripJackDbService(),
    // orchestrator: new TripJackSyncOrchestratorService(),
  },
};
