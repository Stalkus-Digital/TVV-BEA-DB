import type { Result } from "@/shared/types";
import type { AppError } from "@/shared/errors";
import { SupplierConfigService } from "../services/supplier-config.service";
import { SupplierCapability } from "../types";
import { BaseSupplierAdapter, type SupplierAdapterContext } from "./base-supplier.adapter";

/**
 * Placeholder only. Per the original Supplier Abstraction design, "Manual"
 * represents ops-entered/contracted inventory rather than a remote API —
 * even so, this sprint keeps it a placeholder like the others: no real
 * fulfillment logic is wired in, nothing reads from any inventory table.
 */
export class ManualSupplierAdapter extends BaseSupplierAdapter {
  constructor(context: SupplierAdapterContext) {
    super("manual", "Manual Supplier", context);
  }

  capabilities(): SupplierCapability[] {
    return [SupplierCapability.HOTELS, SupplierCapability.ACTIVITIES];
  }

  override async initialize(): Promise<Result<void, AppError>> {
    const enabled = SupplierConfigService.getInstance().get("manualSupplierEnabled");
    this.logger.info(`Manual supplier adapter config read`, { enabled });
    return super.initialize();
  }
}
