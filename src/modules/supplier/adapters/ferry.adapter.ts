import type { Result } from "@/shared/types";
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
}
