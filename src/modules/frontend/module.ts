import { container, moduleRegistry, type ModuleDefinition } from "@/shared/di";
import { healthCheckRegistry, type HealthCheck, type HealthCheckResult } from "@/shared/health";

/**
 * Frontend Compatibility Layer — Sprint 13. Owns no repositories, no
 * services requiring DI, and no business logic of its own: every function
 * in adapters/ is a direct pass-through to an already-registered Website
 * or Auth module handler, and services/ only reshapes their results into
 * the field names/envelope the existing frontend (tvv-new2-main) already
 * expects at `/v1/*`. register() is a no-op for exactly that reason — this
 * module exists to be discoverable and health-checked like every other
 * module, not because it needs container-managed state.
 *
 * See docs/30_FRONTEND_COMPATIBILITY_LAYER.md for the full mapping.
 */
export const frontendModule: ModuleDefinition = {
  name: "frontend",
  register() {
    // No repositories or DI-managed services — see module docstring above.
  },
};

class FrontendModuleHealthCheck implements HealthCheck {
  readonly name = "frontend";
  async check(): Promise<HealthCheckResult> {
    return { name: this.name, status: "healthy", checkedAt: new Date().toISOString() };
  }
}

if (!moduleRegistry.getModule(frontendModule.name)) {
  moduleRegistry.registerModule(frontendModule);
  frontendModule.register(container);
  healthCheckRegistry.register(new FrontendModuleHealthCheck());
}
