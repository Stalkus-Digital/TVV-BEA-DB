import { container, createToken, moduleRegistry, type ModuleDefinition } from "@/shared/di";
import { createLogger } from "@/shared/logger";
import { JobQueueService } from "./services/job-queue.service";

export const JOB_QUEUE_SERVICE_TOKEN = createToken<JobQueueService>("system.jobQueue");

export const systemModule: ModuleDefinition = {
  name: "system",
  register(c) {
    c.registerFactory(JOB_QUEUE_SERVICE_TOKEN, () => new JobQueueService({ logger: createLogger("system.jobs") }));
  },
};

if (!moduleRegistry.getModule(systemModule.name)) {
  moduleRegistry.registerModule(systemModule);
  systemModule.register(container);
}

export function getJobQueueService(): JobQueueService {
  return container.resolve(JOB_QUEUE_SERVICE_TOKEN);
}
