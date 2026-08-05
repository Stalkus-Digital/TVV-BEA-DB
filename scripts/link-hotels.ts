import { prisma } from '../src/shared/database/prisma-client';

async function main() {
  console.log('Starting Database City Linker...');
  console.log('Linking TripJack JSON citycode to Postgres Relations...');

  try {
    const result = await prisma.$executeRaw`
      UPDATE tj_hotels 
      SET "cityRegionId" = CAST(address->>'citycode' AS INTEGER) 
      WHERE address->>'citycode' IS NOT NULL 
        AND address->>'citycode' != ''
        AND "cityRegionId" IS NULL;
    `;
    
    console.log(`Successfully linked ${result} hotels to their cities!`);
    console.log('Search by City Name (e.g. "DUBAI") will now work perfectly.');
  } catch (error) {
    console.error('Error linking cities:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
