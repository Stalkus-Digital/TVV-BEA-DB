import type { NextRequest } from "next/server";
import { jsonError, jsonSuccess } from "@/api";
import { isErr } from "@/shared/types";
import { getApiKeyService, getRoleService } from "@/modules/auth/module";

export async function GET(request: NextRequest) {
  const result = await getApiKeyService().list();
  if (isErr(result)) return jsonError(result.error);
  return jsonSuccess(result.value);
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body || !body.name) return jsonError(new Error("Missing API Key name"));

  // Find or create admin role
  let roleId = body.roleId;
  if (!roleId) {
    const roles = await getRoleService().list();
    if (isErr(roles)) return jsonError(roles.error);
    const adminRole = roles.value.find(r => r.name.toLowerCase() === "admin");
    if (adminRole) {
      roleId = adminRole.id;
    } else if (roles.value.length > 0) {
      roleId = roles.value[0].id;
    } else {
      return jsonError(new Error("No roles available in the system"));
    }
  }

  const result = await getApiKeyService().create({
    name: body.name,
    roleId,
    expiresAt: body.expiresAt || null
  });

  if (isErr(result)) return jsonError(result.error);
  return jsonSuccess(result.value, { status: 201 });
}
