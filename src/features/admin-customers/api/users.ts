import { adminApiClient } from "@/lib/admin-api/client";
import { adminEndpoints } from "@/lib/admin-api/endpoints";
import type { PaginatedResult } from "@/lib/admin-api/types";
import type { CustomerListFilters, PaginatedCustomers, PublicUser } from "../types";

export interface AdminCustomerDetail extends PublicUser {
  phone: string | null;
  dateOfBirth: string | null;
  nationality: string | null;
  passportNumber: string | null;
  passportExpiry: string | null;
  passportCountry: string | null;
}

export interface CustomerNote {
  id: string;
  userId: string;
  authorUserId: string | null;
  body: string;
  createdAt: string;
}

export interface CustomerPaymentRecord {
  id: string;
  bookingId: string;
  bookingNumber: string;
  amount: number;
  currency: string;
  method: string;
  status: string;
  reference: string | null;
  createdAt: string;
}

function customerPath(id: string) {
  return `${adminEndpoints.customers}/${id}`;
}

export async function fetchCustomers(filters: CustomerListFilters = {}): Promise<PaginatedCustomers> {
  const result = await adminApiClient.get<PaginatedResult<PublicUser>>(adminEndpoints.customers, {
    params: {
      search: filters.search,
      emailVerified: filters.emailVerified,
      page: filters.page ?? 1,
      pageSize: filters.pageSize ?? 20,
    },
  });
  if (!result) {
    return { items: [], page: 1, pageSize: filters.pageSize ?? 20, total: 0, totalPages: 1 };
  }
  return {
    items: result.items.map((user) => ({
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      isActive: user.isActive,
      emailVerified: Boolean(user.emailVerifiedAt),
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      phone: null,
      role: null,
      lastActivityAt: user.lastLoginAt ?? user.updatedAt,
      enquiryCount: 0,
      quoteCount: 0,
      bookingCount: 0,
    })),
    page: result.page,
    pageSize: result.pageSize,
    total: result.total,
    totalPages: result.totalPages,
  };
}

export async function fetchCustomerDetail(id: string): Promise<AdminCustomerDetail> {
  const result = await adminApiClient.get<AdminCustomerDetail>(customerPath(id));
  if (!result) throw new Error("Customer not found");
  return result;
}

export async function createCustomer(data: {
  email: string;
  fullName: string;
  phone?: string | null;
}): Promise<AdminCustomerDetail> {
  const result = await adminApiClient.post<AdminCustomerDetail>(adminEndpoints.customers, data);
  if (!result) throw new Error("Failed to create customer");
  return result;
}

export async function updateCustomer(
  id: string,
  data: { fullName?: string; phone?: string | null; isActive?: boolean }
): Promise<AdminCustomerDetail> {
  const result = await adminApiClient.patch<AdminCustomerDetail>(customerPath(id), data);
  if (!result) throw new Error("Failed to update customer");
  return result;
}

export async function archiveCustomer(id: string): Promise<AdminCustomerDetail> {
  const result = await adminApiClient.post<AdminCustomerDetail>(`${customerPath(id)}/archive`, {});
  if (!result) throw new Error("Failed to archive customer");
  return result;
}

export async function restoreCustomer(id: string): Promise<AdminCustomerDetail> {
  const result = await adminApiClient.post<AdminCustomerDetail>(`${customerPath(id)}/restore`, {});
  if (!result) throw new Error("Failed to restore customer");
  return result;
}

export async function bulkArchiveCustomers(ids: string[]): Promise<{ updated: number }> {
  const result = await adminApiClient.post<{ updated: number }>(`${adminEndpoints.customers}/bulk/archive`, { ids });
  if (!result) throw new Error("Failed to archive customers");
  return result;
}

export async function fetchCustomerNotes(userId: string): Promise<CustomerNote[]> {
  const result = await adminApiClient.get<CustomerNote[]>(`${customerPath(userId)}/notes`);
  return result ?? [];
}

export async function createCustomerNote(userId: string, body: string): Promise<CustomerNote> {
  const result = await adminApiClient.post<CustomerNote>(`${customerPath(userId)}/notes`, { body });
  if (!result) throw new Error("Failed to create note");
  return result;
}

export async function fetchCustomerPayments(userId: string): Promise<CustomerPaymentRecord[]> {
  const result = await adminApiClient.get<CustomerPaymentRecord[]>(`${customerPath(userId)}/payments`);
  return result ?? [];
}

export async function fetchUser(id: string): Promise<PublicUser> {
  const result = await adminApiClient.get<PublicUser>(`${adminEndpoints.users}/${id}`);
  if (!result) throw new Error("Customer not found");
  return result;
}

export async function fetchAllUsers(): Promise<PublicUser[]> {
  const pageSize = 20;
  let page = 1;
  let totalPages = 1;
  const items: PublicUser[] = [];

  while (page <= totalPages) {
    const result = await adminApiClient.get<PaginatedResult<PublicUser>>(adminEndpoints.customers, {
      params: { page, pageSize },
    });
    if (!result) break;
    items.push(...result.items);
    totalPages = result.totalPages;
    page += 1;
  }

  return items;
}
