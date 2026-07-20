import { randomUUID } from "node:crypto";
import { err, isErr, ok, type PaginatedResult, type Result } from "@/shared/types";
import { BaseService, type ServiceContext } from "@/shared/services";
import { ConflictError, NotFoundError, ValidationError, type AppError } from "@/shared/errors";
import { isMarketRootSlug, MARKET_ROOT_SLUGS } from "../constants/market-roots";
import { DestinationStatus, type Destination, type DestinationBreadcrumb } from "../types/destination";
import type { DestinationListFilter, DestinationRepository } from "../repositories/destination.repository";
import {
  validateCreateDestination,
  validateCreateFaq,
  validateCreateGalleryImage,
  validateUpdateDestination,
} from "../validation/destination.validation";
import type { AuditLogService } from "@/modules/auth/audit/audit-log.service";

const MAX_HIERARCHY_DEPTH = 20;

export class DestinationService extends BaseService {
  constructor(
    context: ServiceContext,
    private readonly repository: DestinationRepository,
    private readonly auditLog?: AuditLogService
  ) {
    super(context);
  }

  private async recordAudit(eventType: string, destination: Destination, action: string, details?: Record<string, unknown>) {
    if (!this.auditLog) return;
    await this.auditLog.record({
      eventType: eventType as any,
      actorUserId: this.context.userId ?? null,
      details: {
        destinationId: destination.id,
        destinationName: destination.name,
        destinationSlug: destination.slug,
        action,
        ...details,
      },
    });
  }

  async list(filter: DestinationListFilter = {}): Promise<Result<PaginatedResult<Destination>, AppError>> {
    this.logger.debug("Listing destinations", { ...filter });
    return this.repository.findByFilter(filter);
  }

  async listFeatured(): Promise<Result<Destination[], AppError>> {
    const result = await this.repository.findByFilter({ featured: true, pageSize: 100 });
    if (isErr(result)) return result;
    return ok(result.value.items);
  }

  async listMarketRoots(): Promise<Result<Destination[], AppError>> {
    const roots: Destination[] = [];
    for (const slug of MARKET_ROOT_SLUGS) {
      const result = await this.repository.findBySlug(slug);
      if (isErr(result)) return result;
      if (result.value) roots.push(result.value);
    }
    return ok(roots);
  }

  async getById(id: string): Promise<Result<Destination, AppError>> {
    const result = await this.repository.findById(id);
    if (isErr(result)) return result;
    if (!result.value) return err(new NotFoundError(`Destination "${id}" not found`));
    return ok(result.value);
  }

  async getBySlug(slug: string): Promise<Result<Destination, AppError>> {
    const result = await this.repository.findBySlug(slug);
    if (isErr(result)) return result;
    if (!result.value) return err(new NotFoundError(`Destination with slug "${slug}" not found`));
    return ok(result.value);
  }

  async create(input: unknown): Promise<Result<Destination, AppError>> {
    const validated = validateCreateDestination(input);
    if (isErr(validated)) return validated;

    const existing = await this.repository.findBySlug(validated.value.slug);
    if (isErr(existing)) return existing;
    if (existing.value) return err(new ConflictError(`Destination slug "${validated.value.slug}" is already in use`));

    if (isMarketRootSlug(validated.value.slug)) {
      return err(new ConflictError(`Slug "${validated.value.slug}" is reserved for a market root destination`));
    }

    if (!validated.value.parentDestinationId) {
      return err(new ValidationError("parentDestinationId is required — choose Andaman, Domestic, or International"));
    }

    const parentResult = await this.repository.findById(validated.value.parentDestinationId);
    if (isErr(parentResult)) return parentResult;
    if (!parentResult.value) {
      return err(new NotFoundError(`parentDestinationId "${validated.value.parentDestinationId}" not found`));
    }

    const parentCheck = await this.assertNoCycle(validated.value.parentDestinationId, null);
    if (isErr(parentCheck)) return parentCheck;

    this.logger.info("Creating destination", { slug: validated.value.slug });
    const now = new Date().toISOString();
    // Destinations under a market root (Andaman/Domestic/International) go
    // live as ACTIVE so the public website tree/nav can show them immediately.
    const status = DestinationStatus.ACTIVE;
    const result = await this.repository.create({
      ...validated.value,
      isFeatured: false,
      gallery: [],
      faqs: [],
      guideReferenceIds: [],
      status,
      createdAt: now,
      updatedAt: now,
    });

    if (!isErr(result)) {
      await this.recordAudit("DESTINATION_CREATED", result.value, "Created destination", {
        name: result.value.name,
        slug: result.value.slug,
        status: result.value.status,
      });
    }

    return result;
  }

