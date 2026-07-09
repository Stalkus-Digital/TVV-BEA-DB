import { container, createToken, moduleRegistry, type ModuleDefinition } from "@/shared/di";
import { healthCheckRegistry, type HealthCheck, type HealthCheckResult } from "@/shared/health";
import { createLogger } from "@/shared/logger";
import { PaymentService } from "./services/payment.service";

export const PAYMENT_SERVICE_TOKEN = createToken<PaymentService>("payments.service");

export const paymentsModule: ModuleDefinition = {
  name: "payments",
  register(c) {
    c.registerFactory(
      PAYMENT_SERVICE_TOKEN,
      () => new PaymentService({ logger: createLogger("payments") })
    );
  },
};

class PaymentsModuleHealthCheck implements HealthCheck {
  readonly name = "payments";
  async check(): Promise<HealthCheckResult> {
    return { name: this.name, status: "healthy", checkedAt: new Date().toISOString() };
  }
}

if (!moduleRegistry.getModule(paymentsModule.name)) {
  moduleRegistry.registerModule(paymentsModule);
  paymentsModule.register(container);
  healthCheckRegistry.register(new PaymentsModuleHealthCheck());
}

export function getPaymentService(): PaymentService {
  return container.resolve(PAYMENT_SERVICE_TOKEN);
}
