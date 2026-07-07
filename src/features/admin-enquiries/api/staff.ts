import { adminApiClient } from "@/lib/admin-api/client";
import { adminEndpoints } from "@/lib/admin-api/endpoints";
import type { PaginatedResult } from "@/lib/admin-api/types";
import type { StaffUser } from "../types";

export async function fetchStaffUsers(): Promise<StaffUser[]> {
  const pageSize = 100;
  let page = 1;
  let totalPages = 1;
  const users: StaffUser[] = [];

  while (page <= totalPages) {
    const result = await adminApiClient.get<PaginatedResult<StaffUser>>(adminEndpoints.users, {
      params: { page, pageSize, isActive: true },
    });
    if (!result) break;
    users.push(...result.items.map((user) => ({ id: user.id, email: user.email, fullName: user.fullName, isActive: user.isActive })));
    totalPages = result.totalPages;
    page += 1;
  }

  return users;
}
