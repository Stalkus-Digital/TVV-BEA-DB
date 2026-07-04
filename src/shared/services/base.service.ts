import type { Logger } from "../logger/logger.types";

export interface ServiceContext {
  logger: Logger;
}

/**
 * Every module's services should extend this. It exists to guarantee a
 * consistent construction shape (a scoped logger, always) across modules —
 * it is intentionally not a place for shared business logic (per
 * docs/02_SYSTEM_ARCHITECTURE.md: "No shared business logic" between modules).
 */
export abstract class BaseService {
  protected readonly logger: Logger;

  protected constructor(context: ServiceContext) {
    this.logger = context.logger;
  }
}
