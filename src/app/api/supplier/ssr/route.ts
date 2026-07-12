import { NextResponse } from "next/server";
import { getSupplierRegistry } from "@/modules/supplier";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const supplier = getSupplierRegistry().getSupplier("tripjack");
    
    if (!supplier || typeof (supplier as any).getSsrOptions !== "function") {
      return NextResponse.json({ success: false, error: "TripJack supplier is not available" }, { status: 500 });
    }

    const result = await (supplier as any).getSsrOptions(body);
    if (!result.ok) {
      return NextResponse.json({ success: false, error: result.error.message }, { status: 400 });
    }
    return NextResponse.json({ success: true, data: result.value });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
