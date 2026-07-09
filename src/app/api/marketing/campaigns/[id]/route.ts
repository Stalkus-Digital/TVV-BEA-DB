import { NextResponse } from "next/server";
import { prisma } from "@/shared/database/prisma-client";
import { revalidatePath } from "next/cache";

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const body = await request.json();

    const campaign = await prisma.marketingCampaign.update({
      where: { id },
      data: {
        name: body.name,
        type: body.type,
        status: body.status,
        budget: body.budget,
        startDate: body.startDate ? new Date(body.startDate) : null,
        endDate: body.endDate ? new Date(body.endDate) : null,
      },
    });

    revalidatePath("/api/marketing/campaigns");
    return NextResponse.json(campaign);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;

    await prisma.marketingCampaign.delete({
      where: { id },
    });

    revalidatePath("/api/marketing/campaigns");
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
