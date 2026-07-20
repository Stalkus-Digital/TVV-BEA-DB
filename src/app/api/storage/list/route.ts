import { prisma } from "@/shared/database/prisma-client";
import { jsonSuccess, jsonError } from "@/api/http";
import "@/modules/storage";

export async function GET(request: Request) {
  try {
    const assets = await prisma.mediaAsset.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return jsonSuccess({ items: assets });
  } catch (error) {
    return jsonError(new Error("Failed to list media assets"));
  }
}
