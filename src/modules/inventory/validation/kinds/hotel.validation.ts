import { err, ok, type Result } from "@/shared/types";
import { ValidationError } from "@/shared/errors";
import type { HotelDetails, HotelRoomType } from "../../types/kinds";

function asNumber(value: unknown): number | undefined {
  if (value === undefined || value === null || value === "") return undefined;
  const n = typeof value === "string" ? Number(value) : value;
  return typeof n === "number" && !Number.isNaN(n) ? n : undefined;
}

function asString(value: unknown): string | undefined {
  if (value === undefined || value === null) return undefined;
  if (typeof value !== "string") return undefined;
  return value;
}

function asStringArray(value: unknown): string[] | undefined {
  if (value === undefined || value === null) return undefined;
  if (!Array.isArray(value)) return undefined;
  const urls = value.filter((v): v is string => typeof v === "string" && v.trim().length > 0);
  return urls;
}

function asBoolean(value: unknown, fallback = false): boolean {
  if (typeof value === "boolean") return value;
  if (value === "true" || value === "Yes" || value === "yes") return true;
  if (value === "false" || value === "No" || value === "no") return false;
  return fallback;
}

function validateRoomType(input: unknown, index: number): Result<HotelRoomType, ValidationError> {
  if (typeof input !== "object" || input === null) {
    return err(new ValidationError(`roomTypes[${index}] must be an object`));
  }
  const row = input as Record<string, unknown>;
  const name = asString(row.name)?.trim();
  if (!name) {
    return err(new ValidationError(`roomTypes[${index}].name is required`));
  }

  const capacity = asNumber(row.capacity);
  if (capacity === undefined || capacity < 1) {
    return err(new ValidationError(`roomTypes[${index}].capacity must be a number >= 1`));
  }

  const price = asNumber(row.price);
  if (price === undefined || price < 0) {
    return err(new ValidationError(`roomTypes[${index}].price must be a number >= 0`));
  }

  const discountPrice = asNumber(row.discountPrice);
  if (row.discountPrice !== undefined && row.discountPrice !== null && row.discountPrice !== "" && discountPrice === undefined) {
    return err(new ValidationError(`roomTypes[${index}].discountPrice must be a number`));
  }

  const extraPersonCharge = asNumber(row.extraPersonCharge);
  if (
    row.extraPersonCharge !== undefined &&
    row.extraPersonCharge !== null &&
    row.extraPersonCharge !== "" &&
    extraPersonCharge === undefined
  ) {
    return err(new ValidationError(`roomTypes[${index}].extraPersonCharge must be a number`));
  }

  const images = asStringArray(row.images);
  if (row.images !== undefined && row.images !== null && images === undefined) {
    return err(new ValidationError(`roomTypes[${index}].images must be an array of strings`));
  }

  const amenities = asStringArray(row.amenities);
  if (row.amenities !== undefined && row.amenities !== null && amenities === undefined) {
    return err(new ValidationError(`roomTypes[${index}].amenities must be an array of strings`));
  }

  const id = asString(row.id)?.trim() || crypto.randomUUID();

  return ok({
    id,
    name,
    category: asString(row.category)?.trim() || undefined,
    capacity,
    price,
    discountPrice: discountPrice ?? null,
    extraPersonCharge: extraPersonCharge ?? null,
    refundable: asBoolean(row.refundable, false),
    description: asString(row.description) ?? undefined,
    rules: asString(row.rules) ?? undefined,
    amenities: amenities ?? [],
    images: images ?? [],
  });
}

export function validateHotelDetails(input: unknown): Result<HotelDetails, ValidationError> {
  if (typeof input !== "object" || input === null) {
    return err(new ValidationError("Hotel details must be an object"));
  }
  const {
    starRating,
    rating,
    address,
    latitude,
    longitude,
    rooms,
    avgRate,
    slug,
    roomTypes,
    ...rest
  } = input as Record<string, unknown>;

  let parsedStarRating = typeof starRating === "string" ? Number(starRating) : (starRating ?? rating);
  if (parsedStarRating === undefined || parsedStarRating === null || parsedStarRating === 0 || Number.isNaN(parsedStarRating)) {
    parsedStarRating = 3;
  }

  if (typeof parsedStarRating !== "number" || parsedStarRating < 1 || parsedStarRating > 5) {
    return err(new ValidationError("starRating must be a number between 1 and 5"));
  }

  if (address !== undefined && typeof address !== "string") {
    return err(new ValidationError("address must be a string"));
  }
  const parsedAddress = address ? (address as string).trim() : "";

  if (latitude !== undefined && typeof latitude !== "number") {
    return err(new ValidationError("latitude must be a number"));
  }
  if (longitude !== undefined && typeof longitude !== "number") {
    return err(new ValidationError("longitude must be a number"));
  }

  if (slug !== undefined && slug !== null && typeof slug !== "string") {
    return err(new ValidationError("slug must be a string"));
  }

  let parsedRoomTypes: HotelRoomType[] | undefined;
  if (roomTypes !== undefined && roomTypes !== null) {
    if (!Array.isArray(roomTypes)) {
      return err(new ValidationError("roomTypes must be an array"));
    }
    parsedRoomTypes = [];
    for (let i = 0; i < roomTypes.length; i++) {
      const validated = validateRoomType(roomTypes[i], i);
      if (!validated.ok) return validated;
      parsedRoomTypes.push(validated.value);
    }
  }

  return ok({
    starRating: parsedStarRating as number,
    address: parsedAddress,
    ...(latitude !== undefined ? { latitude: latitude as number } : {}),
    ...(longitude !== undefined ? { longitude: longitude as number } : {}),
    ...(rooms !== undefined ? { rooms: typeof rooms === "string" ? Number(rooms) : (rooms as number) } : {}),
    ...(avgRate !== undefined ? { avgRate: typeof avgRate === "string" ? Number(avgRate) : (avgRate as number) } : {}),
    ...(typeof slug === "string" && slug.trim() ? { slug: slug.trim() } : {}),
    ...(parsedRoomTypes !== undefined ? { roomTypes: parsedRoomTypes } : {}),
    ...rest,
  });
}
