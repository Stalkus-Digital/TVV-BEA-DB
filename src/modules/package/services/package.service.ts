import { randomUUID } from "node:crypto";
import { err, isErr, ok, type PaginatedResult, type Result } from "@/shared/types";
import { BaseService, type ServiceContext } from "@/shared/services";
import { ConflictError, NotFoundError, type AppError } from "@/shared/errors";
import { getDestinationService } from "@/modules/destination";
import { PackageStatus, type Package } from "../types/package";
import type { PackagePreview } from "../types/package-preview";
import type { PackageListFilter, PackageRepository } from "../repositories/package.repository";
import type { PackageDayRepository } from "../repositories/package-day.repository";
import type { PackageItemRepository } from "../repositories/package-item.repository";
import type { PackagePricingRepository } from "../repositories/package-pricing.repository";
import type { PackageRuleRepository } from "../repositories/package-rule.repository";
import {
  slugify,
  validateCreateFaq,
  validateCreatePackage,
  validateUpdatePackage,
  type CreatePackageInput,
} from "../validation/package.validation";
import type { PackageVersionService } from "./package-version.service";
import type { AuditLogService } from "@/modules/auth/audit/audit-log.service";
import type { AuditEventType } from "@/modules/auth/types/audit-log";

export interface CloneOverrides {
  title?: string;
  destinationId?: string;
}

export class PackageService extends BaseService {
  constructor(
    context: ServiceContext,
    private readonly packages: PackageRepository,
    private readonly days: PackageDayRepository,
    private readonly items: PackageItemRepository,
    private readonly pricingRepo: PackagePricingRepository,
    private readonly rulesRepo: PackageRuleRepository,
    private readonly versionService: PackageVersionService,
    private readonly auditLog?: AuditLogService
  ) {
    super(context);
  }

  private async recordAudit(
    eventType: AuditEventType,
    pkg: Package,
    action: string,
    details?: Record<string, unknown>
  ) {
    if (!this.auditLog) return;
    await this.auditLog.record({
      eventType,
      actorUserId: null,
      details: {
        packageId: pkg.id,
        packageTitle: pkg.title,
        packageCode: pkg.code,
        action,
        ...details,
      },
    });
  }

  async list(filter: PackageListFilter = {}): Promise<Result<PaginatedResult<Package>, AppError>> {
    return this.packages.findByFilter(filter);
  }

  async listTemplates(): Promise<Result<Package[], AppError>> {
    const result = await this.packages.findByFilter({ isTemplate: true, pageSize: 100 });
    if (isErr(result)) return result;
    return ok(result.value.items);
  }

  async getById(id: string): Promise<Result<Package, AppError>> {
    const result = await this.packages.findById(id);
    if (isErr(result)) return result;
    if (!result.value) return err(new NotFoundError(`Package "${id}" not found`));
    return ok(result.value);
  }

  async getBySlug(slug: string): Promise<Result<Package, AppError>> {
    const result = await this.packages.findBySlug(slug);
    if (isErr(result)) return result;
    if (!result.value) return err(new NotFoundError(`Package with slug "${slug}" not found`));
    return ok(result.value);
  }

  async create(input: unknown): Promise<Result<Package, AppError>> {
    const validated = validateCreatePackage(input);
    if (isErr(validated)) return validated;
    const result = await this.persistNew(validated.value);
    if (!isErr(result)) {
      await this.recordAudit("PACKAGE_CREATED", result.value, "Created package", {
        status: result.value.status,
        sourceType: result.value.sourceType,
      });
    }
    return result;
  }

  private async persistNew(value: CreatePackageInput): Promise<Result<Package, AppError>> {
    const destination = await getDestinationService().getById(value.destinationId);
    if (isErr(destination)) return destination;

    const codeCheck = await this.packages.findByCode(value.code);
    if (isErr(codeCheck)) return codeCheck;
    if (codeCheck.value) return err(new ConflictError(`Package code "${value.code}" is already in use`));

    const slugCheck = await this.packages.findBySlug(value.slug);
    if (isErr(slugCheck)) return slugCheck;
    if (slugCheck.value) return err(new ConflictError(`Package slug "${value.slug}" is already in use`));

    this.logger.info("Creating package", { code: value.code, sourceType: value.sourceType });
    const now = new Date().toISOString();
    return this.packages.create({
      ...value,
      tripType: value.tripType ?? null,
      durationText: value.durationText ?? null,
      isTemplate: false,
      sourceTemplateId: null,
      aiGeneratedFromId: null,
      status: PackageStatus.DRAFT,
      currentVersionId: null,
      isStaffPick: false,
      flightsIncluded: false,
      faqs: [],
      createdAt: now,
      updatedAt: now,
    });
  }

