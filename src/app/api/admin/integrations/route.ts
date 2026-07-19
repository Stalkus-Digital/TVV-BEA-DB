import type { NextRequest } from "next/server";
import { jsonError, jsonSuccess } from "@/api";
import { readAuthContextFromHeaders } from "@/modules/auth";
import { listIntegrationsHandler, createFerryOperatorHandler } from "@/modules/integrations";
import { isErr } from "@/shared/types";
import { ValidationError } from "@/shared/errors";

export async function GET(request: NextRequest) {
  const context = readAuthContextFromHeaders(request.headers);
  const result = await listIntegrationsHandler(context);
  if (isErr(result)) return jsonError(result.error);
  return jsonSuccess(result.value);
}

export async function POST(request: NextRequest) {
  const context = readAuthContextFromHeaders(request.headers);
  const body = await request.json().catch(() => null);
  // Creating a ferry operator: { type: "ferry", code, name }
  if (body?.type === "ferry") {
    const result = await createFerryOperatorHandler(context, body);
    if (isErr(result)) return jsonError(result.error);
    return jsonSuccess(result.value, { status: 201 });
  }
  return jsonError(new ValidationError('Unsupported create type — use { type: "ferry", code, name }'));
}
