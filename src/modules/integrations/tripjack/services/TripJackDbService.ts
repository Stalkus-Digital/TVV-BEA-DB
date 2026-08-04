import { prisma } from '@/shared/database/prisma-client';

// Assuming global prisma instance is injected or imported in real module

export class TripJackDbService {
  async upsertCountries(countryNames: string[]): Promise<void> {
    await prisma.$transaction(
      countryNames.map(name => 
        prisma.tjCountry.upsert({
          where: { name },
          update: {}, // No fields to update for now
          create: { name }
      ),
      { maxWait: 10000, timeout: 60000 }
    );
  }

  async upsertCities(cities: any[]): Promise<void> {
    await prisma.$transaction(
      cities.map(city => 
        prisma.tjCityRegion.upsert({
          where: { cityRegionId: city.cityRegionId },
          update: {
            cityName: city.cityName,
            regionName: city.regionName,
            countryName: city.countryName,
            regionType: city.regionType,
            fullRegionName: city.fullRegionName,
          },
          create: {
            cityRegionId: city.cityRegionId,
            cityName: city.cityName,
            regionName: city.regionName,
            countryName: city.countryName,
            regionType: city.regionType,
            fullRegionName: city.fullRegionName,
          }
        })
      ),
      { maxWait: 10000, timeout: 60000 }
    );
  }

  async upsertHotelMapping(mappings: any[]): Promise<void> {
    await prisma.$transaction(
      mappings.map(mapping => 
        prisma.tjHotelMapping.upsert({
          where: { tjHotelId: mapping.tjHotelId },
          update: {
            unicaId: mapping.unicaId
          },
          create: {
            tjHotelId: mapping.tjHotelId,
            unicaId: mapping.unicaId
          }
        })
      ),
      { maxWait: 10000, timeout: 60000 }
    );
  }

  async upsertHotelContent(hotels: any[]): Promise<void> {
    await prisma.$transaction(
      hotels.map(hotel => 
        prisma.tjHotel.upsert({
          where: { tjHotelId: hotel.tjHotelId },
          update: {
            unicaId: hotel.unicaId,
            name: hotel.name,
            isActive: hotel.is_active ?? true,
            starRating: hotel.star_rating,
            propertyTypeId: hotel.property_type?.id,
            propertyTypeName: hotel.property_type?.name,
            countryName: hotel.locale?.address?.countryname?.toUpperCase(),
            // cityRegionId comes from mapping or city endpoint. We can try linking it if available, 
            // but hotel response contains regioncode/citycode.
            address: hotel.locale?.address ?? {},
            coordinates: hotel.locale?.coordinates ?? {},
            policies: hotel.policies ?? {},
            amenities: hotel.amenities ?? {},
            images: hotel.images ?? [],
            descriptions: hotel.descriptions ?? {},
          },
          create: {
            tjHotelId: hotel.tjHotelId,
            unicaId: hotel.unicaId,
            name: hotel.name,
            isActive: hotel.is_active ?? true,
            starRating: hotel.star_rating,
            propertyTypeId: hotel.property_type?.id,
            propertyTypeName: hotel.property_type?.name,
            countryName: hotel.locale?.address?.countryname?.toUpperCase(),
            address: hotel.locale?.address ?? {},
            coordinates: hotel.locale?.coordinates ?? {},
            policies: hotel.policies ?? {},
            amenities: hotel.amenities ?? {},
            images: hotel.images ?? [],
            descriptions: hotel.descriptions ?? {},
          }
        })
      ),
      { maxWait: 10000, timeout: 60000 }
    );
  }
}

