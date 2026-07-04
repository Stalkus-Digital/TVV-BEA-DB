import type { NextRequest } from "next/server";
import { jsonError, jsonSuccess } from "@/api";
import { isErr } from "@/shared/types";
import { resolveAuthContext } from "@/modules/auth";
import { submitEnquiryHandler } from "@/modules/customer";

/**
 * Public — anonymous visitors submit enquiries. This is on the
 * middleware's public allow-list, which means `middleware.ts` never
 * forwards auth-context headers for this path (public paths skip context
 * resolution entirely, same as `/api/website/*`). So a logged-in
 * customer's `userId` still gets attached: this route resolves the
 * Authorization header itself, directly, treating a missing/invalid
 * token as "anonymous" rather than an error — `resolveAuthContext` is
 * pure (JWT verify only, no session/DB lookup), so calling it here
 * carries none of the isolation caveats that apply to session-revocation
 * checks elsewhere in this project.
 */
export async function POST(request: NextRequest) {
  const authResult = await resolveAuthContext(request.headers.get("authorization"));
  const context = isErr(authResult) ? null : authResult.value;

  const body = await request.json().catch(() => null);
  const result = await submitEnquiryHandler(context, body);
  if (isErr(result)) return jsonError(result.error);
  return jsonSuccess(result.value, { status: 201 });
}
