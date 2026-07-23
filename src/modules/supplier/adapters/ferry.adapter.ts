import { ok, type Result } from "@/shared/types";
import type { AppError } from "@/shared/errors";
import { SupplierConfigService } from "../services/supplier-config.service";
import { SupplierCapability } from "../types";
import { BaseSupplierAdapter, type SupplierAdapterContext } from "./base-supplier.adapter";

/**
 * Placeholder only. Per docs/01_CURRENT_SYSTEM_AUDIT.md, no real Ferry API
 * integration exists anywhere in this codebase, despite earlier task briefs
 * describing one as already existing — confirm that discrepancy before
 * docs/11_FERRY_INTEGRATION.md gets written against this adapter.
 */
export class FerryAdapter extends BaseSupplierAdapter {
  constructor(context: SupplierAdapterContext) {
    super("ferry", "Ferry", context);
  }

  capabilities(): SupplierCapability[] {
    return [SupplierCapability.FERRIES];
  }

  override async initialize(): Promise<Result<void, AppError>> {
    const enabled = SupplierConfigService.getInstance().get("ferryEnabled");
    this.logger.info(`Ferry adapter config read`, { enabled });
    return super.initialize();
  }

  override async search(criteria: import("../types").SupplierSearchCriteria): Promise<Result<import("../types").SupplierSearchResult[], AppError>> {
    const { getMakruzzAdapter } = await import("./makruzz/makruzz.adapter");
    const makruzz = getMakruzzAdapter({ logger: this.logger });
    
    const sourceId = criteria.sourceId as string || "1"; 
    const destinationId = criteria.destinationId as string || "2";
    const journeyDate = criteria.journeyDate as string || new Date().toISOString().split("T")[0];

    const result = await makruzz.scheduleSearch(sourceId, destinationId, journeyDate);
    if (!result.ok) {
      return result; // return error
    }

    const schedules = result.value.data || [];
    const searchResults = schedules.map((schedule: any) => ({
      referenceId: schedule.schedule_id?.toString() || "UNKNOWN",
      raw: schedule,
    }));

    return ok(searchResults);
  }
}
