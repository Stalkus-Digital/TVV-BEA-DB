import { ok } from "@/shared/types";
import type { Supplier, SupplierHealthStatus } from "@/modules/supplier/types/supplier.port";
import type { SupplierCapability } from "@/modules/supplier/types/supplier-capability";

/** A minimal `Supplier` test double — only `code`/`name`/`capabilities()` matter to the runtime (it never calls `search`/`details`/`book`/`cancel`/`sync` itself; callers inject their own `call` function). */
export function createFakeSupplier(code: string, capabilities: SupplierCapability[]): Supplier {
  return {
    code,
    name: code,
    async initialize() {
      return ok(undefined);
    },
    async health() {
      const status: SupplierHealthStatus = { healthy: true, checkedAt: new Date().toISOString() };
      return ok(status);
    },
    capabilities() {
      return capabilities;
    },
    async search() {
      throw new Error("not used by runtime tests");
    },
    async details() {
      throw new Error("not used by runtime tests");
    },
    async book() {
      throw new Error("not used by runtime tests");
    },
    async cancel() {
      throw new Error("not used by runtime tests");
    },
    async sync() {
      throw new Error("not used by runtime tests");
    },
  };
}
