import { NextResponse } from "next/server";
import { prisma } from "@/shared/database/prisma-client";

export async function GET() {
  try {
    const countries = [
      { name: "India", isoCode: "IN" },
      { name: "United Arab Emirates", isoCode: "AE" },
      { name: "United States", isoCode: "US" },
      { name: "United Kingdom", isoCode: "GB" },
      { name: "Thailand", isoCode: "TH" },
      { name: "Singapore", isoCode: "SG" },
    ];

    const createdCountries: Record<string, any> = {};

    for (const c of countries) {
      let country = await prisma.country.findFirst({ where: { isoCode: c.isoCode } });
      if (!country) {
        country = await prisma.country.create({
          data: {
            name: c.name,
            isoCode: c.isoCode,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        });
      }
      createdCountries[c.isoCode] = country;
    }

    const india = createdCountries["IN"];
    const ae = createdCountries["AE"];

    if (india) {
      const states = ["Maharashtra", "Delhi", "Karnataka", "Tamil Nadu", "Kerala", "Goa"];
      for (const stateName of states) {
        let state = await prisma.state.findFirst({ where: { name: stateName, countryId: india.id } });
        if (!state) {
          await prisma.state.create({
            data: {
              countryId: india.id,
              name: stateName,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          });
        }
      }
    }

    if (ae) {
      const states = ["Dubai", "Abu Dhabi", "Sharjah"];
      for (const stateName of states) {
        let state = await prisma.state.findFirst({ where: { name: stateName, countryId: ae.id } });
        if (!state) {
          await prisma.state.create({
            data: {
              countryId: ae.id,
              name: stateName,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          });
        }
      }
    }

    return NextResponse.json({ success: true, message: "Geography data seeded successfully." });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
