import { NextResponse } from "next/server";
import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/shared/database/prisma-client";

function normalizeDiscount(
  discount: unknown,
): Prisma.InputJsonValue | typeof Prisma.JsonNull | undefined {
  if (discount === undefined) return undefined;
  if (discount === null) return Prisma.JsonNull;
  if (typeof discount === "object" && discount !== null && "value" in discount && Number(discount.value) > 0) {
    const typed = discount as { type: string; value: number };
    return { type: typed.type, value: Number(typed.value) };
  }
  return Prisma.JsonNull;
}

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
      tripType,
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
      rules,
      hotels,
      dayDescriptions,
      images,
      isStaffPick,
      flightsIncluded,
      discount,
    } = body;

    const imageList = Array.isArray(images) ? images.slice(0, 5) : [];

    const result = await prisma.$transaction(async (tx) => {
      const existing = await tx.package.findUnique({ where: { id }, select: { seo: true } });
      const existingSeo = (existing?.seo && typeof existing.seo === "object" ? existing.seo : {}) as Record<string, unknown>;

      // 1. Update base Package
      const pkg = await tx.package.update({
        where: { id },
        data: {
          title,
          destinationId,
          sourceType,
          tripType: tripType || null,
          durationDays: Number(durationDays),
          durationNights: Number(durationNights),
          isStaffPick: Boolean(isStaffPick),
          flightsIncluded: Boolean(flightsIncluded),
          seo: {
            ...existingSeo,
            ...(imageList[0] ? { ogImageUrl: imageList[0] } : {}),
          },
          content: {
            shortDescription,
            itineraryDetails,
            inclusions,
            exclusions,
            rules: rules || "",
            images: imageList,
          } as any
        },
      });

      // 2. Update or Create Pricing
      if (basePrice !== undefined) {
        const discountPayload = normalizeDiscount(discount);
        await tx.packagePricing.upsert({
          where: { packageId: id },
          update: {
            basePrice: Number(basePrice),
            currency: currency || "INR",
            ...(discountPayload !== undefined ? { discount: discountPayload } : {}),
            updatedAt: new Date(),
          },
          create: {
            packageId: id,
            basePrice: Number(basePrice),
            currency: currency || "INR",
            discount: discountPayload ?? Prisma.JsonNull,
            occupancyPricing: [],
            childPricing: [],
            groupPricing: [],
            seasonalPricing: [],
            createdAt: new Date(),
            updatedAt: new Date(),
          }
        });
      } else if (discount !== undefined) {
        await tx.packagePricing.updateMany({
          where: { packageId: id },
          data: { discount: normalizeDiscount(discount), updatedAt: new Date() },
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
                images: imageList,
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
