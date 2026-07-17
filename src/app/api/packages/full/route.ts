import { NextResponse } from "next/server";
import { prisma } from "@/shared/database/prisma-client";
import { isErr } from "@/shared/types";

function simpleSlugify(text: string) {
  return text.toString().toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

export async function POST(req: Request) {
  try {
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
      hotels,
      dayDescriptions,
      images
    } = body;

    const slug = simpleSlugify(title) + "-" + Math.random().toString(36).slice(2, 7);
    const code = "PKG-" + Math.random().toString(36).slice(2, 8).toUpperCase();

    const result = await prisma.$transaction(async (tx) => {
      // 1. Create base Package
      const pkg = await tx.package.create({
        data: {
          title,
          code,
          slug,
          destinationId,
          sourceType,
          tripType: tripType || null,
          durationDays: Number(durationDays),
          durationNights: Number(durationNights),
          status: "DRAFT",
          content: {
            shortDescription,
            itineraryDetails,
            inclusions,
            exclusions,
            images,
          } as any
        },
      });

      // 2. Create Pricing
      if (basePrice) {
        await tx.packagePricing.create({
          data: {
            packageId: pkg.id,
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

      // 3. Create Rules (Capacity)
      await tx.packageRule.create({
        data: {
          packageId: pkg.id,
          minPax: minPax ? Number(minPax) : 2,
          maxPax: maxPax ? Number(maxPax) : null,
          refundPolicy: "Standard cancellation policy applies.",
          cancellationTiers: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        }
      });

      // 4. Create Availability
      if (validFrom && validTo) {
        await tx.packageAvailability.create({
          data: {
            packageId: pkg.id,
            validFrom: new Date(validFrom),
            validTo: new Date(validTo),
            createdAt: new Date(),
            updatedAt: new Date(),
          }
        });
      }

      // 5. Create Days and Hotel Items
      if (hotels && Array.isArray(hotels)) {
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
              packageId: pkg.id,
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
    console.error("Failed to save full package:", error);
    return NextResponse.json(
      { success: false, error: { message: error.message || "Failed to save package", code: "INTERNAL_ERROR" } },
      { status: 500 }
    );
  }
}
