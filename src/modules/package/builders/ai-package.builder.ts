import { err, type Result } from "@/shared/types";
import { ValidationError, type AppError } from "@/shared/errors";
import { PackageSourceType } from "../types/package";
import { PackageItemResolutionMode } from "../types/package-item";
import type { Package } from "../types/package";
import type { PackageDraftBuilder } from "./package-draft-builder";
import type { PackageDraft } from "./package-draft";

interface AIDraftInput extends Omit<PackageDraft, "sourceType"> {
  aiGenerationReferenceId?: string | null;
}

/**
 * Accepts an already-structured draft as if an AI service had produced it —
 * this sprint does NOT call any AI/LLM. Sprint 10 (AI Package Builder) is
 * where a real generation step produces this same PackageDraft shape and
 * hands it to this exact builder; nothing here needs to change for that.
 * aiGeneratedFromId is reserved (nullable) — there is no AI Engine to
 * reference yet.
 */
export class AIPackageBuilder {
  constructor(private readonly draftBuilder: PackageDraftBuilder) {}

  async build(input: unknown): Promise<Result<Package, AppError>> {
    if (typeof input !== "object" || input === null) {
      return err(new ValidationError("Request body must be an object"));
    }
    const draft = input as Partial<AIDraftInput>;
    if (!draft.title || !draft.destinationId || !draft.durationDays || !Array.isArray(draft.days)) {
      return err(new ValidationError("title, destinationId, durationDays, and days are required"));
    }

    const shaped: PackageDraft = {
      ...draft,
      title: draft.title,
      destinationId: draft.destinationId,
      durationDays: draft.durationDays,
      durationNights: draft.durationNights ?? Math.max(0, draft.durationDays - 1),
      sourceType: PackageSourceType.AI_GENERATED,
      aiGeneratedFromId: draft.aiGenerationReferenceId ?? null,
      days: draft.days.map((day) => ({
        ...day,
        items: day.items.map((item) => ({
          ...item,
          resolutionMode: item.resolutionMode ?? PackageItemResolutionMode.PINNED,
        })),
      })),
    };

    return this.draftBuilder.build(shaped);
  }
}