  async update(id: string, input: unknown): Promise<Result<Destination, AppError>> {
    const existing = await this.getById(id);
    if (isErr(existing)) return existing;

    const validated = validateUpdateDestination(input);
    if (isErr(validated)) return validated;

    this.logger.info("Updating destination", { id });
    const result = await this.repository.update(id, validated.value);

    if (!isErr(result)) {
      const oldValues = existing.value;
      const newValues = result.value;
      const changes: Record<string, { from: unknown; to: unknown }> = {};

      if (oldValues.name !== newValues.name) changes.name = { from: oldValues.name, to: newValues.name };
      if (oldValues.description !== newValues.description) changes.description = { from: oldValues.description, to: newValues.description };
      if (oldValues.isFeatured !== newValues.isFeatured) changes.isFeatured = { from: oldValues.isFeatured, to: newValues.isFeatured };
      if (oldValues.slug !== newValues.slug) changes.slug = { from: oldValues.slug, to: newValues.slug };
      if (oldValues.status !== newValues.status) changes.status = { from: oldValues.status, to: newValues.status };

      await this.recordAudit("DESTINATION_UPDATED", result.value, "Updated destination", { changes });
    }

    return result;
  }

  async delete(id: string): Promise<Result<void, AppError>> {
    const existing = await this.getById(id);
    if (isErr(existing)) return existing;
    if (isMarketRootSlug(existing.value.slug)) {
      return err(new ConflictError("Market root destinations cannot be deleted"));
    }
    this.logger.info("Deleting destination", { id });
    const result = await this.repository.delete(id);
    if (!isErr(result)) {
      await this.recordAudit("DESTINATION_ARCHIVED", existing.value, "Archived destination", {
        status: "ARCHIVED",
      });
    }
    return result;
  }

  async getChildren(id: string): Promise<Result<Destination[], AppError>> {
    const existing = await this.getById(id);
    if (isErr(existing)) return existing;
    return this.repository.findChildren(id);
  }

  /**
   * Walks parentDestinationId up to the root, root-first. Doubles as
   * breadcrumbs (name + slug is all a breadcrumb trail needs) — no separate
   * "breadcrumb" data model, just a projection of the hierarchy walk.
   */
  async getBreadcrumbs(id: string): Promise<Result<DestinationBreadcrumb[], AppError>> {
    const chain: DestinationBreadcrumb[] = [];
    let currentId: string | null = id;
    let depth = 0;

    while (currentId && depth < MAX_HIERARCHY_DEPTH) {
      const result = await this.repository.findById(currentId);
      if (isErr(result)) return result;
      if (!result.value) {
        return err(new NotFoundError(`Destination "${currentId}" not found while building breadcrumb trail`));
      }
      chain.unshift({ id: result.value.id, name: result.value.name, slug: result.value.slug });
      currentId = result.value.parentDestinationId;
      depth += 1;
    }

    if (depth >= MAX_HIERARCHY_DEPTH) {
      return err(new ConflictError("Destination hierarchy exceeds maximum depth — possible cycle"));
    }

    return ok(chain);
  }

  /**
   * "Nearby" without geo-distance math: siblings under the same parent, or
   * other destinations in the same city/state if there's no parent. A
   * provisional heuristic — see docs/06_DESTINATION_ENGINE.md for the
   * latitude/longitude-based upgrade path once real distance calculation is
   * needed.
   */
  async getNearby(id: string, limit = 10): Promise<Result<Destination[], AppError>> {
    const existing = await this.getById(id);
    if (isErr(existing)) return existing;
    const destination = existing.value;

    let candidates: Destination[];
    if (destination.parentDestinationId) {
      const siblings = await this.repository.findChildren(destination.parentDestinationId);
      if (isErr(siblings)) return siblings;
      candidates = siblings.value;
    } else if (destination.cityId) {
      const byCity = await this.repository.findByFilter({ cityId: destination.cityId, pageSize: limit + 1 });
      if (isErr(byCity)) return byCity;
      candidates = byCity.value.items;
    } else {
      const byState = destination.stateId
        ? await this.repository.findByFilter({ stateId: destination.stateId, pageSize: limit + 1 })
        : await this.repository.findByFilter({ countryId: destination.countryId ?? undefined, pageSize: limit + 1 });
      if (isErr(byState)) return byState;
      candidates = byState.value.items;
    }

    return ok(candidates.filter((d) => d.id !== id).slice(0, limit));
  }

