import type { PaginationParams, Result } from "@/shared/types";
import type { BaseRepository } from "@/shared/repositories";
import type { AppError } from "@/shared/errors";
import type { EmailVerification } from "../types/email-verification";

export interface EmailVerificationRepository extends BaseRepository<EmailVerification, string> {
  findByUser(userId: string): Promise<Result<EmailVerification[], AppError>>;
  findMany(params?: PaginationParams): Promise<Result<import("@/shared/types").PaginatedResult<EmailVerification>, AppError>>;
}
