import { err, ok, type Result } from "@/shared/types";
import { ValidationError } from "@/shared/errors";
import type { DestinationSeo } from "../types/destination";

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function validateOptionalString(value: unknown, field: string): Result<string | null, ValidationError> {
  if (value === undefined || value === null) return ok(null);
  if (typeof value !== "string") return err(new ValidationError(`${field} must be a string or null`));
  return ok(value.trim().length > 0 ? value : null);
}

function validateSeo(input: unknown): Result<DestinationSeo, ValidationError> {
  if (input === undefined || input === null) return ok({});
  if (typeof input !== "object") return err(new ValidationError("seo must be an object"));
  const { metaTitle, metaDescription, canonicalUrl, ogImageUrl, focusKeyword } = input as Record<string, unknown>;
  const fields: (keyof DestinationSeo)[] = ["metaTitle", "metaDescription", "canonicalUrl", "ogImageUrl", "focusKeyword"];
  const values = { metaTitle, metaDescription, canonicalUrl, ogImageUrl, focusKeyword };
  for (const field of fields) {
    const value = values[field];
    if (value !== undefined && typeof value !== "string") {
      return err(new ValidationError(`seo.${field} must be a string`));
    }
  }
  const seo: DestinationSeo = {};
  if (typeof metaTitle === "string") seo.metaTitle = metaTitle;
  if (typeof metaDescription === "string") seo.metaDescription = metaDescription;
  if (typeof canonicalUrl === "string") seo.canonicalUrl = canonicalUrl;
  if (typeof ogImageUrl === "string") seo.ogImageUrl = ogImageUrl;
  if (typeof focusKeyword === "string") seo.focusKeyword = focusKeyword;
  return ok(seo);
}

export interface CreateDestinationInput {
  name: string;
  slug: string;
  countryId: string | null;
  stateId: string | null;
  cityId: string | null;
  regionId: string | null;
  parentDestinationId: string | null;
  categoryIds: string[];
  description: string | null;
  latitude: number | null;
  longitude: number | null;
  seo: DestinationSeo;
}

export function validateCreateDestination(input: unknown): Result<CreateDestinationInput, ValidationError> {
  if (typeof input !== "object" || input === null) return err(new ValidationError("Request body must be an object"));
  const body = input as Record<string, unknown>;

  if (!isNonEmptyString(body.name)) return err(new ValidationError("name is required"));
  
  const countryId = validateOptionalString(body.countryId, "countryId");
  if (!countryId.ok) return countryId;

  const slugSource = isNonEmptyString(body.slug) ? (body.slug as string) : (body.name as string);
  const slug = slugify(slugSource);
  if (slug.length === 0) return err(new ValidationError("slug could not be derived — provide a valid name or slug"));

  const stateId = validateOptionalString(body.stateId, "stateId");
  if (!stateId.ok) return stateId;
  const cityId = validateOptionalString(body.cityId, "cityId");
  if (!cityId.ok) return cityId;
  const regionId = validateOptionalString(body.regionId, "regionId");
  if (!regionId.ok) return regionId;
  const parentDestinationId = validateOptionalString(body.parentDestinationId, "parentDestinationId");
  if (!parentDestinationId.ok) return parentDestinationId;
  const description = validateOptionalString(body.description, "description");
  if (!description.ok) return description;

  if (body.categoryIds !== undefined && (!Array.isArray(body.categoryIds) || !body.categoryIds.every((c) => typeof c === "string"))) {
    return err(new ValidationError("categoryIds must be an array of strings"));
  }
  if (body.latitude !== undefined && body.latitude !== null && typeof body.latitude !== "number") {
    return err(new ValidationError("latitude must be a number"));
  }
  if (body.longitude !== undefined && body.longitude !== null && typeof body.longitude !== "number") {
    return err(new ValidationError("longitude must be a number"));
  }

  const seo = validateSeo(body.seo);
  if (!seo.ok) return seo;

  return ok({
    name: body.name as string,
    slug,
    countryId: countryId.value,
    stateId: stateId.value,
    cityId: cityId.value,
    regionId: regionId.value,
    parentDestinationId: parentDestinationId.value,
    categoryIds: (body.categoryIds as string[] | undefined) ?? [],
    description: description.value,
    latitude: (body.latitude as number | null | undefined) ?? null,
    longitude: (body.longitude as number | null | undefined) ?? null,
    seo: seo.value,
  });
}

export interface UpdateDestinationInput {
  name?: string;
  description?: string | null;
  categoryIds?: string[];
  isFeatured?: boolean;
  seo?: DestinationSeo;
  status?: any;
}

export function validateUpdateDestination(input: unknown): Result<UpdateDestinationInput, ValidationError> {
  if (typeof input !== "object" || input === null) return err(new ValidationError("Request body must be an object"));
  const body = input as Record<string, unknown>;
  const output: UpdateDestinationInput = {};

  if (body.name !== undefined) {
    if (!isNonEmptyString(body.name)) return err(new ValidationError("name must be a non-empty string"));
    output.name = body.name;
  }
  if (body.description !== undefined) {
    const description = validateOptionalString(body.description, "description");
    if (!description.ok) return description;
    output.description = description.value;
  }
  if (body.categoryIds !== undefined) {
    if (!Array.isArray(body.categoryIds) || !body.categoryIds.every((c) => typeof c === "string")) {
      return err(new ValidationError("categoryIds must be an array of strings"));
    }
    output.categoryIds = body.categoryIds as string[];
  }
  if (body.isFeatured !== undefined) {
    if (typeof body.isFeatured !== "boolean") return err(new ValidationError("isFeatured must be a boolean"));
    output.isFeatured = body.isFeatured;
  }
  if (body.seo !== undefined) {
    const seo = validateSeo(body.seo);
    if (!seo.ok) return seo;
    output.seo = seo.value;
  }
  if (body.status !== undefined) {
    if (typeof body.status !== "string") return err(new ValidationError("status must be a string"));
    output.status = body.status as any; // Cast to bypass strict type matching on enum
  }

  return ok(output);
}

export interface CreateFaqInput {
  question: string;
  answer: string;
  position?: number;
}

export function validateCreateFaq(input: unknown): Result<CreateFaqInput, ValidationError> {
  if (typeof input !== "object" || input === null) return err(new ValidationError("Request body must be an object"));
  const { question, answer, position } = input as Record<string, unknown>;
  if (!isNonEmptyString(question)) return err(new ValidationError("question is required"));
  if (!isNonEmptyString(answer)) return err(new ValidationError("answer is required"));
  if (position !== undefined && typeof position !== "number") return err(new ValidationError("position must be a number"));
  return ok({ question, answer, position: position as number | undefined });
}

export interface CreateGalleryImageInput {
  url: string;
  altText?: string;
  position?: number;
}

export function validateCreateGalleryImage(input: unknown): Result<CreateGalleryImageInput, ValidationError> {
  if (typeof input !== "object" || input === null) return err(new ValidationError("Request body must be an object"));
  const { url, altText, position } = input as Record<string, unknown>;
  if (!isNonEmptyString(url)) return err(new ValidationError("url is required"));
  if (altText !== undefined && typeof altText !== "string") return err(new ValidationError("altText must be a string"));
  if (position !== undefined && typeof position !== "number") return err(new ValidationError("position must be a number"));
  return ok({ url, altText: altText as string | undefined, position: position as number | undefined });
}
