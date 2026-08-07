import { NextRequest, NextResponse } from "next/server";
import { NautikaAdapter } from "@/modules/supplier/adapters/nautika/nautika.adapter";

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
    
    if (!body.from || !body.to || !body.date) {
      return NextResponse.json({ err: "Missing required payload fields", data: [] }, { status: 400 });
    }

    const adapter = new NautikaAdapter(dummyContext);
    const result = await adapter.getTripData(body.from, body.to, body.date);

    if (!result.ok) {
      return NextResponse.json({ err: result.error.message, data: [] }, { status: 500 });
    }

    // CRM expects { err: null, data: [...] }
    return NextResponse.json({ err: null, data: result.value }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ err: error.message, data: [] }, { status: 500 });
  }
}
