import 'dotenv/config';
import { prisma } from '../src/shared/database/prisma-client';

async function main() {
  console.log('Starting Database City Linker...');
  console.log('Linking TripJack JSON citycode to Postgres Relations...');

  try {
    const sampleHotel = await prisma.tjHotel.findFirst({
      select: { tjHotelId: true, name: true, address: true, cityRegionId: true }
    });
    
    console.log('--- TRIPJACK HOTEL RAW DATA DEBUG ---');
    console.log(JSON.stringify(sampleHotel, null, 2));
    console.log('-------------------------------------');
    
  } catch (error) {
    console.error('Error linking cities:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
