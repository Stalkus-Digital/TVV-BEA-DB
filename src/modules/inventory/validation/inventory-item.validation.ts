import { err, isErr, ok, type Result } from "@/shared/types";
import { ValidationError } from "@/shared/errors";
import { InventoryKind, type InventoryItemDetails } from "../types";
import { validateActivityDetails } from "./kinds/activity.validation";
import { validateFlightDetails } from "./kinds/flight.validation";
import { validateHotelDetails } from "./kinds/hotel.validation";
import { validateInsuranceDetails } from "./kinds/insurance.validation";
import { validateTransferDetails } from "./kinds/transfer.validation";
import { validateVisaDetails } from "./kinds/visa.validation";

type DetailValidator = (input: unknown) => Result<InventoryItemDetails, ValidationError>;

/**
 * The Kind Registry for validation dispatch — one entry per InventoryKind.
 * Adding a 7th kind later means adding one entry here, not touching the
 * create/update functions below.
 */
const detailValidators: Record<InventoryKind, DetailValidator> = {
  HOTEL: validateHotelDetails,
  FLIGHT: validateFlightDetails,
  ACTIVITY: validateActivityDetails,
  TRANSFER: validateTransferDetails,
  VISA: validateVisaDetails,
  INSURANCE: validateInsuranceDetails,
};

export interface CreateInventoryItemInput {
  kind: InventoryKind;
  destinationId: string | null;
  title: string;
  details: InventoryItemDetails;
}

export function validateCreateInventoryItem(input: unknown): Result<CreateInventoryItemInput, ValidationError> {
  if (typeof input !== "object" || input === null) {
    return err(new ValidationError("Request body must be an object"));
  }
  const { kind, destinationId, title, details } = input as Record<string, unknown>;

  if (typeof kind !== "string" || !(kind in detailValidators)) {
    return err(new ValidationError(`kind must be one of: ${Object.keys(detailValidators).join(", ")}`));
  }
  if (typeof title !== "string" || title.trim().length === 0) {
    return err(new ValidationError("title is required"));
  }
  if (destinationId !== undefined && destinationId !== null && typeof destinationId !== "string") {
    return err(new ValidationError("destinationId must be a string or null"));
  }
  const parsedDestinationId = typeof destinationId === "string" && destinationId.trim() === "" ? null : destinationId;

  const validatedDetails = detailValidators[kind as InventoryKind](details);
  if (isErr(validatedDetails)) return validatedDetails;

  return ok({
    kind: kind as InventoryKind,
    destinationId: (parsedDestinationId as string | null | undefined) ?? null,
    title,
    details: validatedDetails.value,
  });
}

export interface UpdateInventoryItemInput {
  title?: string;
  destinationId?: string | null;
  details?: InventoryItemDetails;
}

export function validateUpdateInventoryItem(
  input: unknown,
  existingKind: InventoryKind
): Result<UpdateInventoryItemInput, ValidationError> {
  if (typeof input !== "object" || input === null) {
    return err(new ValidationError("Request body must be an object"));
  }
  const { title, destinationId, details } = input as Record<string, unknown>;
  const output: UpdateInventoryItemInput = {};

  if (title !== undefined) {
    if (typeof title !== "string" || title.trim().length === 0) {
      return err(new ValidationError("title must be a non-empty string"));
    }
    output.title = title;
  }

  if (destinationId !== undefined) {
    if (destinationId !== null && typeof destinationId !== "string") {
      return err(new ValidationError("destinationId must be a string or null"));
    }
    output.destinationId = destinationId as string | null;
  }

  if (details !== undefined) {
    const validatedDetails = detailValidators[existingKind](details);
    if (isErr(validatedDetails)) return validatedDetails;
    output.details = validatedDetails.value;
  }

  return ok(output);
}
