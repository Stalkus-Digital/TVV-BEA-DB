import { adminApiClient } from "@/lib/admin-api/client";
import { adminEndpoints } from "@/lib/admin-api/endpoints";
import type { PaginatedResult } from "@/lib/admin-api/types";
import type { PublicUser } from "../types";

export async function fetchUsers(params: {
  page?: number;
  pageSize?: number;
  isActive?: boolean;
}): Promise<PaginatedResult<PublicUser>> {
  const result = await adminApiClient.get<PaginatedResult<PublicUser>>(adminEndpoints.users, {
    params: {
      page: params.page ?? 1,
      pageSize: params.pageSize ?? 20,
      isActive: params.isActive,
    },
  });
  if (!result) {
    return { items: [], page: 1, pageSize: params.pageSize ?? 20, total: 0, totalPages: 1 };
  }
  return result;
}

export async function fetchAllUsers(): Promise<PublicUser[]> {
  const pageSize = 20;
  let page = 1;
  let totalPages = 1;
  const items: PublicUser[] = [];

  while (page <= totalPages) {
    const result = await fetchUsers({ page, pageSize });
    items.push(...result.items);
    totalPages = result.totalPages;
    page += 1;
  }

  return items;
}

export async function fetchUser(id: string): Promise<PublicUser> {
  const result = await adminApiClient.get<PublicUser>(`${adminEndpoints.users}/${id}`);
  if (!result) throw new Error("Customer not found");
  return result;
}
