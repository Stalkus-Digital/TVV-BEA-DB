import { prisma } from "@/shared/database/prisma-client";
import { jsonSuccess, jsonError } from "@/api/http";

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const body = await request.json();
    const { source, target, isPermanent } = body;

    const redirect = await prisma.cmsRedirect.update({
      where: { id: (await context.params).id },
      data: { source, target, isPermanent }
    });

    return jsonSuccess(redirect);
  } catch (error) {
    return jsonError(new Error("Failed to update redirect"));
  }
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    await prisma.cmsRedirect.delete({
      where: { id: (await context.params).id }
    });
    return jsonSuccess({ success: true });
  } catch (error) {
    return jsonError(new Error("Failed to delete redirect"));
  }
}