  async addFaq(id: string, input: unknown): Promise<Result<Destination, AppError>> {
    const existing = await this.getById(id);
    if (isErr(existing)) return existing;
    const validated = validateCreateFaq(input);
    if (isErr(validated)) return validated;

    const faqs = [
      ...existing.value.faqs,
      {
        id: randomUUID(),
        question: validated.value.question,
        answer: validated.value.answer,
        position: validated.value.position ?? existing.value.faqs.length,
      },
    ];
    const result = await this.repository.update(id, { faqs });
    if (!isErr(result)) {
      await this.recordAudit("DESTINATION_UPDATED", result.value, "Added FAQ", {
        faqCount: result.value.faqs.length,
      });
    }
    return result;
  }

  async removeFaq(id: string, faqId: string): Promise<Result<Destination, AppError>> {
    const existing = await this.getById(id);
    if (isErr(existing)) return existing;
    const faqs = existing.value.faqs.filter((f) => f.id !== faqId);
    const result = await this.repository.update(id, { faqs });
    if (!isErr(result)) {
      await this.recordAudit("DESTINATION_UPDATED", result.value, "Removed FAQ", {
        faqId,
        faqCount: result.value.faqs.length,
      });
    }
    return result;
  }

  async updateFaq(id: string, faqId: string, input: unknown): Promise<Result<Destination, AppError>> {
    const existing = await this.getById(id);
    if (isErr(existing)) return existing;
    const validated = validateCreateFaq(input);
    if (isErr(validated)) return validated;
    const faqs = existing.value.faqs.map((f) =>
      f.id === faqId ? { ...f, question: validated.value.question, answer: validated.value.answer } : f
    );
    if (!faqs.some((f) => f.id === faqId)) {
      return err(new NotFoundError(`FAQ ${faqId} not found`));
    }
    const result = await this.repository.update(id, { faqs });
    if (!isErr(result)) {
      await this.recordAudit("DESTINATION_UPDATED", result.value, "Updated FAQ", {
        faqId,
        faqCount: result.value.faqs.length,
      });
    }
    return result;
  }

  async addGalleryImage(id: string, input: unknown): Promise<Result<Destination, AppError>> {
    const existing = await this.getById(id);
    if (isErr(existing)) return existing;
    const validated = validateCreateGalleryImage(input);
    if (isErr(validated)) return validated;

    const gallery = [
      ...existing.value.gallery,
      {
        id: randomUUID(),
        url: validated.value.url,
        altText: validated.value.altText,
        position: validated.value.position ?? existing.value.gallery.length,
      },
    ];
    const result = await this.repository.update(id, { gallery });
    if (!isErr(result)) {
      await this.recordAudit("DESTINATION_UPDATED", result.value, "Added gallery image", {
        galleryCount: result.value.gallery.length,
      });
    }
    return result;
  }

  async removeGalleryImage(id: string, imageId: string): Promise<Result<Destination, AppError>> {
    const existing = await this.getById(id);
    if (isErr(existing)) return existing;
    const gallery = existing.value.gallery.filter((g) => g.id !== imageId);
    const result = await this.repository.update(id, { gallery });
    if (!isErr(result)) {
      await this.recordAudit("DESTINATION_UPDATED", result.value, "Removed gallery image", {
        imageId,
        galleryCount: result.value.gallery.length,
      });
    }
    return result;
  }

  async publish(id: string): Promise<Result<Destination, AppError>> {
    const existing = await this.getById(id);
    if (isErr(existing)) return existing;
    const result = await this.repository.update(id, { status: DestinationStatus.ACTIVE });
    if (!isErr(result)) {
      await this.recordAudit("DESTINATION_PUBLISHED", result.value, "Published destination", {
        previousStatus: existing.value.status,
        newStatus: DestinationStatus.ACTIVE,
      });
    }
    return result;
  }

