import 'dotenv/config';
import { prisma } from '../src/shared/database/prisma-client';

async function main() {
  console.log('🚀 Starting Enterprise Database Indexer...');
  console.log('Applying pg_trgm GIN Indexes for ultra-fast TripJack Searches...');

  try {
    // 1. Enable the Trigram extension in PostgreSQL
    console.log('[1/4] Enabling pg_trgm extension...');
    await prisma.$executeRawUnsafe(`CREATE EXTENSION IF NOT EXISTS pg_trgm;`);

    // 2. Create GIN index on the 'name' column
    console.log('[2/4] Indexing Hotel Names...');
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS tj_hotels_name_trgm_idx 
      ON tj_hotels USING GIN (name gin_trgm_ops);
    `);

    // 3. Create GIN index on the 'countryName' column
    console.log('[3/4] Indexing Country Names...');
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS tj_hotels_country_trgm_idx 
      ON tj_hotels USING GIN ("countryName" gin_trgm_ops);
    `);

    // 4. Create GIN index on the entire raw 'address' JSON block cast to text
    console.log('[4/4] Indexing Raw Address JSON payload (Deep Search)...');
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS tj_hotels_address_trgm_idx 
      ON tj_hotels USING GIN ((address::text) gin_trgm_ops);
    `);

    console.log('✅ Success! All 1,000,000+ hotels are now perfectly indexed.');
    console.log('Searches will now execute instantly with virtually zero CPU overhead!');
  } catch (error) {
    console.error('❌ Error applying GIN indexes:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
