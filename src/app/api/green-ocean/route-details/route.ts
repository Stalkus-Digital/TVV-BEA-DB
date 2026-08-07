import { NextRequest, NextResponse } from "next/server";
import { GreenOceanAdapter } from "@/modules/supplier/adapters/green-ocean/green-ocean.adapter";

// Dummy ServiceContext for now
const dummyContext = {
  logger: {
    info: console.log,
    error: console.error,
    warn: console.warn,
    debug: console.log,
  },
  config: {} as any,
  prisma: {} as any,
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    if (body.from_id === undefined || body.dest_to === undefined || !body.travel_date) {
      return NextResponse.json({ success: false, data: {} }, { status: 400 });
    }

    const adults = body.number_of_adults || 0;
    const infants = body.number_of_infants || 0;

    const adapter = new GreenOceanAdapter(dummyContext);
    const result = await adapter.getRouteDetails(body.from_id, body.dest_to, adults, infants, body.travel_date);

    if (!result.ok) {
      return NextResponse.json({ success: false, data: {}, error: result.error.message }, { status: 500 });
    }

    // CRM expects { success: true, data: {} }
    return NextResponse.json({ success: true, data: result.value }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ success: false, data: {}, error: error.message }, { status: 500 });
  }
}
