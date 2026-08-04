import { z } from 'zod';

export const TjCountrySchema = z.string().min(1);

export const TjCityRegionSchema = z.object({
  cityRegionId: z.number(),
  cityName: z.string(),
  regionName: z.string(),
  countryName: z.string(),
  regionType: z.string(),
  fullRegionName: z.string(),
});

export const TjHotelMappingSchema = z.object({
  tjHotelId: z.string(),
  unicaId: z.string().nullable().optional(),
});

export const TjHotelContentSchema = z.object({
  tjHotelId: z.string(),
  unicaId: z.string().nullable().optional(),
  name: z.string(),
  is_active: z.boolean().default(true).optional(),
  star_rating: z.string().nullable().optional(),
  property_type: z.object({
    id: z.string().optional(),
    name: z.string().optional(),
  }).nullable().optional(),
  locale: z.object({
    address: z.any().optional(),
    coordinates: z.any().optional(),
  }).nullable().optional(),
  policies: z.any().optional(),
  amenities: z.any().optional(),
  images: z.array(z.any()).optional(),
  descriptions: z.any().optional(),
});

export class TripJackTransformer {
  static transformCountries(rawList: any[]): string[] {
    // Validate each string, filter out invalid ones
    return rawList
      .map(item => TjCountrySchema.safeParse(item))
      .filter(res => res.success)
      .map(res => res.data as string);
  }

  static transformCities(rawList: any[]) {
    return rawList
      .map(item => TjCityRegionSchema.safeParse(item))
      .filter(res => res.success)
      .map(res => res.data);
  }

  static transformHotelMappings(rawList: any[]) {
    return rawList
      .map(item => TjHotelMappingSchema.safeParse(item))
      .filter(res => res.success)
      .map(res => res.data);
  }

  static transformHotelContent(rawList: any[]) {
    return rawList
      .map(item => TjHotelContentSchema.safeParse(item))
      .filter(res => {
        if (!res.success) {
          console.warn(`[TripJackTransformer] Hotel Validation Failed`, res.error);
        }
        return res.success;
      })
      .map(res => {
        const h = res.data;
        // Normalize object structure so it maps perfectly to the Prisma model
        return {
          tjHotelId: h.tjHotelId,
          unicaId: h.unicaId || null,
          name: h.name,
          isActive: h.is_active ?? true,
          starRating: h.star_rating,
          propertyTypeId: h.property_type?.id,
          propertyTypeName: h.property_type?.name,
          countryName: (h as any).locale?.address?.countryname?.toUpperCase(),
          address: (h as any).locale?.address ?? {},
          coordinates: (h as any).locale?.coordinates ?? {},
          policies: h.policies ?? {},
          amenities: h.amenities ?? {},
          images: h.images ?? [],
          descriptions: h.descriptions ?? {},
        };
      });
  }
}
