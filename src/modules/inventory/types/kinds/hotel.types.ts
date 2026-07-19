export interface HotelRoomType {
  id: string;
  name: string;
  category?: string;
  capacity: number;
  price: number;
  discountPrice?: number | null;
  extraPersonCharge?: number | null;
  refundable: boolean;
  description?: string;
  rules?: string;
  amenities?: string[];
  images?: string[];
}

export interface HotelDetails {
  starRating: number;
  address: string;
  latitude?: number;
  longitude?: number;
  rooms?: number;
  avgRate?: number;
  slug?: string;
  shortDescription?: string;
  longDescription?: string;
  points?: string;
  policies?: string;
  rules?: string;
  bannerImage?: string | null;
  images?: string[];
  roomTypes?: HotelRoomType[];
}
