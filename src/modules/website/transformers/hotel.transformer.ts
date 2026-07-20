import type { HotelDetails, HotelRoomType } from "@/modules/inventory/types/kinds";
import type { HotelItem } from "@/modules/inventory/types/inventory-item";
import type { Destination } from "@/modules/destination";
import type {
  WebsiteHotelDetailDTO,
  WebsiteHotelRoomDTO,
  WebsiteHotelSummaryDTO,
} from "../dto/website-hotel.dto";

function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
}

export function resolveHotelSlug(item: HotelItem): string {
  const details = item.details as HotelDetails;
  if (typeof details.slug === "string" && details.slug.trim()) return details.slug.trim();
  return slugify(item.title) || item.id;
}

function roomEffectivePrice(room: HotelRoomType): number {
  if (typeof room.discountPrice === "number" && room.discountPrice > 0 && room.discountPrice < room.price) {
    return room.discountPrice;
  }
  return room.price;
}

export function resolveStartingPrice(details: HotelDetails): number | null {
  const rooms = Array.isArray(details.roomTypes) ? details.roomTypes : [];
  if (rooms.length > 0) {
    const prices = rooms.map(roomEffectivePrice).filter((n) => typeof n === "number" && n >= 0);
    if (prices.length > 0) return Math.min(...prices);
  }
  if (typeof details.avgRate === "number" && details.avgRate > 0) return details.avgRate;
  return null;
}

function toRoomDTO(room: HotelRoomType): WebsiteHotelRoomDTO {
  return {
    id: room.id,
    name: room.name,
    category: room.category?.trim() || null,
    capacity: room.capacity,
    price: room.price,
    discountPrice: room.discountPrice ?? null,
    extraPersonCharge: room.extraPersonCharge ?? null,
    refundable: Boolean(room.refundable),
    description: room.description?.trim() || null,
    rules: room.rules?.trim() || null,
    amenities: Array.isArray(room.amenities) ? room.amenities.filter((a) => typeof a === "string" && a.length > 0) : [],
    images: Array.isArray(room.images) ? room.images.filter((u) => typeof u === "string" && u.length > 0) : [],
  };
}

export function toHotelSummary(
  item: HotelItem,
  destination: Destination | null,
): WebsiteHotelSummaryDTO {
  const details = item.details as HotelDetails;
  const roomTypes = Array.isArray(details.roomTypes) ? details.roomTypes : [];
  const heroImage = details.bannerImage ?? (Array.isArray(details.images) ? details.images[0] : null) ?? null;

  return {
    id: item.id,
    slug: resolveHotelSlug(item),
    name: item.title,
    destinationId: item.destinationId,
    destinationName: destination?.name ?? null,
    destinationSlug: destination?.slug ?? null,
    starRating: details.starRating || 3,
    shortDescription: details.shortDescription?.trim() || null,
    heroImage,
    startingPrice: resolveStartingPrice(details),
    currency: "INR",
    roomTypeCount: roomTypes.length,
  };
}

export function toHotelDetail(
  item: HotelItem,
  destination: Destination | null,
): WebsiteHotelDetailDTO {
  const details = item.details as HotelDetails;
  const summary = toHotelSummary(item, destination);
  const roomTypes = Array.isArray(details.roomTypes) ? details.roomTypes : [];
  const gallery = Array.isArray(details.images)
    ? details.images.filter((u): u is string => typeof u === "string" && u.length > 0)
    : [];

  return {
    ...summary,
    address: details.address?.trim() || null,
    longDescription: details.longDescription?.trim() || null,
    points: details.points?.trim() || null,
    policies: details.policies?.trim() || null,
    rules: details.rules?.trim() || null,
    gallery,
    roomTypes: roomTypes.map(toRoomDTO),
    bookingMode: details.bookingMode === "INSTANT_BOOKING" ? "INSTANT_BOOKING" : "ENQUIRY",
  };
}