  async update(id: string, input: unknown): Promise<Result<Package, AppError>> {
    const existing = await this.getById(id);
    if (isErr(existing)) return existing;
    const validated = validateUpdatePackage(input);
    if (isErr(validated)) return validated;
    this.logger.info("Updating package", { id });
    const result = await this.packages.update(id, { ...validated.value, updatedAt: new Date().toISOString() });
    if (!isErr(result)) {
      const changes: Record<string, { from: unknown; to: unknown }> = {};
      if (existing.value.title !== result.value.title) {
        changes.title = { from: existing.value.title, to: result.value.title };
      }
      if (existing.value.status !== result.value.status) {
        changes.status = { from: existing.value.status, to: result.value.status };
      }
      if (existing.value.slug !== result.value.slug) {
        changes.slug = { from: existing.value.slug, to: result.value.slug };
      }
      await this.recordAudit("PACKAGE_UPDATED", result.value, "Updated package", { changes });
    }
    return result;
  }

  async archive(id: string): Promise<Result<Package, AppError>> {
    const existing = await this.getById(id);
    if (isErr(existing)) return existing;
    this.logger.info("Archiving package", { id });
    const result = await this.packages.update(id, {
      status: PackageStatus.ARCHIVED,
      updatedAt: new Date().toISOString(),
    });
    if (!isErr(result)) {
      await this.recordAudit("PACKAGE_ARCHIVED", result.value, "Archived package", {
        previousStatus: existing.value.status,
      });
    }
    return result;
  }

  async unpublish(id: string): Promise<Result<Package, AppError>> {
    const existing = await this.getById(id);
    if (isErr(existing)) return existing;
    this.logger.info("Unpublishing package", { id });
    const result = await this.packages.update(id, {
      status: PackageStatus.DRAFT,
      updatedAt: new Date().toISOString(),
    });
    if (!isErr(result)) {
      await this.recordAudit("PACKAGE_UNPUBLISHED", result.value, "Unpublished package", {
        previousStatus: existing.value.status,
        newStatus: PackageStatus.DRAFT,
      });
    }
    return result;
  }

  async restore(id: string): Promise<Result<Package, AppError>> {
    const existing = await this.getById(id);
    if (isErr(existing)) return existing;
    this.logger.info("Restoring package", { id });
    const result = await this.packages.update(id, {
      status: PackageStatus.DRAFT,
      updatedAt: new Date().toISOString(),
    });
    if (!isErr(result)) {
      await this.recordAudit("PACKAGE_RESTORED", result.value, "Restored package", {
        previousStatus: existing.value.status,
        newStatus: PackageStatus.DRAFT,
      });
    }
    return result;
  }

  async bulkUpdateStatus(ids: string[], status: PackageStatus): Promise<Result<{ updated: number }, AppError>> {
    let updated = 0;
    for (const id of ids) {
      const existing = await this.getById(id);
      if (isErr(existing)) continue;
      const result = await this.packages.update(id, { status, updatedAt: new Date().toISOString() });
      if (!isErr(result)) {
        updated++;
        const eventType: AuditEventType =
          status === PackageStatus.PUBLISHED
            ? "PACKAGE_PUBLISHED"
            : status === PackageStatus.ARCHIVED
              ? "PACKAGE_ARCHIVED"
              : "PACKAGE_UNPUBLISHED";
        await this.recordAudit(eventType, result.value, `Bulk status change to ${status}`, {
          previousStatus: existing.value.status,
          bulk: true,
        });
      }
    }
    return ok({ updated });
  }

  async markAsTemplate(id: string): Promise<Result<Package, AppError>> {
    const existing = await this.getById(id);
    if (isErr(existing)) return existing;
    return this.packages.update(id, { isTemplate: true, updatedAt: new Date().toISOString() });
  }

  async addFaq(id: string, input: unknown): Promise<Result<Package, AppError>> {
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
    return this.packages.update(id, { faqs, updatedAt: new Date().toISOString() });
  }

  async removeFaq(id: string, faqId: string): Promise<Result<Package, AppError>> {
    const existing = await this.getById(id);
    if (isErr(existing)) return existing;
    const faqs = existing.value.faqs.filter((f) => f.id !== faqId);
    return this.packages.update(id, { faqs, updatedAt: new Date().toISOString() });
  }

