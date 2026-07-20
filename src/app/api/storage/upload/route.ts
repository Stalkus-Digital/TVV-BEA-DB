import type { NextRequest } from "next/server";
import { jsonError, jsonSuccess } from "@/api";
import { readAuthContextFromHeaders } from "@/modules/auth";
import { uploadHandler } from "@/modules/storage";
import { resolveImageContentType } from "@/modules/storage/uploads/file-validation";
import { isErr } from "@/shared/types";
import { ValidationError } from "@/shared/errors";

export async function POST(request: NextRequest) {
  const context = readAuthContextFromHeaders(request.headers);
  const formData = await request.formData().catch(() => null);
  if (!formData) return jsonError(new ValidationError("Expected multipart/form-data body"));

  const file = formData.get("file");
  if (!(file instanceof File)) return jsonError(new ValidationError('A "file" field is required'));

  const fileBuffer = Buffer.from(await file.arrayBuffer());
  const fileNameField = formData.get("fileName");
  const fileName = typeof fileNameField === "string" && fileNameField.length > 0 ? fileNameField : file.name;
  const contentType = resolveImageContentType(file.type, fileName);

  const result = await uploadHandler(context, {
    fileBuffer,
    contentType,
    fileName,
    category: formData.get("category"),
    ownerId: formData.get("ownerId"),
  });
  if (isErr(result)) return jsonError(result.error);
  return jsonSuccess(result.value, { status: 201 });
}