  async unpublish(id: string): Promise<Result<Destination, AppError>> {
    const existing = await this.getById(id);
    if (isErr(existing)) return existing;
    const result = await this.repository.update(id, { status: DestinationStatus.DRAFT });
    if (!isErr(result)) {
      await this.recordAudit("DESTINATION_UNPUBLISHED", result.value, "Unpublished destination", {
        previousStatus: existing.value.status,
        newStatus: DestinationStatus.DRAFT,
      });
    }
    return result;
  }

  async archive(id: string): Promise<Result<Destination, AppError>> {
    const existing = await this.getById(id);
    if (isErr(existing)) return existing;
    const result = await this.repository.update(id, { status: DestinationStatus.ARCHIVED });
    if (!isErr(result)) {
      await this.recordAudit("DESTINATION_ARCHIVED", result.value, "Archived destination", {
        previousStatus: existing.value.status,
        newStatus: DestinationStatus.ARCHIVED,
      });
    }
    return result;
  }

  async restore(id: string): Promise<Result<Destination, AppError>> {
    const existing = await this.getById(id);
    if (isErr(existing)) return existing;
    const result = await this.repository.update(id, { status: DestinationStatus.DRAFT });
    if (!isErr(result)) {
      await this.recordAudit("DESTINATION_RESTORED", result.value, "Restored destination", {
        previousStatus: existing.value.status,
        newStatus: DestinationStatus.DRAFT,
      });
    }
    return result;
  }

  async duplicate(id: string): Promise<Result<Destination, AppError>> {
    const existing = await this.getById(id);
    if (isErr(existing)) return existing;

    const source = existing.value;
    const newSlug = `${source.slug}-copy-${randomUUID().slice(0, 8)}`;

    const result = await this.repository.create({
      name: `${source.name} (Copy)`,
      slug: newSlug,
      description: source.description,
      parentDestinationId: source.parentDestinationId,
      countryId: source.countryId,
      stateId: source.stateId,
      regionId: source.regionId,
      cityId: source.cityId,
      categoryId: source.categoryId,
      airportId: source.airportId,
      isFeatured: false,
      gallery: source.gallery,
      faqs: source.faqs,
      guideReferenceIds: source.guideReferenceIds,
      seo: source.seo,
      status: DestinationStatus.DRAFT,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    if (!isErr(result)) {
      await this.recordAudit("DESTINATION_DUPLICATED", result.value, "Duplicated destination", {
        sourceId: source.id,
        sourceName: source.name,
        newSlug,
      });
    }

    return result;
  }

  async bulkUpdateStatus(ids: string[], status: string): Promise<Result<{ updated: number }, AppError>> {
    let updated = 0;
    for (const id of ids) {
      const result = await this.repository.update(id, { status });
      if (!isErr(result)) updated++;
    }
    return ok({ updated });
  }

  async bulkArchive(ids: string[]): Promise<Result<{ archived: number }, AppError>> {
    let archived = 0;
    for (const id of ids) {
      const existing = await this.getById(id);
      if (isErr(existing)) continue;
      const result = await this.repository.update(id, { status: DestinationStatus.ARCHIVED });
      if (!isErr(result)) {
        archived++;
        await this.recordAudit("DESTINATION_ARCHIVED", result.value, "Bulk archived destination", {});
      }
    }
    return ok({ archived });
  }

  /** Prevents a destination becoming its own ancestor when parentDestinationId is set. */
  private async assertNoCycle(parentId: string, selfId: string | null): Promise<Result<void, AppError>> {
    let currentId: string | null = parentId;
    let depth = 0;
    while (currentId && depth < MAX_HIERARCHY_DEPTH) {
      if (currentId === selfId) {
        return err(new ConflictError("parentDestinationId would create a cycle in the destination hierarchy"));
      }
      const result = await this.repository.findById(currentId);
      if (isErr(result)) return result;
      if (!result.value) return err(new NotFoundError(`parentDestinationId "${currentId}" not found`));
      currentId = result.value.parentDestinationId;
      depth += 1;
    }
    if (depth >= MAX_HIERARCHY_DEPTH) {
      return err(new ConflictError("Destination hierarchy exceeds maximum depth — possible cycle"));
    }
    return ok(undefined);
  }
}
