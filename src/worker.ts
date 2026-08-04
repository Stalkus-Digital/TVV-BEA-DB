import 'dotenv/config';
import { 
  createCountryWorker, 
  createCityWorker, 
  createMappingWorker, 
  createContentWorker 
} from './modules/integrations/tripjack/queue';

console.log('🚀 Starting TripJack Sync Workers...');

// Initialize BullMQ Workers to listen to Redis Queues
const workers = [
  createCountryWorker(),
  createCityWorker(),
  createMappingWorker(),
  createContentWorker()
];

// Handle graceful shutdown
const shutdown = async () => {
  console.log('\n🛑 Shutting down workers...');
  await Promise.all(workers.map(w => w.close()));
  console.log('✅ Workers successfully closed.');
  process.exit(0);
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

console.log('✅ Workers are online and listening for sync jobs!');
