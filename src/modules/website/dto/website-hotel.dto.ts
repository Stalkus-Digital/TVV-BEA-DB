export interface WebsiteHotelRoomDTO {
  id: string;
  name: string;
  category: string | null;
  capacity: number;
  price: number;
  discountPrice: number | null;
  extraPersonCharge: number | null;
  refundable: boolean;
  description: string | null;
  rules: string | null;
  amenities: string[];
  images: string[];
}

export interface WebsiteHotelSummaryDTO {
  id: string;
  slug: string;
  name: string;
  destinationId: string | null;
  destinationName: string | null;
  destinationSlug: string | null;
  starRating: number;
  shortDescription: string | null;
  heroImage: string | null;
  startingPrice: number | null;
  currency: string;
  roomTypeCount: number;
}

export interface WebsiteHotelDetailDTO extends WebsiteHotelSummaryDTO {
  address: string | null;
  longDescription: string | null;
  points: string | null;
  policies: string | null;
  rules: string | null;
  gallery: string[];
  roomTypes: WebsiteHotelRoomDTO[];
}
