import { container, createToken, moduleRegistry, type ModuleDefinition } from "@/shared/di";
import { healthCheckRegistry, type HealthCheck, type HealthCheckResult } from "@/shared/health";
import { createLogger } from "@/shared/logger";
import { CrmService } from "./services/crm.service";

export const CRM_SERVICE_TOKEN = createToken<CrmService>("crm.service.main");

export const crmModule: ModuleDefinition = {
  name: "crm",
  register(c) {
    c.registerFactory(CRM_SERVICE_TOKEN, () => new CrmService({ logger: createLogger("crm.main") }));
  },
};

class CrmModuleHealthCheck implements HealthCheck {
  readonly name = "crm";
  async check(): Promise<HealthCheckResult> {
    return { name: this.name, status: "healthy", checkedAt: new Date().toISOString() };
  }
}

if (!moduleRegistry.getModule(crmModule.name)) {
  moduleRegistry.registerModule(crmModule);
  crmModule.register(container);
  healthCheckRegistry.register(new CrmModuleHealthCheck());
}

export function getCrmService(): CrmService {
  return container.resolve(CRM_SERVICE_TOKEN);
}
