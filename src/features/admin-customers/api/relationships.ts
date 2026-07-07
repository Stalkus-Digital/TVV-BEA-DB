import { adminApiClient } from "@/lib/admin-api/client";
import { adminEndpoints } from "@/lib/admin-api/endpoints";
import type { PaginatedResult } from "@/lib/admin-api/types";
import type { CustomerBookingRecord, CustomerEnquiryRecord, CustomerQuoteRecord, CustomerRelationshipBundle } from "../types";

async function fetchAllPages<T>(path: string): Promise<T[]> {
  const pageSize = 100;
  let page = 1;
  let totalPages = 1;
  const items: T[] = [];

  while (page <= totalPages) {
    const result = await adminApiClient.get<PaginatedResult<T>>(path, { params: { page, pageSize } });
    if (!result) break;
    items.push(...result.items);
    totalPages = result.totalPages;
    page += 1;
  }

  return items;
}

export async function fetchCustomerRelationshipBundle(): Promise<CustomerRelationshipBundle> {
  const [enquiries, quotes, bookings] = await Promise.all([
    fetchAllPages<CustomerEnquiryRecord>(adminEndpoints.enquiries),
    fetchAllPages<CustomerQuoteRecord>(adminEndpoints.quotes),
    fetchAllPages<CustomerBookingRecord>(adminEndpoints.bookings),
  ]);

  return { enquiries, quotes, bookings };
}
