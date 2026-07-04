import { err, isErr, ok, type Result } from "@/shared/types";
import { BaseService, type ServiceContext } from "@/shared/services";
import { ConflictError, NotFoundError, type AppError } from "@/shared/errors";
import { getPackageService } from "@/modules/package";
import { getInventoryService } from "@/modules/inventory";
import { QuoteStatus, type Quote } from "../types/quote";
import type { QuoteItem } from "../types/quote-item";
import type { QuoteItemRepository } from "../repositories/quote-item.repository";
import type { QuoteRepository } from "../repositories/quote.repository";
import { validateCreateQuoteItem, validateUpdateQuoteItem } from "../validation/quote-item.validation";

const LOCKED_STATUSES: QuoteStatus[] = [QuoteStatus.APPROVED, QuoteStatus.REJECTED, QuoteStatus.CONVERTED];

export class QuoteItemService extends BaseService {
  constructor(
    context: ServiceContext,
    private readonly items: QuoteItemRepository,
    private readonly quotes: QuoteRepository
  ) {
    super(context);
  }

  async listByQuote(quoteId: string): Promise<Result<QuoteItem[], AppError>> {
    return this.items.findByQuote(quoteId);
  }

  async add(quoteId: string, input: unknown): Promise<Result<QuoteItem, AppError>> {
    const quote = await this.getEditableQuote(quoteId);
    if (isErr(quote)) return quote;

    const validated = validateCreateQuoteItem(input);
    if (isErr(validated)) return validated;
    const value = validated.value;

    if (value.packageId) {
      const pkg = await getPackageService().getById(value.packageId);
      if (isErr(pkg)) return pkg;
    }
    if (value.inventoryItemId) {
      const inventoryItem = await getInventoryService().getById(value.inventoryItemId);
      if (isErr(inventoryItem)) return inventoryItem;
    }

    const existing = await this.items.findByQuote(quoteId);
    if (isErr(existing)) return existing;

    this.logger.info("Adding quote item", { quoteId, kind: value.kind });
    const now = new Date().toISOString();
    return this.items.create({
      quoteId,
      kind: value.kind,
      packageId: value.packageId,
      inventoryItemId: value.inventoryItemId,
      title: value.title,
      description: value.description,
      quantity: value.quantity,
      unitPrice: value.unitPrice,
      position: value.position ?? existing.value.length,
      createdAt: now,
      updatedAt: now,
    });
  }

  async update(quoteId: string, itemId: string, input: unknown): Promise<Result<QuoteItem, AppError>> {
    const quote = await this.getEditableQuote(quoteId);
    if (isErr(quote)) return quote;

    const item = await this.getOwnedItem(quoteId, itemId);
    if (isErr(item)) return item;

    const validated = validateUpdateQuoteItem(input);
    if (isErr(validated)) return validated;

    this.logger.info("Updating quote item", { quoteId, itemId });
    return this.items.update(itemId, { ...validated.value, updatedAt: new Date().toISOString() });
  }

  async remove(quoteId: string, itemId: string): Promise<Result<void, AppError>> {
    const quote = await this.getEditableQuote(quoteId);
    if (isErr(quote)) return quote;

    const item = await this.getOwnedItem(quoteId, itemId);
    if (isErr(item)) return item;

    this.logger.info("Removing quote item", { quoteId, itemId });
    return this.items.delete(itemId);
  }

  private async getOwnedItem(quoteId: string, itemId: string): Promise<Result<QuoteItem, AppError>> {
    const item = await this.items.findById(itemId);
    if (isErr(item)) return item;
    if (!item.value || item.value.quoteId !== quoteId) {
      return err(new NotFoundError(`Quote item "${itemId}" not found on quote "${quoteId}"`));
    }
    return ok(item.value);
  }

  private async getEditableQuote(quoteId: string): Promise<Result<Quote, AppError>> {
    const quote = await this.quotes.findById(quoteId);
    if (isErr(quote)) return quote;
    if (!quote.value) return err(new NotFoundError(`Quote "${quoteId}" not found`));
    if (LOCKED_STATUSES.includes(quote.value.status)) {
      return err(new ConflictError(`Quote "${quoteId}" is ${quote.value.status} and its items can no longer be edited`));
    }
    return ok(quote.value);
  }
}
