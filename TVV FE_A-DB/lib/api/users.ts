import { apiClient } from "./client";
import { ApiError } from "./errors";
import { endpoints } from "./config";
import { paginatedRows } from "./envelope";
import type { CustomerUser } from "./auth";

export interface UpdateProfileInput {
  name?: string;
  phone?: string | null;
}

export interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
}

export interface WishlistItem {
  packageSlug: string;
  addedAt: string;
  title?: string;
  heroImage?: string | null;
  startsFrom?: number;
}

interface TravelOsCustomerFullProfile {
  id: string;
  email: string;
  fullName: string;
  phone: string | null;
}

/**
 * `PATCH /api/me/profile` — real since the Customer Experience Platform
 * sprint (previously this threw `notImplemented`, based on a stale
 * assumption that no self-service profile endpoint existed yet). Only
 * sends the fields this form actually collects (`fullName`, `phone`);
 * Travel OS's profile PATCH treats every field as optional and only
 * applies what's present, so omitting the rest is correct, not partial.
 *
 * `CustomerFullProfile` has no RBAC `role` field (that's Auth's concern,
 * not Customer's) — the caller (`useUpdateProfileMutation`) merges this
 * return value with the existing session's `role` before calling
 * `sessionActions.setUser()`, which requires a complete `CustomerUser`.
 */
export async function updateProfile(input: UpdateProfileInput): Promise<Omit<CustomerUser, "role">> {
  const body: Record<string, unknown> = {};
  if (input.name !== undefined) body.fullName = input.name;
  if (input.phone !== undefined) body.phone = input.phone;

  const result = await apiClient.patch<TravelOsCustomerFullProfile>(endpoints.profile.update, body);
  if (!result?.id) throw new Error("Invalid profile update response");
  return { id: result.id, email: result.email, name: result.fullName, phone: result.phone };
}

export async function changePassword(input: ChangePasswordInput): Promise<{ ok: true }> {
  await apiClient.post(endpoints.auth.changePassword, input);
  return { ok: true };
}

/** No `/api/me/wishlist` (or any Wishlist model) exists on Travel OS — a genuine missing feature, not a wiring gap. Needs a product decision (build the backend, or remove this UI) before it can be replaced. See docs/38_CUSTOMER_INTEGRATION.md. */
export async function fetchWishlist(): Promise<WishlistItem[]> {
  throw ApiError.notImplemented("Wishlist");
}

export async function addToWishlist(_packageSlug: string): Promise<WishlistItem> {
  throw ApiError.notImplemented("Wishlist");
}

export async function removeFromWishlist(_packageSlug: string): Promise<void> {
  throw ApiError.notImplemented("Wishlist");
}

/** @deprecated Unused until a real Wishlist backend ships. */
export function parseWishlistRows(body: unknown): WishlistItem[] {
  return paginatedRows<WishlistItem>(body);
}
