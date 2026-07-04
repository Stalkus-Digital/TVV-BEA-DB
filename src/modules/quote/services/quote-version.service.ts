import { isErr, type Result } from "@/shared/types";
import { BaseService, type ServiceContext } from "@/shared/services";
import type { AppError } from "@/shared/errors";
import type { QuoteVersion } from "../types/quote-version";
import type { QuoteVersionRepository } from "../repositories/quote-version.repository";

/** Pure version bookkeeping — snapshot assembly happens in quote.service.ts's send(), which has access to items + computed pricing. */
export class QuoteVersionService extends BaseService {
  constructor(
    context: ServiceContext,
    private readonly versions: QuoteVersionRepository
  ) {
    super(context);
  }

  async listByQuote(quoteId: string): Promise<Result<QuoteVersion[], AppError>> {
    return this.versions.findByQuote(quoteId);
  }

  async createVersion(quoteId: string, snapshot: unknown, changeNote: string | null): Promise<Result<QuoteVersion, AppError>> {
    const latest = await this.versions.findLatest(quoteId);
    if (isErr(latest)) return latest;

    const versionNumber = (latest.value?.versionNumber ?? 0) + 1;
    this.logger.info("Creating quote version", { quoteId, versionNumber });

    return this.versions.create({
      quoteId,
      versionNumber,
      snapshot,
      createdAt: new Date().toISOString(),
      changeNote,
    });
  }
}
