import type { AppError } from "@/shared/errors";
import { isErr, ok, type Result } from "@/shared/types";
import { fetchPackageDetail, fetchPackageList } from "../adapters/website-package.adapter";
import { toLegacyPackageFromDetail, toLegacyPackageFromSummary } from "../transformers/package.transformer";
import type { LegacyPackageDetailResponseDTO, LegacyPackageListResponseDTO } from "../dto/legacy-package.dto";

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 20;

export interface LegacyPackageListQuery {
  destinationSlug?: string;
  page?: number;
  pageSize?: number;
}

/**
 * Orchestration only — calls the Website module's own filtering/pagination
 * logic via the adapter, then reshapes the result into the exact envelope
 * `paginatedRows()` in the frontend's `lib/api/envelope.ts` expects
 * (`{meta: {total, page, limit, totalPages}, data}`), which is NOT the same
 * field names Travel OS's own `PaginatedResult` uses natively
 * (`{items, total, page, pageSize, totalPages}`) — see docs/30.
 */
export async function listLegacyPackages(query: LegacyPackageListQuery): Promise<Result<LegacyPackageListResponseDTO, AppError>> {
  const result = await fetchPackageList(query);
  if (isErr(result)) return result;
  const { items, total, page, pageSize } = result.value;
  const limit = pageSize ?? DEFAULT_PAGE_SIZE;
  return ok({
    meta: { total, page: page ?? DEFAULT_PAGE, limit, totalPages: Math.max(1, Math.ceil(total / limit)) },
    data: items.map(toLegacyPackageFromSummary),
  });
}

/** Reshapes into `{package: LegacyPackageDTO}`, matching `pickField(body, "package")`. */
export async function getLegacyPackageDetail(slug: string): Promise<Result<LegacyPackageDetailResponseDTO, AppError>> {
  const result = await fetchPackageDetail(slug);
  if (isErr(result)) return result;
  return ok({ package: toLegacyPackageFromDetail(result.value) });
}
