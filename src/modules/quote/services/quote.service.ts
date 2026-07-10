import { err, isErr, ok, type PaginatedResult, type Result } from "@/shared/types";
import { BaseService, type ServiceContext } from "@/shared/services";
import { ConflictError, NotFoundError, type AppError } from "@/shared/errors";
import { getDestinationService } from "@/modules/destination";
import { getPackageService } from "@/modules/package";
import { QuoteStatus, type Quote } from "../types/quote";
import type { BookingHandoffPayload } from "../types/quote-conversion";
import type { QuotePdfData } from "../types/quote-pdf";
import type { QuotePriceResult } from "../types/quote-pricing";
import type { QuoteItemRepository } from "../repositories/quote-item.repository";
import type { QuoteListFilter, QuoteRepository } from "../repositories/quote.repository";
import { computeQuotePrice } from "../pricing/quote-pricing-calculator";
import { buildQuotePdfData } from "../pdf/quote-pdf-builder";
import { validateCreateQuote, validateRejectQuote, validateUpdateQuote } from "../validation/quote.validation";
import type { QuoteVersionService } from "./quote-version.service";

const DEFAULT_VALIDITY_DAYS = 14;
const EDITABLE_STATUSES: QuoteStatus[] = [QuoteStatus.DRAFT, QuoteStatus.SENT];
const DECIDABLE_STATUSES: QuoteStatus[] = [QuoteStatus.DRAFT, QuoteStatus.SENT];

function addDays(iso: string, days: number): string {
  const date = new Date(iso);
  date.setDate(date.getDate() + days);
  return date.toISOString();
}

function generateQuoteNumber(sequence: number): string {
  return `QT-${String(sequence).padStart(6, "0")}`;
}

export class QuoteService extends BaseService {
  constructor(
    context: ServiceContext,
    private readonly quotes: QuoteRepository,
    private readonly items: QuoteItemRepository,
    private readonly versionService: QuoteVersionService
  ) {
    super(context);
  }

  async list(filter: QuoteListFilter = {}): Promise<Result<PaginatedResult<Quote>, AppError>> {
    return this.quotes.findByFilter(filter);
  }

  async delete(id: string): Promise<Result<void, AppError>> {
    return this.quotes.delete(id);
  }

  async getById(id: string): Promise<Result<Quote, AppError>> {
    const result = await this.quotes.findById(id);
    if (isErr(result)) return result;
    if (!result.value) return err(new NotFoundError(`Quote "${id}" not found`));
    return ok(result.value);
  }

  /**
   * `customerId` is a distinct parameter, not a validated body field — it
   * must only ever come from the caller's own server-side authenticated
   * context (Sprint 13's Customer module), never from client-supplied
   * input. Defaults to `null`, so every existing admin call site
   * (`createQuoteHandler(body)`) is completely unaffected.
   */
  async create(input: unknown, customerId: string | null = null): Promise<Result<Quote, AppError>> {
    const validated = validateCreateQuote(input);
    if (isErr(validated)) return validated;
    const value = validated.value;

    const destination = await getDestinationService().getById(value.destinationId);
    if (isErr(destination)) return destination;

    if (value.packageId) {
      const pkg = await getPackageService().getById(value.packageId);
      if (isErr(pkg)) return pkg;
    }

    const countResult = await this.quotes.countAll();
    if (isErr(countResult)) return countResult;
    const quoteNumber = generateQuoteNumber(countResult.value + 1);

    const now = new Date().toISOString();
    this.logger.info("Creating quote", { quoteNumber, destinationId: value.destinationId });
    return this.quotes.create({
      quoteNumber,
      title: value.title,
      status: QuoteStatus.DRAFT,
      destinationId: value.destinationId,
      packageId: value.packageId,
      travelerDetails: value.travelerDetails,
      currency: value.currency,
      adjustments: value.adjustments,
      currentVersionId: null,
      validFrom: value.validFrom ?? now,
      validTo: value.validTo ?? addDays(now, DEFAULT_VALIDITY_DAYS),
      internalNotes: value.internalNotes,
      customerNotes: value.customerNotes,
      approvedAt: null,
      rejectedAt: null,
      rejectionReason: null,
      convertedAt: null,
      convertedBookingId: null,
      customerId,
      createdAt: now,
      updatedAt: now,
    });
  }

