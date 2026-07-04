import { err, ok, type Result } from "@/shared/types";
import { ValidationError } from "@/shared/errors";
import { PackageSourceType, type PackageSeo } from "../types/package";

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

export function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/** e.g. "PKG-ANDAMAN-5N6D-001" — uppercase letters, digits, and hyphens only. */
const PACKAGE_CODE_PATTERN = /^[A-Z0-9](?:[A-Z0-9-]{1,48}[A-Z0-9])?$/;

export function validatePackageCode(code: unknown): Result<string, ValidationError> {
  if (!isNonEmptyString(code)) return err(new ValidationError("code is required"));
  const normalized = code.trim().toUpperCase();
  if (!PACKAGE_CODE_PATTERN.test(normalized)) {
    return err(
      new ValidationError("code must be 2-50 characters of uppercase letters, digits, and hyphens only")
    );
  }
  return ok(normalized);
}

function validateSeo(input: unknown): Result<PackageSeo, ValidationError> {
  if (input === undefined || input === null) return ok({});
  if (typeof input !== "object") return err(new ValidationError("seo must be an object"));
  const { metaTitle, metaDescription, canonicalUrl, ogImageUrl, focusKeyword } = input as Record<string, unknown>;
  const seo: PackageSeo = {};
  for (const [key, value] of Object.entries({ metaTitle, metaDescription, canonicalUrl, ogImageUrl, focusKeyword })) {
    if (value !== undefined && typeof value !== "string") {
      return err(new ValidationError(`seo.${key} must be a string`));
    }
  }
  if (typeof metaTitle === "string") seo.metaTitle = metaTitle;
  if (typeof metaDescription === "string") seo.metaDescription = metaDescription;
  if (typeof canonicalUrl === "string") seo.canonicalUrl = canonicalUrl;
  if (typeof ogImageUrl === "string") seo.ogImageUrl = ogImageUrl;
  if (typeof focusKeyword === "string") seo.focusKeyword = focusKeyword;
  return ok(seo);
}

export interface CreatePackageInput {
  title: string;
  code: string;
  slug: string;
  destinationId: string;
  sourceType: PackageSourceType;
  durationDays: number;
  durationNights: number;
  seo: PackageSeo;
}

export function validateCreatePackage(input: unknown): Result<CreatePackageInput, ValidationError> {
  if (typeof input !== "object" || input === null) return err(new ValidationError("Request body must be an object"));
  const body = input as Record<string, unknown>;

  if (!isNonEmptyString(body.title)) return err(new ValidationError("title is required"));
  if (!isNonEmptyString(body.destinationId)) return err(new ValidationError("destinationId is required"));

  const codeSource = isNonEmptyString(body.code) ? body.code : slugify(body.title as string).toUpperCase();
  const code = validatePackageCode(codeSource);
  if (!code.ok) return code;

  const slugSource = isNonEmptyString(body.slug) ? (body.slug as string) : (body.title as string);
  const slug = slugify(slugSource);
  if (slug.length === 0) return err(new ValidationError("slug could not be derived — provide a valid title or slug"));

  const sourceType = (body.sourceType as string | undefined) ?? PackageSourceType.MANUAL;
  if (!Object.values(PackageSourceType).includes(sourceType as PackageSourceType)) {
    return err(new ValidationError(`sourceType must be one of: ${Object.values(PackageSourceType).join(", ")}`));
  }

  if (typeof body.durationDays !== "number" || body.durationDays <= 0) {
    return err(new ValidationError("durationDays must be a positive number"));
  }
  if (typeof body.durationNights !== "number" || body.durationNights < 0) {
    return err(new ValidationError("durationNights must be a non-negative number"));
  }

  const seo = validateSeo(body.seo);
  if (!seo.ok) return seo;

  return ok({
    title: body.title as string,
    code: code.value,
    slug,
    destinationId: body.destinationId as string,
    sourceType: sourceType as PackageSourceType,
    durationDays: body.durationDays,
    durationNights: body.durationNights,
    seo: seo.value,
  });
}

export interface UpdatePackageInput {
  title?: string;
  seo?: PackageSeo;
}

export function validateUpdatePackage(input: unknown): Result<UpdatePackageInput, ValidationError> {
  if (typeof input !== "object" || input === null) return err(new ValidationError("Request body must be an object"));
  const body = input as Record<string, unknown>;
  const output: UpdatePackageInput = {};

  if (body.title !== undefined) {
    if (!isNonEmptyString(body.title)) return err(new ValidationError("title must be a non-empty string"));
    output.title = body.title;
  }
  if (body.seo !== undefined) {
    const seo = validateSeo(body.seo);
    if (!seo.ok) return seo;
    output.seo = seo.value;
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
