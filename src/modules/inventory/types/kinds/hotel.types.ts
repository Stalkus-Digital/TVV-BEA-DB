export interface HotelDetails {
  starRating: number;
  address: string;
  latitude?: number;
  longitude?: number;
  rooms?: number;
  avgRate?: number;
  shortDescription?: string;
  longDescription?: string;
  points?: string;
  policies?: string;
  rules?: string;
  bannerImage?: string | null;
  images?: string[];
}