  /** Assembles Package + Days (each with its Items) + Pricing + Rules — the single read-model both preview() and publish() build on. */
  async assemble(id: string): Promise<Result<PackagePreview, AppError>> {
    const packageResult = await this.getById(id);
    if (isErr(packageResult)) return packageResult;

    const daysResult = await this.days.findByPackage(id);
    if (isErr(daysResult)) return daysResult;

    const daysWithItems = [];
    for (const day of daysResult.value) {
      const itemsResult = await this.items.findByDay(day.id);
      if (isErr(itemsResult)) return itemsResult;
      daysWithItems.push({ ...day, items: itemsResult.value });
    }

    const pricingResult = await this.pricingRepo.findByPackage(id);
    if (isErr(pricingResult)) return pricingResult;

    const rulesResult = await this.rulesRepo.findByPackage(id);
    if (isErr(rulesResult)) return rulesResult;

    return ok({
      package: packageResult.value,
      days: daysWithItems,
      pricing: pricingResult.value,
      rules: rulesResult.value,
    });
  }

  /** Read-only — no version is created, no status change. */
  async preview(id: string): Promise<Result<PackagePreview, AppError>> {
    return this.assemble(id);
  }

  /** Freezes the current assembled state into a new PackageVersion and marks the package PUBLISHED. */
  async publish(id: string, changeNote: string | null = null): Promise<Result<Package, AppError>> {
    const assembled = await this.assemble(id);
    if (isErr(assembled)) return assembled;

    const version = await this.versionService.createVersion(id, assembled.value, changeNote);
    if (isErr(version)) return version;

    this.logger.info("Publishing package", { id, versionNumber: version.value.versionNumber });
    const result = await this.packages.update(id, {
      status: PackageStatus.PUBLISHED,
      currentVersionId: version.value.id,
      updatedAt: new Date().toISOString(),
    });
    if (!isErr(result)) {
      await this.recordAudit("PACKAGE_PUBLISHED", result.value, "Published package", {
        versionNumber: version.value.versionNumber,
        changeNote,
      });
    }
    return result;
  }

  /**
   * Copies Package + Days + Items (Pricing/Rules are NOT copied — a clone
   * starts as its own commercial decision, not an assumption). New code/slug
   * are auto-derived from the title to guarantee uniqueness. "Duplicate" is
   * this same operation with no overrides.
   */
  async clone(id: string, overrides: CloneOverrides = {}): Promise<Result<Package, AppError>> {
    const source = await this.assemble(id);
    if (isErr(source)) return source;

    const title = overrides.title ?? `${source.value.package.title} (Copy)`;
    const destinationId = overrides.destinationId ?? source.value.package.destinationId;
    const disambiguator = Date.now().toString().slice(-6);

    const created = await this.persistNew({
      title,
      code: `${source.value.package.code}-COPY-${disambiguator}`,
      slug: `${slugify(title)}-${disambiguator}`,
      destinationId,
      sourceType: source.value.package.sourceType,
      durationDays: source.value.package.durationDays,
      durationNights: source.value.package.durationNights,
      seo: source.value.package.seo,
    });
    if (isErr(created)) return created;

    await this.packages.update(created.value.id, { sourceTemplateId: source.value.package.isTemplate ? id : null });

    for (const day of source.value.days) {
      const newDay = await this.days.create({
        packageId: created.value.id,
        dayNumber: day.dayNumber,
        title: day.title,
        description: day.description,
        destinationId: day.destinationId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      if (isErr(newDay)) return newDay;

      for (const item of day.items) {
        const now = new Date().toISOString();
        const newItem = await this.items.create({
          packageDayId: newDay.value.id,
          kind: item.kind,
          resolutionMode: item.resolutionMode,
          inventoryItemId: item.inventoryItemId,
          destinationReferenceId: item.destinationReferenceId,
          slotCriteria: item.slotCriteria,
          title: item.title,
          description: item.description,
          timeOfDay: item.timeOfDay,
          notes: item.notes,
          images: item.images,
          pricingMode: item.pricingMode,
          addonPrice: item.addonPrice,
          position: item.position,
          createdAt: now,
          updatedAt: now,
        });
        if (isErr(newItem)) return newItem;
      }
    }

    this.logger.info("Cloned package", { sourceId: id, newId: created.value.id });
    const cloned = await this.getById(created.value.id);
    if (!isErr(cloned)) {
      await this.recordAudit("PACKAGE_DUPLICATED", cloned.value, "Duplicated package", {
        sourceId: id,
        sourceTitle: source.value.package.title,
      });
    }
    return cloned;
  }

  async duplicate(id: string): Promise<Result<Package, AppError>> {
    return this.clone(id, {});
  }
}
