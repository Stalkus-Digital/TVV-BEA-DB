import { randomUUID } from "node:crypto";
import { err, ok, type Result } from "@/shared/types";
import { ValidationError } from "@/shared/errors";
import { AdjustmentKind, AdjustmentType, type QuoteAdjustment } from "../types/quote-adjustment";
import type { LeadTraveler, TravelerDetails } from "../types/quote";

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function validateLeadTraveler(input: unknown): Result<LeadTraveler, ValidationError> {
  if (typeof input !== "object" || input === null) return err(new ValidationError("travelerDetails.leadTraveler must be an object"));
  const { name, email, phone } = input as Record<string, unknown>;
  if (!isNonEmptyString(name)) return err(new ValidationError("travelerDetails.leadTraveler.name is required"));
  if (!isNonEmptyString(email)) return err(new ValidationError("travelerDetails.leadTraveler.email is required"));
  if (phone !== undefined && phone !== null && typeof phone !== "string") {
    return err(new ValidationError("travelerDetails.leadTraveler.phone must be a string"));
  }
  return ok({ name, email, phone: (phone as string | undefined) ?? null });
}

export function validateTravelerDetails(input: unknown): Result<TravelerDetails, ValidationError> {
  if (typeof input !== "object" || input === null) return err(new ValidationError("travelerDetails must be an object"));
  const { leadTraveler, adults, children, infants } = input as Record<string, unknown>;

  const lead = validateLeadTraveler(leadTraveler);
  if (!lead.ok) return lead;

  if (typeof adults !== "number" || adults <= 0) return err(new ValidationError("travelerDetails.adults must be a positive number"));
  if (children !== undefined && (typeof children !== "number" || children < 0)) {
    return err(new ValidationError("travelerDetails.children must be a non-negative number"));
  }
  if (infants !== undefined && (typeof infants !== "number" || infants < 0)) {
    return err(new ValidationError("travelerDetails.infants must be a non-negative number"));
  }

  return ok({
    leadTraveler: lead.value,
    adults,
    children: (children as number | undefined) ?? 0,
    infants: (infants as number | undefined) ?? 0,
  });
}

function validateAdjustment(input: unknown, index: number): Result<QuoteAdjustment, ValidationError> {
  if (typeof input !== "object" || input === null) return err(new ValidationError(`adjustments[${index}] must be an object`));
  const { kind, type, label, value } = input as Record<string, unknown>;

  if (typeof kind !== "string" || !Object.values(AdjustmentKind).includes(kind as AdjustmentKind)) {
    return err(new ValidationError(`adjustments[${index}].kind must be one of: ${Object.values(AdjustmentKind).join(", ")}`));
  }
  if (typeof type !== "string" || !Object.values(AdjustmentType).includes(type as AdjustmentType)) {
    return err(new ValidationError(`adjustments[${index}].type must be one of: ${Object.values(AdjustmentType).join(", ")}`));
  }
  if (!isNonEmptyString(label)) return err(new ValidationError(`adjustments[${index}].label is required`));
  if (typeof value !== "number" || value < 0) return err(new ValidationError(`adjustments[${index}].value must be a non-negative number`));

  return ok({ id: randomUUID(), kind: kind as AdjustmentKind, type: type as AdjustmentType, label, value });
}

export function validateAdjustments(input: unknown): Result<QuoteAdjustment[], ValidationError> {
  if (input === undefined) return ok([]);
  if (!Array.isArray(input)) return err(new ValidationError("adjustments must be an array"));
  const adjustments: QuoteAdjustment[] = [];
  for (let i = 0; i < input.length; i++) {
    const validated = validateAdjustment(input[i], i);
    if (!validated.ok) return validated;
    adjustments.push(validated.value);
  }
  return ok(adjustments);
}

function validateCurrency(input: unknown): Result<string, ValidationError> {
  if (input === undefined) return ok("INR");
  if (typeof input !== "string" || input.trim().length !== 3) return err(new ValidationError("currency must be a 3-letter code"));
  return ok(input.toUpperCase());
}

function validateDate(input: unknown, field: string): Result<string | undefined, ValidationError> {
  if (input === undefined) return ok(undefined);
  if (typeof input !== "string" || Number.isNaN(new Date(input).getTime())) {
    return err(new ValidationError(`${field} must be a valid ISO date string`));
  }
  return ok(input);
}

export interface CreateQuoteInput {
  title: string;
  destinationId: string;
  packageId: string | null;
  travelerDetails: TravelerDetails;
  currency: string;
  adjustments: QuoteAdjustment[];
  validFrom: string | undefined;
  validTo: string | undefined;
  internalNotes: string | null;
  customerNotes: string | null;
}

