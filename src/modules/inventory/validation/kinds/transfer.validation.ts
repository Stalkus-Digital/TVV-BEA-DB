import { err, ok, type Result } from "@/shared/types";
import { ValidationError } from "@/shared/errors";
import { TransferMode, type TransferDetails } from "../../types/kinds";

export function validateTransferDetails(input: unknown): Result<TransferDetails, ValidationError> {
  if (typeof input !== "object" || input === null) {
    return err(new ValidationError("Transfer details must be an object"));
  }
  const { mode, originDestinationId, targetDestinationId } = input as Record<string, unknown>;
  const validModes = Object.values(TransferMode) as string[];

  if (typeof mode !== "string" || !validModes.includes(mode)) {
    return err(new ValidationError(`mode must be one of: ${validModes.join(", ")}`));
  }
  if (typeof originDestinationId !== "string" || originDestinationId.trim().length === 0) {
    return err(new ValidationError("originDestinationId is required"));
  }
  if (typeof targetDestinationId !== "string" || targetDestinationId.trim().length === 0) {
    return err(new ValidationError("targetDestinationId is required"));
  }

  return ok({
    mode: mode as TransferDetails["mode"],
    originDestinationId,
    targetDestinationId,
  });
}
