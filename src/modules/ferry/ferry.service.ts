import { BaseService, type ServiceContext } from "@/shared/services";
import { ok, err, type Result } from "@/shared/types";
import { InternalError, NotFoundError, ValidationError, type AppError } from "@/shared/errors";
import { prisma } from "@/shared/database/prisma-client";
import type { FerryRate } from "@/generated/prisma/client";
import type { AuditEventType } from "@/modules/auth/types/audit-log";

export interface CreateFerryRateDto {
  route: string;
  provider: string;
  class: string;
  basePrice: number;
  markupPrice: number;
}

export interface UpdateFerryRateDto extends Partial<CreateFerryRateDto> {
  id: string;
}

export class FerryService extends BaseService {
  constructor(context: ServiceContext) {
    super(context);
  }

  /** Lazily resolved to avoid a module-load-order cycle: ferry service is constructed at route-module scope, before the auth DI container may be ready. */
  private async recordAudit(eventType: AuditEventType, rate: Pick<FerryRate, "id" | "route" | "provider">, action: string, details?: Record<string, unknown>) {
    try {
      const { getAuditLogService } = await import("@/modules/auth");
      await getAuditLogService().record({
        eventType,
        actorUserId: null,
        details: {
          ferryRateId: rate.id,
          ferryRoute: rate.route,
          ferryProvider: rate.provider,
          action,
          ...details,
        },
      });
    } catch (error) {
      this.logger.warn("Failed to record ferry audit event", { error });
    }
  }

  async getAllRates(): Promise<Result<FerryRate[], AppError>> {
    try {

      const rates = await prisma.ferryRate.findMany({
        orderBy: { updatedAt: 'desc' }
      });
      return ok(rates);
    } catch (error) {
      this.logger.error("Failed to fetch ferry rates", { error });
      return err(new InternalError("Failed to fetch ferry rates"));
    }
  }

  async createRate(data: CreateFerryRateDto): Promise<Result<FerryRate, AppError>> {
    try {
      if (!data.route || !data.provider || !data.class) {
        return err(new ValidationError("Route, provider, and class are required"));
      }


      const newRate = await prisma.ferryRate.create({
        data: {
          route: data.route,
          provider: data.provider,
          class: data.class,
          basePrice: Number(data.basePrice),
          markupPrice: Number(data.markupPrice),
        },
      });
      await this.recordAudit("FERRY_RATE_CREATED", newRate, "Created ferry rate", {
        class: newRate.class,
        basePrice: newRate.basePrice,
        markupPrice: newRate.markupPrice,
      });
      return ok(newRate);
    } catch (error) {
      this.logger.error("Failed to create ferry rate", { error, data });
      return err(new InternalError("Failed to create ferry rate"));
    }
  }

  async updateRate(data: UpdateFerryRateDto): Promise<Result<FerryRate, AppError>> {
    try {

      const existing = await prisma.ferryRate.findUnique({ where: { id: data.id } });
      if (!existing) return err(new NotFoundError("Ferry rate not found"));

      const updated = await prisma.ferryRate.update({
        where: { id: data.id },
        data: {
          route: data.route !== undefined ? data.route : undefined,
          provider: data.provider !== undefined ? data.provider : undefined,
          class: data.class !== undefined ? data.class : undefined,
          basePrice: data.basePrice !== undefined ? Number(data.basePrice) : undefined,
          markupPrice: data.markupPrice !== undefined ? Number(data.markupPrice) : undefined,
        },
      });
      const changes: Record<string, { from: unknown; to: unknown }> = {};
      if (existing.route !== updated.route) changes.route = { from: existing.route, to: updated.route };
      if (existing.provider !== updated.provider) changes.provider = { from: existing.provider, to: updated.provider };
      if (existing.class !== updated.class) changes.class = { from: existing.class, to: updated.class };
      if (existing.basePrice !== updated.basePrice) changes.basePrice = { from: existing.basePrice, to: updated.basePrice };
      if (existing.markupPrice !== updated.markupPrice) changes.markupPrice = { from: existing.markupPrice, to: updated.markupPrice };
      await this.recordAudit("FERRY_RATE_UPDATED", updated, "Updated ferry rate", { changes });
      return ok(updated);
    } catch (error) {
      this.logger.error("Failed to update ferry rate", { error, data });
      return err(new InternalError("Failed to update ferry rate"));
    }
  }

  async deleteRate(id: string): Promise<Result<void, AppError>> {
    try {
      const existing = await prisma.ferryRate.findUnique({ where: { id } });
      if (!existing) return err(new NotFoundError("Ferry rate not found"));
      await prisma.ferryRate.delete({ where: { id } });
      await this.recordAudit("FERRY_RATE_DELETED", existing, "Deleted ferry rate", {
        class: existing.class,
        basePrice: existing.basePrice,
      });
      return ok(undefined);
    } catch (error) {
      this.logger.error("Failed to delete ferry rate", { error, id });
      return err(new InternalError("Failed to delete ferry rate"));
    }
  }
}