  async update(id: string, input: unknown): Promise<Result<Quote, AppError>> {
    const existing = await this.getById(id);
    if (isErr(existing)) return existing;
    if (!EDITABLE_STATUSES.includes(existing.value.status)) {
      return err(new ConflictError(`Quote "${id}" is ${existing.value.status} and can no longer be updated`));
    }

    const validated = validateUpdateQuote(input);
    if (isErr(validated)) return validated;
    const value = validated.value;

    if (value.destinationId) {
      const destination = await getDestinationService().getById(value.destinationId);
      if (isErr(destination)) return destination;
    }
    if (value.packageId) {
      const pkg = await getPackageService().getById(value.packageId);
      if (isErr(pkg)) return pkg;
    }

    this.logger.info("Updating quote", { id });
    return this.quotes.update(id, { ...value, updatedAt: new Date().toISOString() });
  }

  async computePricing(id: string): Promise<Result<QuotePriceResult, AppError>> {
    const quote = await this.getById(id);
    if (isErr(quote)) return quote;
    const itemsResult = await this.items.findByQuote(id);
    if (isErr(itemsResult)) return itemsResult;
    return ok(computeQuotePrice(itemsResult.value, quote.value.adjustments, quote.value.currency));
  }

  /** Freezes the current item list + computed pricing into a QuoteVersion and marks the quote SENT — same freeze principle as Package's publish(). */
  async send(id: string, changeNote: string | null = null): Promise<Result<Quote, AppError>> {
    const quote = await this.getById(id);
    if (isErr(quote)) return quote;
    if (!EDITABLE_STATUSES.includes(quote.value.status)) {
      return err(new ConflictError(`Quote "${id}" is ${quote.value.status} and cannot be sent`));
    }

    const itemsResult = await this.items.findByQuote(id);
    if (isErr(itemsResult)) return itemsResult;
    const pricing = computeQuotePrice(itemsResult.value, quote.value.adjustments, quote.value.currency);

    const version = await this.versionService.createVersion(id, { quote: quote.value, items: itemsResult.value, pricing }, changeNote);
    if (isErr(version)) return version;

    this.logger.info("Sending quote", { id, versionNumber: version.value.versionNumber });
    return this.quotes.update(id, {
      status: QuoteStatus.SENT,
      currentVersionId: version.value.id,
      updatedAt: new Date().toISOString(),
    });
  }

  async approve(id: string): Promise<Result<Quote, AppError>> {
    const quote = await this.getById(id);
    if (isErr(quote)) return quote;
    if (!DECIDABLE_STATUSES.includes(quote.value.status)) {
      return err(new ConflictError(`Quote "${id}" is ${quote.value.status} and cannot be approved`));
    }

    this.logger.info("Approving quote", { id });
    const now = new Date().toISOString();
    return this.quotes.update(id, { status: QuoteStatus.APPROVED, approvedAt: now, updatedAt: now });
  }

  async reject(id: string, input: unknown): Promise<Result<Quote, AppError>> {
    const quote = await this.getById(id);
    if (isErr(quote)) return quote;
    if (!DECIDABLE_STATUSES.includes(quote.value.status)) {
      return err(new ConflictError(`Quote "${id}" is ${quote.value.status} and cannot be rejected`));
    }

    const validated = validateRejectQuote(input);
    if (isErr(validated)) return validated;

    this.logger.info("Rejecting quote", { id });
    const now = new Date().toISOString();
    return this.quotes.update(id, {
      status: QuoteStatus.REJECTED,
      rejectedAt: now,
      rejectionReason: validated.value.reason,
      updatedAt: now,
    });
  }

