import { NextResponse } from "next/server";
import { prisma } from "@/shared/database/prisma-client";
import { isErr } from "@/shared/types";

export async function PUT(req: Request, context: any) {
  try {
    const { id } = await context.params;
    const body = await req.json();
    const { 
      title, 
      destinationId, 
      durationDays, 
      durationNights, 
      sourceType, 
      basePrice,
      currency,
      minPax,
      maxPax,
      validFrom,
      validTo,
      shortDescription,
      itineraryDetails,
      inclusions,
      exclusions,
      hotels,
      dayDescriptions,
      images
    } = body;

    const result = await prisma.$transaction(async (tx) => {
      // 1. Update base Package
      const pkg = await tx.package.update({
        where: { id },
        data: {
          title,
          destinationId,
          sourceType,
          durationDays: Number(durationDays),
          durationNights: Number(durationNights),
          content: {
            shortDescription,
            itineraryDetails,
            inclusions,
            exclusions,
            images,
          } as any
        },
      });

      // 2. Update or Create Pricing
      if (basePrice !== undefined) {
        await tx.packagePricing.upsert({
          where: { packageId: id },
          update: {
            basePrice: Number(basePrice),
            currency: currency || "INR",
            updatedAt: new Date(),
          },
          create: {
            packageId: id,
            basePrice: Number(basePrice),
            currency: currency || "INR",
            occupancyPricing: [],
            childPricing: [],
            groupPricing: [],
            seasonalPricing: [],
            createdAt: new Date(),
            updatedAt: new Date(),
          }
        });
      }

      // 3. Update or Create Rules
      await tx.packageRule.upsert({
        where: { packageId: id },
        update: {
          minPax: minPax ? Number(minPax) : 2,
          maxPax: maxPax ? Number(maxPax) : null,
          updatedAt: new Date(),
        },
        create: {
          packageId: id,
          minPax: minPax ? Number(minPax) : 2,
          maxPax: maxPax ? Number(maxPax) : null,
          refundPolicy: "Standard cancellation policy applies.",
          cancellationTiers: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        }
      });

      // 4. Update or Create Availability
      if (validFrom || validTo) {
        const existingAvail = await tx.packageAvailability.findFirst({ where: { packageId: id } });
        if (existingAvail) {
          await tx.packageAvailability.update({
            where: { id: existingAvail.id },
            data: {
              validFrom: validFrom ? new Date(validFrom) : existingAvail.validFrom,
              validTo: validTo ? new Date(validTo) : existingAvail.validTo,
              updatedAt: new Date(),
            }
          });
        } else if (validFrom && validTo) {
          await tx.packageAvailability.create({
            data: {
              packageId: id,
              validFrom: new Date(validFrom),
              validTo: new Date(validTo),
              createdAt: new Date(),
              updatedAt: new Date(),
            }
          });
        }
      }

      // 5. Update Days and Hotel Items
      if (hotels && Array.isArray(hotels)) {
        await tx.packageItem.deleteMany({
          where: { packageDay: { packageId: id } }
        });
        await tx.packageDay.deleteMany({
          where: { packageId: id }
        });

        const dayMap = new Map<number, typeof hotels>();
        for (const h of hotels) {
          const dNum = Number(h.dayNumber);
          if (!dayMap.has(dNum)) dayMap.set(dNum, []);
          dayMap.get(dNum)!.push(h);
        }

        // Build a lookup for per-day descriptions
        const descMap = new Map<number, { title: string; description: string }>();
        if (dayDescriptions && Array.isArray(dayDescriptions)) {
          for (const dd of dayDescriptions) {
            descMap.set(Number(dd.dayNumber), { title: dd.title || `Day ${dd.dayNumber}`, description: dd.description || "" });
          }
        }

        for (let i = 1; i <= Number(durationDays); i++) {
          const dayMeta = descMap.get(i);
          const day = await tx.packageDay.create({
            data: {
              packageId: id,
              dayNumber: i,
              title: dayMeta?.title || `Day ${i}`,
              description: dayMeta?.description || null,
            }
          });

          const dayHotels = dayMap.get(i) || [];
          for (let j = 0; j < dayHotels.length; j++) {
            const h = dayHotels[j];
            await tx.packageItem.create({
              data: {
                packageDayId: day.id,
                kind: "HOTEL",
                resolutionMode: "PINNED",
                title: h.hotelName || "Hotel",
                description: h.location,
                pricingMode: "INCLUDED",
                position: j,
                images: images || [],
              }
            });
          }
        }
      }

      return pkg;
    }, {
      maxWait: 15000,
      timeout: 30000
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    console.error("Failed to update full package:", error);
    return NextResponse.json(
      { success: false, error: { message: error.message || "Failed to update package", code: "INTERNAL_ERROR" } },
      { status: 500 }
    );
  }
}
