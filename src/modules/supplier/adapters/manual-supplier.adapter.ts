import type { Result } from "@/shared/types";
import type { AppError } from "@/shared/errors";
import { ok } from "@/shared/types";
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

  override async search(criteria: import("../types").SupplierSearchCriteria): Promise<Result<import("../types").SupplierSearchResult[], AppError>> {
    if (criteria.capability === SupplierCapability.ACTIVITIES) {
      // Mock API response payload
      const mockActivities = [
        {
          referenceId: `ACT-API-${Date.now()}-1`,
          activityName: "Scuba Diving Expedition",
          location: criteria.cityCode || "Andaman",
          duration: "2 Hours",
          adultPrice: 3500,
          childPrice: 3000,
          status: "Active"
        },
        {
          referenceId: `ACT-API-${Date.now()}-2`,
          activityName: "Sunset Cruise",
          location: criteria.cityCode || "Port Blair",
          duration: "3 Hours",
          adultPrice: 1500,
          childPrice: 800,
          status: "Active"
        },
        {
          referenceId: `ACT-API-${Date.now()}-3`,
          activityName: "Limestone Caves Tour",
          location: criteria.cityCode ? `${criteria.cityCode} Surrounds` : "Baratang",
          duration: "Full Day",
          adultPrice: 4000,
          childPrice: 2000,
          status: "Active"
        }
      ];
      // Typecast as any to bypass strict structural checks since this is a mock payload
      return ok(mockActivities as any);
    }
    return super.search(criteria);
  }
}
