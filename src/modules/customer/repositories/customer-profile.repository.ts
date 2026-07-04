import type { Result } from "@/shared/types";
import type { AppError } from "@/shared/errors";
import type { CustomerProfile } from "../types/customer-profile";

export type UpsertCustomerProfileData = Partial<Omit<CustomerProfile, "id" | "userId" | "createdAt" | "updatedAt">>;

/**
 * Not a `BaseRepository` — a profile is always looked up/written by
 * `userId`, never a repository-generated `id`, so the shared
 * find/create/update/delete shape doesn't fit. `upsert` covers both "first
 * write" and "later edit" in one call since a `CustomerProfile` row may not
 * exist yet for a given user.
 */
export interface CustomerProfileRepository {
  findByUserId(userId: string): Promise<Result<CustomerProfile | null, AppError>>;
  upsert(userId: string, data: UpsertCustomerProfileData): Promise<Result<CustomerProfile, AppError>>;
}
