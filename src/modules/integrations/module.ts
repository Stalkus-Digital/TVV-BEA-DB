import { container, createToken, moduleRegistry, type ModuleDefinition } from "@/shared/di";
import { healthCheckRegistry, type HealthCheck, type HealthCheckResult } from "@/shared/health";
import { createLogger } from "@/shared/logger";
import { IntegrationService } from "./services/integration.service";

export const INTEGRATION_SERVICE_TOKEN = createToken<IntegrationService>("integrations.service");

export const integrationsModule: ModuleDefinition = {
  name: "integrations",
  register(c) {
    c.registerFactory(
      INTEGRATION_SERVICE_TOKEN,
      () => new IntegrationService({ logger: createLogger("integrations") })
    );
  },
};

class IntegrationsModuleHealthCheck implements HealthCheck {
  readonly name = "integrations";
  async check(): Promise<HealthCheckResult> {
    return { name: this.name, status: "healthy", checkedAt: new Date().toISOString() };
  }
}

if (!moduleRegistry.getModule(integrationsModule.name)) {
  moduleRegistry.registerModule(integrationsModule);
  integrationsModule.register(container);
  healthCheckRegistry.register(new IntegrationsModuleHealthCheck());
}

export function getIntegrationService(): IntegrationService {
  return container.resolve(INTEGRATION_SERVICE_TOKEN);
}

let seedPromise: Promise<void> | null = null;
export function ensureIntegrationsSeeded(): Promise<void> {
  if (!seedPromise) {
    seedPromise = getIntegrationService()
      .ensureSeeded()
      .catch((err) => {
        createLogger("integrations").warn("Failed to seed integrations", { err });
      });
  }
  return seedPromise;
}

void ensureIntegrationsSeeded();
