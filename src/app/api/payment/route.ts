import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/shared/database/prisma-client";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const paymentSchema = z.object({
      payment_gateway_data: z.object({
        amount: z.number().min(1, "Amount must be at least 1"),
        email: z.string().email().optional(),
        phone: z.string().optional(),
        destinationId: z.string().optional(),
        bookingNumber: z.string().optional(),
        sourceQuoteId: z.string().optional(),
        sourceQuoteNumber: z.string().optional()
      }),
      data: z.array(z.any()).min(1, "At least one service required")
    });

    const parsed = paymentSchema.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: "Invalid payload format", details: parsed.error.issues }, { status: 400 });
    }

    const { payment_gateway_data, data: services } = parsed.data;

    // Example logic to store a booking using existing Booking schema
    // Dynamically resolve destinationId
    let destinationId = payment_gateway_data.destinationId;

    if (!destinationId) {
      // Attempt to derive from the ferry service remark (e.g., "Port Blair-Havelock")
      const remark = services[0]?.makruzz_cData?.c_remark || services[0]?.route || "";
      const routeStart = remark.split("-")[0]?.trim();
      
      if (routeStart) {
        const dest = await prisma.destination.findFirst({
          where: { name: { contains: routeStart } } // Prisma SQLite/MySQL may not support mode: 'insensitive' without specific config, relying on default collation
        });
        if (dest) {
          destinationId = dest.id;
        }
      }
    }
    
    // Fallback if destination is not found or not provided
    if (!destinationId) {
      const fallback = await prisma.destination.findFirst();
      destinationId = fallback?.id || "DIRECT_FERRY";
    }

    const newBooking = await prisma.booking.create({
      data: {
        bookingNumber: payment_gateway_data.bookingNumber || `BKG-FERRY-${Date.now()}`,
        status: "PENDING",
        sourceQuoteId: payment_gateway_data.sourceQuoteId || "DIRECT",
        sourceQuoteNumber: payment_gateway_data.sourceQuoteNumber || "DIRECT",
        destinationId: destinationId,
        totalAmount: payment_gateway_data.amount || 0,
        amountPaid: 0,
        paymentStatus: "PENDING",
        currency: "INR",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    }).catch((e) => {
      console.error("Failed to create ferry booking", e);
      return null;
    });

    if (newBooking) {
      await Promise.all(services.map((s: any) => 
        prisma.bookingItem.create({
          data: {
            bookingId: newBooking.id,
            kind: "FERRY",
            title: `Ferry Booking - ${s.service}`,
            quantity: s.makruzz_cData?.no_of_passenger || 1,
            unitPrice: (payment_gateway_data.amount || 0) / (s.makruzz_cData?.no_of_passenger || 1),
            description: "Goa Package",
            inventoryItemId: null,
            costAmount: 15000,
          } as any
        })
      ));
    }

    const phonePeSimulatorUrl = process.env.PHONEPE_SIMULATOR_URL || "https://mercury-uat.phonepe.com/transact/simulator";
    return NextResponse.json({
      success: true,
      message: "Payment initiated",
      data: {
        paymentUrl: `${phonePeSimulatorUrl}?token=mock_token_${Date.now()}`,
        transactionId: "TXN_" + Date.now(),
        amount: payment_gateway_data.amount
      }
    }, { status: 200 });

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
