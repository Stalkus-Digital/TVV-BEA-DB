import { NextResponse } from "next/server";
import { prisma } from "@/shared/database/prisma-client";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: pkgId } = await params;
    if (!pkgId) {
      return NextResponse.json({ error: "Package ID is required" }, { status: 400 });
    }

    const pkg = await prisma.package.findUnique({
      where: { id: pkgId },
      include: {
        days: {
          include: { items: true }
        }
      }
    });

    if (!pkg) {
      return NextResponse.json({ error: "Package not found" }, { status: 404 });
    }

    // Duplicate package logic
    const { id, createdAt, updatedAt, ...restPkg } = pkg;
    const duplicatedPkg = await prisma.package.create({
      data: {
        ...restPkg,
        seo: restPkg.seo as any,
        faqs: restPkg.faqs as any,
        title: `${pkg.title} (Copy)`,
        slug: `${pkg.slug}-copy-${Date.now()}`,
        status: "DRAFT",
        createdAt: new Date(),
        updatedAt: new Date(),
        days: {
          create: pkg.days.map(day => {
            const { id: dayId, packageId, createdAt, updatedAt, ...restDay } = day;
            return {
              ...restDay,
              items: {
                create: day.items.map(item => {
                  const { id: itemId, packageDayId, createdAt, updatedAt, ...restItem } = item;
                  return {
                    ...restItem,
                    slotCriteria: restItem.slotCriteria as any,
                  };
                })
              }
            };
          })
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: duplicatedPkg,
      message: "Package duplicated successfully"
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
