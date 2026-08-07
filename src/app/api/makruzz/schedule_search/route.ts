import { NextRequest, NextResponse } from "next/server";
import { getIntegrationConfigResolver } from "@/modules/integrations";
import { BaseService } from "@/shared/services";
import { MakruzzAdapter } from "@/modules/supplier/adapters/makruzz/makruzz.adapter";

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

// We will fetch sectors dynamically using the adapter instead of hardcoding

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { data } = body;
    
    if (!data || !data.from_location || !data.to_location || !data.travel_date) {
      return NextResponse.json({ success: false, error: "Missing required payload fields" }, { status: 400 });
    }

    const adapter = new MakruzzAdapter(dummyContext);

    let sourceId = data.from_location;
    let destinationId = data.to_location;

    // Dynamically fetch sectors to map names to IDs
    const sectorsRes = await adapter.getSectors();
    if (sectorsRes.ok && Array.isArray(sectorsRes.value)) {
      const sourceSector = sectorsRes.value.find((s: any) => 
        s.name?.toLowerCase().includes(data.from_location.toLowerCase()) || 
        data.from_location.toLowerCase().includes(s.name?.toLowerCase())
      );
      if (sourceSector) sourceId = sourceSector.id;

      const destSector = sectorsRes.value.find((s: any) => 
        s.name?.toLowerCase().includes(data.to_location.toLowerCase()) || 
        data.to_location.toLowerCase().includes(s.name?.toLowerCase())
      );
      if (destSector) destinationId = destSector.id;
    }

    // Format YYYY-MM-DD
    const journeyDate = data.travel_date; 
    
    const result = await adapter.scheduleSearch(sourceId, destinationId, journeyDate);

    if (!result.ok) {
      return NextResponse.json({ success: false, error: result.error.message }, { status: 500 });
    }

    // Normalize output format
    return NextResponse.json({ success: true, data: result.value });

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
