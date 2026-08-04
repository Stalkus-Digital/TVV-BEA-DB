import { Queue, Worker, QueueEvents, Job } from 'bullmq';
import Redis from 'ioredis';

// Reuse a shared redis connection for all queues to prevent connection exhaustion
const redisConnection = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: null,
});

export const TripJackQueues = {
  countries: new Queue('tripjack-country-queue', { connection: redisConnection }),
  cities: new Queue('tripjack-city-queue', { connection: redisConnection }),
  mappings: new Queue('tripjack-mapping-queue', { connection: redisConnection }),
  content: new Queue('tripjack-content-queue', { connection: redisConnection }),
};

// Generic worker options to ensure standard retry behavior and concurrency limits
const getWorkerOptions = (concurrency: number = 1) => ({
  connection: redisConnection,
  concurrency,
  removeOnComplete: { count: 100 },
  removeOnFail: { count: 100 },
});

// Phase 1 implementation limits worker logic to calling the manager.
// Actual job processing callbacks will be injected by the SyncManager later.

import { SyncCountriesJob } from './jobs/SyncCountriesJob';
import { SyncCitiesJob } from './jobs/SyncCitiesJob';
import { SyncMappingsJob } from './jobs/SyncMappingsJob';
import { SyncContentJob } from './jobs/SyncContentJob';

export const createCountryWorker = () => 
  new Worker('tripjack-country-queue', SyncCountriesJob, getWorkerOptions(1));

export const createCityWorker = () => 
  new Worker('tripjack-city-queue', SyncCitiesJob, getWorkerOptions(1));

export const createMappingWorker = () => 
  new Worker('tripjack-mapping-queue', SyncMappingsJob, getWorkerOptions(2));

export const createContentWorker = () => 
  new Worker('tripjack-content-queue', SyncContentJob, getWorkerOptions(5)); // slightly higher concurrency for content chunks

export const QueueEventHandlers = {
  countries: new QueueEvents('tripjack-country-queue', { connection: redisConnection }),
  cities: new QueueEvents('tripjack-city-queue', { connection: redisConnection }),
  mappings: new QueueEvents('tripjack-mapping-queue', { connection: redisConnection }),
  content: new QueueEvents('tripjack-content-queue', { connection: redisConnection }),
};
