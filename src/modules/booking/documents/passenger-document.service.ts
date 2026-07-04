import { err, isErr, type Result } from "@/shared/types";
import { BaseService, type ServiceContext } from "@/shared/services";
import { NotFoundError, type AppError } from "@/shared/errors";
import type { PassengerDocument } from "../types/document";
import type { DocumentRepository } from "../repositories/document.repository";
import type { TravellerRepository } from "../repositories/traveller.repository";
import { validateAddDocument } from "../validation/document.validation";

export class PassengerDocumentService extends BaseService {
  constructor(
    context: ServiceContext,
    private readonly documents: DocumentRepository,
    private readonly travellers: TravellerRepository
  ) {
    super(context);
  }

  async listByBooking(bookingId: string): Promise<Result<PassengerDocument[], AppError>> {
    return this.documents.findByBooking(bookingId);
  }

  async add(bookingId: string, input: unknown): Promise<Result<PassengerDocument, AppError>> {
    const validated = validateAddDocument(input);
    if (isErr(validated)) return validated;
    const value = validated.value;

    if (value.travellerId) {
      const traveller = await this.travellers.findById(value.travellerId);
      if (isErr(traveller)) return traveller;
      if (!traveller.value || traveller.value.bookingId !== bookingId) {
        return err(new NotFoundError(`Traveller "${value.travellerId}" not found on booking "${bookingId}"`));
      }
    }

    this.logger.info("Adding passenger document", { bookingId, kind: value.kind });
    return this.documents.create({
      bookingId,
      travellerId: value.travellerId,
      kind: value.kind,
      fileUrl: value.fileUrl,
      fileName: value.fileName,
      issuedAt: value.issuedAt,
      expiresAt: value.expiresAt,
      notes: value.notes,
      createdAt: new Date().toISOString(),
    });
  }
}
