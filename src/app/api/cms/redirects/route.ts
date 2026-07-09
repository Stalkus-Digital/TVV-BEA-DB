import { NextResponse } from "next/server";
import { prisma } from "@/shared/database/prisma-client";
import { jsonSuccess, jsonError } from "@/api/http";

export async function GET(request: Request) {
  try {
    const redirects = await prisma.cmsRedirect.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return jsonSuccess({ items: redirects });
  } catch (error) {
    return jsonError(new Error("Failed to fetch redirects"));
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { source, target, isPermanent } = body;
    
    if (!source || !target) {
      return NextResponse.json({ success: false, error: "Source and target are required" }, { status: 400 });
    }

    const newRedirect = await prisma.cmsRedirect.create({
      data: {
        source,
        target,
        isPermanent: isPermanent !== undefined ? isPermanent : true,
      }
    });

    return jsonSuccess(newRedirect);
  } catch (error) {
    return jsonError(new Error("Failed to create redirect"));
  }
}
