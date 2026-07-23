import { container, createToken, moduleRegistry, type ModuleDefinition } from "@/shared/di";
import { createLogger } from "@/shared/logger";
import { JobQueueService } from "./services/job-queue.service";
import { OpenAIService } from "./services/openai.service";

export const JOB_QUEUE_SERVICE_TOKEN = createToken<JobQueueService>("system.jobQueue");
export const OPENAI_SERVICE_TOKEN = createToken<OpenAIService>("system.openai");

export const systemModule: ModuleDefinition = {
  name: "system",
  register(c) {
    c.registerFactory(JOB_QUEUE_SERVICE_TOKEN, () => new JobQueueService({ logger: createLogger("system.jobs") }));
    c.registerFactory(OPENAI_SERVICE_TOKEN, () => new OpenAIService({ logger: createLogger("system.openai") }));
  },
};

if (!moduleRegistry.getModule(systemModule.name)) {
  moduleRegistry.registerModule(systemModule);
  systemModule.register(container);
}

export function getJobQueueService(): JobQueueService {
  return container.resolve(JOB_QUEUE_SERVICE_TOKEN);
}

export function getOpenAIService(): OpenAIService {
  return container.resolve(OPENAI_SERVICE_TOKEN);
}
