const { Client } = require("pg");
require("dotenv").config();

async function main() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  await client.connect();
  console.log("Connected to Neon DB");

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
    const res = await client.query('SELECT id FROM countries WHERE "isoCode" = $1', [c.isoCode]);
    let countryId;
    if (res.rows.length === 0) {
      const id = require("crypto").randomUUID();
      await client.query(
        'INSERT INTO countries (id, name, "isoCode", "createdAt", "updatedAt") VALUES ($1, $2, $3, NOW(), NOW())',
        [id, c.name, c.isoCode]
      );
      countryId = id;
      console.log(`Created country: ${c.name}`);
    } else {
      countryId = res.rows[0].id;
    }
    createdCountries[c.isoCode] = countryId;
  }

  const indiaId = createdCountries["IN"];
  const aeId = createdCountries["AE"];

  if (indiaId) {
    const states = ["Maharashtra", "Delhi", "Karnataka", "Tamil Nadu", "Kerala", "Goa"];
    for (const stateName of states) {
      const res = await client.query('SELECT id FROM states WHERE name = $1 AND "countryId" = $2', [stateName, indiaId]);
      if (res.rows.length === 0) {
        const id = require("crypto").randomUUID();
        await client.query(
          'INSERT INTO states (id, "countryId", name, "createdAt", "updatedAt") VALUES ($1, $2, $3, NOW(), NOW())',
          [id, indiaId, stateName]
        );
        console.log(`Created state: ${stateName} (India)`);
      }
    }
  }

  if (aeId) {
    const states = ["Dubai", "Abu Dhabi", "Sharjah"];
    for (const stateName of states) {
      const res = await client.query('SELECT id FROM states WHERE name = $1 AND "countryId" = $2', [stateName, aeId]);
      if (res.rows.length === 0) {
        const id = require("crypto").randomUUID();
        await client.query(
          'INSERT INTO states (id, "countryId", name, "createdAt", "updatedAt") VALUES ($1, $2, $3, NOW(), NOW())',
          [id, aeId, stateName]
        );
        console.log(`Created state: ${stateName} (UAE)`);
      }
    }
  }

  console.log("Geography data seeded successfully via PG.");
  await client.end();
}

main().catch(console.error);
