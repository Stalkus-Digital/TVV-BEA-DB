/**
 * TripJack Hotel Static Detail Response — POST /hms/v3/hotel/static-detail
 * Source: TripJack Hotels API v3.0
 */

export interface TripJackHotelStaticDetailResponseDTO {
  tjHotelId: string;
  unicaId?: string;
  name: string;
  is_active: boolean;
  star_rating?: string;
  property_type?: {
    id: string;
    name: string;
  };
  chain?: {
    id: number;
    name: string;
  };
  locale?: {
    address: {
      fulladdr: string;
      line_1?: string;
      line_2?: string;
      region?: string;
      city?: string;
      citycode?: string;
      statename?: string;
      regioncode?: string;
      countryname?: string;
      countrycode?: string;
      postal_code?: string;
    };
    coordinates?: {
      lat: number;
      long: number;
    };
    phone?: string[];
    fax?: string[];
    email?: string[];
  };
  policies?: {
    checkInCheckOut?: {
      checkin_from?: string;
      checkin_till?: string;
      checkout_from?: string;
      checkout_till?: string;
      checkin_min_age?: string;
    };
    instructions?: string;
    special_instructions?: string;
    know_before_you_go?: string;
    mandatory_fees?: string;
    optional_fees?: string;
    houseRules?: Record<string, string>;
  };
  amenities?: Record<string, { id: string; name: string }>;
  images?: {
    caption?: string;
    is_hero_image?: boolean;
    category?: number;
    links?: Record<string, { href: string }>;
  }[];
  descriptions?: Record<string, string>;
  rooms?: Record<string, {
    id: string;
    name: string;
    room_count?: number;
    living_room_count?: number;
    descriptions?: {
      overview?: string;
    };
    amenities?: Record<string, { id: string; name: string }>;
    images?: any[];
    bed_config?: any;
    area?: {
      square_meters?: number;
      square_feet?: number;
    };
    views?: Record<string, { id: string; name: string }>;
    occupancy?: {
      max_allowed?: {
        total?: number;
        children?: number;
        adults?: number;
      };
    };
  }>;
  status: {
    success: boolean;
    httpStatus?: number;
  };
}