export function validateCreateQuote(input: unknown): Result<CreateQuoteInput, ValidationError> {
  if (typeof input !== "object" || input === null) return err(new ValidationError("Request body must be an object"));
  const body = input as Record<string, unknown>;

  if (!isNonEmptyString(body.title)) return err(new ValidationError("title is required"));
  if (!isNonEmptyString(body.destinationId)) return err(new ValidationError("destinationId is required"));
  if (body.packageId !== undefined && body.packageId !== null && !isNonEmptyString(body.packageId)) {
    return err(new ValidationError("packageId must be a string"));
  }

  const travelerDetails = validateTravelerDetails(body.travelerDetails);
  if (!travelerDetails.ok) return travelerDetails;

  const currency = validateCurrency(body.currency);
  if (!currency.ok) return currency;

  const adjustments = validateAdjustments(body.adjustments);
  if (!adjustments.ok) return adjustments;

  const validFrom = validateDate(body.validFrom, "validFrom");
  if (!validFrom.ok) return validFrom;
  const validTo = validateDate(body.validTo, "validTo");
  if (!validTo.ok) return validTo;

  if (body.internalNotes !== undefined && body.internalNotes !== null && typeof body.internalNotes !== "string") {
    return err(new ValidationError("internalNotes must be a string"));
  }
  if (body.customerNotes !== undefined && body.customerNotes !== null && typeof body.customerNotes !== "string") {
    return err(new ValidationError("customerNotes must be a string"));
  }

  return ok({
    title: body.title as string,
    destinationId: body.destinationId as string,
    packageId: (body.packageId as string | undefined) ?? null,
    travelerDetails: travelerDetails.value,
    currency: currency.value,
    adjustments: adjustments.value,
    validFrom: validFrom.value,
    validTo: validTo.value,
    internalNotes: (body.internalNotes as string | undefined) ?? null,
    customerNotes: (body.customerNotes as string | undefined) ?? null,
  });
}

export interface UpdateQuoteInput {
  title?: string;
  destinationId?: string;
  packageId?: string | null;
  travelerDetails?: TravelerDetails;
  currency?: string;
  adjustments?: QuoteAdjustment[];
  validFrom?: string;
  validTo?: string;
  internalNotes?: string | null;
  customerNotes?: string | null;
}

export function validateUpdateQuote(input: unknown): Result<UpdateQuoteInput, ValidationError> {
  if (typeof input !== "object" || input === null) return err(new ValidationError("Request body must be an object"));
  const body = input as Record<string, unknown>;
  const output: UpdateQuoteInput = {};

  if (body.title !== undefined) {
    if (!isNonEmptyString(body.title)) return err(new ValidationError("title must be a non-empty string"));
    output.title = body.title;
  }
  if (body.destinationId !== undefined) {
    if (!isNonEmptyString(body.destinationId)) return err(new ValidationError("destinationId must be a non-empty string"));
    output.destinationId = body.destinationId;
  }
  if (body.packageId !== undefined) {
    if (body.packageId !== null && !isNonEmptyString(body.packageId)) return err(new ValidationError("packageId must be a string or null"));
    output.packageId = body.packageId as string | null;
  }
  if (body.travelerDetails !== undefined) {
    const travelerDetails = validateTravelerDetails(body.travelerDetails);
    if (!travelerDetails.ok) return travelerDetails;
    output.travelerDetails = travelerDetails.value;
  }
  if (body.currency !== undefined) {
    const currency = validateCurrency(body.currency);
    if (!currency.ok) return currency;
    output.currency = currency.value;
  }
  if (body.adjustments !== undefined) {
    const adjustments = validateAdjustments(body.adjustments);
    if (!adjustments.ok) return adjustments;
    output.adjustments = adjustments.value;
  }
  if (body.validFrom !== undefined) {
    const validFrom = validateDate(body.validFrom, "validFrom");
    if (!validFrom.ok) return validFrom;
    output.validFrom = validFrom.value;
  }
  if (body.validTo !== undefined) {
    const validTo = validateDate(body.validTo, "validTo");
    if (!validTo.ok) return validTo;
    output.validTo = validTo.value;
  }
  if (body.internalNotes !== undefined) {
    if (body.internalNotes !== null && typeof body.internalNotes !== "string") return err(new ValidationError("internalNotes must be a string or null"));
    output.internalNotes = body.internalNotes as string | null;
  }
  if (body.customerNotes !== undefined) {
    if (body.customerNotes !== null && typeof body.customerNotes !== "string") return err(new ValidationError("customerNotes must be a string or null"));
    output.customerNotes = body.customerNotes as string | null;
  }

  return ok(output);
}

export interface RejectQuoteInput {
  reason: string;
}

export function validateRejectQuote(input: unknown): Result<RejectQuoteInput, ValidationError> {
  if (typeof input !== "object" || input === null) return err(new ValidationError("Request body must be an object"));
  const { reason } = input as Record<string, unknown>;
  if (!isNonEmptyString(reason)) return err(new ValidationError("reason is required"));
  return ok({ reason });
}
