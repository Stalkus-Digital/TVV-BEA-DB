import { NextResponse, type NextRequest } from "next/server";
import { getCustomerProfileService } from "@/modules/customer";
import { getUserHandler } from "@/modules/auth";
import { isErr } from "@/shared/types";
import { jsonError, jsonSuccess } from "@/api";

export async function GET(request: NextRequest) {
  // Point data source to CustomerProfile instead of system users
  const profilesResult = await getCustomerProfileService().listCustomers();
  if (isErr(profilesResult)) return jsonError(profilesResult.error);
  
  // We need to return PublicUser objects since the frontend expects them.
  // listCustomers() returns CustomerFullProfile, but we can fetch the original users.
  // Actually, listCustomers already fetches the users internally, but returns a mapped type.
  // Let's just fetch the PublicUsers for these profiles.
  const users = [];
  for (const p of profilesResult.value) {
    const user = await getUserHandler(p.id); // p.id is userId in CustomerAccount
    if (!isErr(user)) users.push(user.value);
  }

  return jsonSuccess({
    items: users,
    page: 1,
    pageSize: Math.max(1, users.length),
    total: users.length,
    totalPages: 1
  });
}
