import { NextResponse } from "next/server";
import { getSupplierDispatcher } from "@/modules/supplier/runtime";
import { SupplierCapability } from "@/modules/supplier/types";
import { isErr } from "@/shared/types";
import { jsonSuccess, jsonError } from "@/api/http";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { capability, criteria } = body;

    if (!capability || !criteria) {
      return NextResponse.json({ success: false, error: "Missing capability or criteria" }, { status: 400 });
    }

    const dispatcher = getSupplierDispatcher();
    const result = await dispatcher.dispatch({
      capability: capability as SupplierCapability,
      operation: "SEARCH",
      call: (supplier, signal) => supplier.search(criteria)
    });

    if (isErr(result.result)) {
      return jsonError(result.result.error);
    }

    return jsonSuccess({
      supplierCode: result.supplierCode,
      results: result.result.value
    });
  } catch (error: any) {
    console.error("API Search Error:", error);
    return NextResponse.json({ success: false, error: error?.message || "Internal Server Error", stack: error?.stack }, { status: 500 });
  }
}
