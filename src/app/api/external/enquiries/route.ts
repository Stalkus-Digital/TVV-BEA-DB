import type { NextRequest } from "next/server";
import { jsonError, jsonSuccess } from "@/api";
import { getEnquiryService } from "@/modules/customer";
import { isErr } from "@/shared/types";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  
  // Create an enquiry (lead). We extract the API Key context if needed,
  // but customerId is typically null for website leads unless authenticated.
  const result = await getEnquiryService().submit(body, null);
  
  if (isErr(result)) return jsonError(result.error);
  return jsonSuccess(result.value, { status: 201 });
}
