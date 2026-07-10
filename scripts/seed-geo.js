const { PrismaClient } = require("../src/generated/prisma/client");

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding basic geography data...");

  // Seed Countries
  const countries = [
    { name: "India", isoCode: "IN" },
    { name: "United Arab Emirates", isoCode: "AE" },
    { name: "United States", isoCode: "US" },
    { name: "United Kingdom", isoCode: "GB" },
    { name: "Thailand", isoCode: "TH" },
    { name: "Singapore", isoCode: "SG" },
  ];

  const createdCountries = {};

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
      console.log(`Created country: ${c.name}`);
    }
    createdCountries[c.isoCode] = country;
  }

  // Seed States for India
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
        console.log(`Created state: ${stateName} (India)`);
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
        console.log(`Created state: ${stateName} (UAE)`);
      }
    }
  }

  console.log("Geography data seeded successfully.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