  /**
   * Copies Quote + Items into a new DRAFT quote with a fresh quote number.
   * Adjustments ARE copied — unlike Package's clone() (which deliberately
   * drops pricing/rules as "the clone's own commercial decision"), a
   * Quote's adjustments live on the Quote itself rather than a separate
   * reusable entity, so dropping them wouldn't produce a duplicate.
   */
  async duplicate(id: string): Promise<Result<Quote, AppError>> {
    const source = await this.getById(id);
    if (isErr(source)) return source;
    const itemsResult = await this.items.findByQuote(id);
    if (isErr(itemsResult)) return itemsResult;

    const countResult = await this.quotes.countAll();
    if (isErr(countResult)) return countResult;
    const quoteNumber = generateQuoteNumber(countResult.value + 1);

    const now = new Date().toISOString();
    const created = await this.quotes.create({
      quoteNumber,
      title: `${source.value.title} (Copy)`,
      status: QuoteStatus.DRAFT,
      destinationId: source.value.destinationId,
      packageId: source.value.packageId,
      travelerDetails: source.value.travelerDetails,
      currency: source.value.currency,
      adjustments: source.value.adjustments,
      currentVersionId: null,
      validFrom: now,
      validTo: addDays(now, DEFAULT_VALIDITY_DAYS),
      internalNotes: source.value.internalNotes,
      customerNotes: null,
      approvedAt: null,
      rejectedAt: null,
      rejectionReason: null,
      convertedAt: null,
      convertedBookingId: null,
      customerId: source.value.customerId,
      createdAt: now,
      updatedAt: now,
    });
    if (isErr(created)) return created;

    for (const item of itemsResult.value) {
      const itemNow = new Date().toISOString();
      const newItem = await this.items.create({
        quoteId: created.value.id,
        kind: item.kind,
        packageId: item.packageId,
        inventoryItemId: item.inventoryItemId,
        title: item.title,
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        position: item.position,
        createdAt: itemNow,
        updatedAt: itemNow,
      });
      if (isErr(newItem)) return newItem;
    }

    this.logger.info("Duplicated quote", { sourceId: id, newId: created.value.id });
    return this.getById(created.value.id);
  }

  /**
   * Terminal transition — requires APPROVED. Returns the handoff payload a
   * future Booking Engine (Sprint 8, not built here) would consume.
   * convertedBookingId is deliberately never set here: this module has no
   * import from a booking module (doesn't exist yet), so it cannot create
   * or reference a real booking ID — reserved-but-inert, same pattern as
   * Package.aiGeneratedFromId.
   */
  async convertToBooking(id: string): Promise<Result<BookingHandoffPayload, AppError>> {
    const quote = await this.getById(id);
    if (isErr(quote)) return quote;
    if (quote.value.status !== QuoteStatus.APPROVED) {
      return err(new ConflictError(`Quote "${id}" must be APPROVED before it can be converted (current status: ${quote.value.status})`));
    }

    const itemsResult = await this.items.findByQuote(id);
    if (isErr(itemsResult)) return itemsResult;
    const pricing = computeQuotePrice(itemsResult.value, quote.value.adjustments, quote.value.currency);

    const now = new Date().toISOString();
    const updated = await this.quotes.update(id, { status: QuoteStatus.CONVERTED, convertedAt: now, updatedAt: now });
    if (isErr(updated)) return updated;

    this.logger.info("Converted quote", { id });
    return ok({
      quoteId: updated.value.id,
      quoteNumber: updated.value.quoteNumber,
      destinationId: updated.value.destinationId,
      packageId: updated.value.packageId,
      travelerDetails: updated.value.travelerDetails,
      items: itemsResult.value,
      pricing,
      convertedAt: now,
    });
  }

  async getPdfData(id: string): Promise<Result<QuotePdfData, AppError>> {
    const quote = await this.getById(id);
    if (isErr(quote)) return quote;

    const destination = await getDestinationService().getById(quote.value.destinationId);
    if (isErr(destination)) return destination;

    const itemsResult = await this.items.findByQuote(id);
    if (isErr(itemsResult)) return itemsResult;

    const pricing = computeQuotePrice(itemsResult.value, quote.value.adjustments, quote.value.currency);
    return ok(buildQuotePdfData(quote.value, itemsResult.value, pricing, destination.value));
  }
}
