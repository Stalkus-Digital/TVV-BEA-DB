/**
 * Content seed — hotels, packages, guides, ferry routes, flight routes.
 *
 *  Runs idempotently AFTER the destination/category seed (`seed.ts`). The
 *  two files are split because the destination tree is structural data
 *  (countries / regions don't change much) while content rows are demo
 *  fixtures that the team will replace with real CMS data.
 *
 *  Usage:
 *    npm run hierarchy:seed         # seeds destination tree + categories
 *    npm run hierarchy:seed-content # seeds hotels/packages/guides/etc.
 *
 *  Idempotency key per domain:
 *    hotels      → slug (globally unique)
 *    packages    → slug (globally unique)
 *    guides      → slug (globally unique)
 *    ferryRoutes → slug
 *    flightRoutes → slug
 *
 *  Join rows are wiped + reinserted for the touched packages — that
 *  preserves intent (e.g. "this package includes these two hotels") even
 *  if the developer renames or removes one of the children in this file.
 */

import { PrismaClient, DestinationStatus } from "../lib/hierarchy/generated";

const db = new PrismaClient();

async function destBySlug(slug: string) {
  const d = await db.destination.findFirst({
    where: { slug, level: "DESTINATION" },
    select: { id: true },
  });
  if (!d) throw new Error(`Destination "${slug}" not found — run hierarchy:seed first`);
  return d.id;
}

async function categoryBySlug(destinationId: bigint, slug: string) {
  const c = await db.destinationCategory.findUnique({
    where: { destinationId_slug: { destinationId, slug } },
    select: { id: true },
  });
  if (!c) throw new Error(`Category "${slug}" not found under destination ${destinationId}`);
  return c.id;
}

const PUBLISHED: DestinationStatus = "PUBLISHED";

// ─── HOTELS ─────────────────────────────────────────────────────────────────
async function seedHotels() {
  const andamanId = await destBySlug("andaman");
  const phuketId = await destBySlug("phuket");
  const dubaiId = await destBySlug("dubai");

  const hotels = [
    {
      destinationId: andamanId,
      name: "Taj Exotica Resort & Spa, Andamans",
      slug: "taj-exotica-andamans",
      starRating: 5,
      shortDescription: "Beachfront luxury villas on Havelock Island, with private plunge pools, scuba in-house, and a quiet stretch of Radhanagar to itself.",
      heroImageUrl: "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=2400&q=80",
      metaTitle: "Taj Exotica Andamans — Five-Star Beachfront Havelock Resort",
      metaDescription: "Plunge-pool villas on Havelock, in-house scuba, Radhanagar beach access. The marquee Andaman luxury stay.",
      isFeatured: true,
      sortOrder: 10,
    },
    {
      destinationId: andamanId,
      name: "Barefoot at Havelock",
      slug: "barefoot-at-havelock",
      starRating: 4,
      shortDescription: "Sustainable beachfront cottages tucked into the rainforest behind Radhanagar — quiet, characterful, and run by the people who pioneered Havelock as a destination.",
      heroImageUrl: "https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=2400&q=80",
      metaTitle: "Barefoot at Havelock — Sustainable Beachfront Cottages",
      metaDescription: "Hand-built cottages behind Radhanagar beach. Slow food, no plastic, original Havelock character.",
      sortOrder: 20,
    },
    {
      destinationId: phuketId,
      name: "Trisara Phuket",
      slug: "trisara-phuket",
      starRating: 5,
      shortDescription: "Sixty hillside villas on a private bay above Layan — the standard against which other Phuket luxury is measured.",
      heroImageUrl: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=2400&q=80",
      isFeatured: true,
      sortOrder: 10,
    },
    {
      destinationId: dubaiId,
      name: "Bulgari Resort Dubai",
      slug: "bulgari-resort-dubai",
      starRating: 5,
      shortDescription: "On its own island off Jumeirah, with the city skyline as a backdrop and one of the most discreet check-ins in town.",
      heroImageUrl: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=2400&q=80",
      isFeatured: true,
      sortOrder: 10,
    },
  ];

  for (const h of hotels) {
    await db.hotel.upsert({
      where: { slug: h.slug },
      create: { ...h, status: PUBLISHED, publishedAt: new Date() },
      update: { ...h, status: PUBLISHED, publishedAt: new Date() },
    });
    console.log(`  HOTEL        ${h.slug}`);
  }
}

// ─── GUIDES ─────────────────────────────────────────────────────────────────
async function seedGuides() {
  const andamanId = await destBySlug("andaman");
  const phuketId = await destBySlug("phuket");

  const guides = [
    {
      destinationId: andamanId,
      title: "Best Time to Visit the Andamans, Season by Season",
      slug: "andaman-best-time-to-visit",
      excerpt: "October through April for clear seas and steady diving; May–September for a green, half-empty island worth the rain.",
      readingMinutes: 8,
      heroImageUrl: "https://images.unsplash.com/photo-1559128010-7c1ad6e1b6a5?auto=format&fit=crop&w=2400&q=80",
      isFeatured: true,
      sortOrder: 10,
      metaTitle: "Andaman Travel Seasons — When to Go for Sea, Diving, Quiet",
      metaDescription: "A specialist's breakdown of Andaman's seasons: peak weather, monsoon trade-offs, and the quiet middle months.",
    },
    {
      destinationId: andamanId,
      title: "Andaman Ferry Booking — Operator Comparison",
      slug: "andaman-ferry-booking-guide",
      excerpt: "MakRuzz vs Nautika vs Green Ocean — schedules, comfort, reliability, and how to lock seats without paying inflated agent fees.",
      readingMinutes: 6,
      sortOrder: 20,
      metaTitle: "Andaman Ferry Operators Compared — MakRuzz, Nautika, Green Ocean",
      metaDescription: "Independent comparison of the three Andaman inter-island ferry operators. Routes, prices, booking windows.",
    },
    {
      destinationId: phuketId,
      title: "Phuket's West Coast — Beach by Beach",
      slug: "phuket-west-coast-beaches",
      excerpt: "Surin, Kamala, Bang Tao, Layan — the quiet northern strip versus Patong's noise, and which fits your trip.",
      readingMinutes: 7,
      sortOrder: 10,
    },
  ];

  for (const g of guides) {
    await db.guide.upsert({
      where: { slug: g.slug },
      create: { ...g, status: PUBLISHED, publishedAt: new Date() },
      update: { ...g, status: PUBLISHED, publishedAt: new Date() },
    });
    console.log(`  GUIDE        ${g.slug}`);
  }
}

// ─── FERRY ROUTES ──────────────────────────────────────────────────────────
async function seedFerryRoutes() {
  const andamanId = await destBySlug("andaman");

  const routes = [
    {
      destinationId: andamanId,
      name: "Port Blair ⇄ Havelock (MakRuzz)",
      slug: "port-blair-havelock-makruzz",
      originName: "Port Blair",
      destinationName: "Havelock",
      operatorName: "MakRuzz",
      durationMinutes: 90,
      startingPrice: 1150,
      isFeatured: true,
      sortOrder: 10,
    },
    {
      destinationId: andamanId,
      name: "Port Blair ⇄ Neil Island (Nautika)",
      slug: "port-blair-neil-nautika",
      originName: "Port Blair",
      destinationName: "Neil Island",
      operatorName: "Nautika",
      durationMinutes: 120,
      startingPrice: 1100,
      sortOrder: 20,
    },
  ];

  for (const r of routes) {
    await db.ferryRoute.upsert({
      where: { slug: r.slug },
      create: { ...r, status: PUBLISHED },
      update: { ...r, status: PUBLISHED },
    });
    console.log(`  FERRY        ${r.slug}`);
  }
}

// ─── FLIGHT ROUTES ─────────────────────────────────────────────────────────
async function seedFlightRoutes() {
  const andamanId = await destBySlug("andaman");
  const dubaiId = await destBySlug("dubai");

  const routes = [
    {
      destinationId: andamanId,
      name: "Delhi → Port Blair",
      slug: "delhi-port-blair",
      originIATA: "DEL",
      destIATA: "IXZ",
      originCity: "Delhi",
      destCity: "Port Blair",
      approxDurationMinutes: 320,
      startingPrice: 7500,
      isFeatured: true,
      sortOrder: 10,
    },
    {
      destinationId: andamanId,
      name: "Mumbai → Port Blair",
      slug: "mumbai-port-blair",
      originIATA: "BOM",
      destIATA: "IXZ",
      originCity: "Mumbai",
      destCity: "Port Blair",
      approxDurationMinutes: 295,
      startingPrice: 6800,
      sortOrder: 20,
    },
    {
      destinationId: dubaiId,
      name: "Mumbai → Dubai",
      slug: "mumbai-dubai",
      originIATA: "BOM",
      destIATA: "DXB",
      originCity: "Mumbai",
      destCity: "Dubai",
      approxDurationMinutes: 195,
      startingPrice: 12500,
      isFeatured: true,
      sortOrder: 10,
    },
  ];

  for (const r of routes) {
    await db.flightRoute.upsert({
      where: { slug: r.slug },
      create: { ...r, status: PUBLISHED },
      update: { ...r, status: PUBLISHED },
    });
    console.log(`  FLIGHT       ${r.slug}`);
  }
}

// ─── PACKAGES ─────────────────────────────────────────────────────────────
// Packages span destinations + hotels + categories. We upsert the package
// itself, then nuke + recreate its join rows so any reordering or removal
// here is faithfully reflected after a re-seed.
async function seedPackages() {
  const andamanId = await destBySlug("andaman");
  const phuketId = await destBySlug("phuket");
  const dubaiId = await destBySlug("dubai");

  const andamanHoneymoonCatId = await categoryBySlug(andamanId, "honeymoon-packages");
  const andamanScubaCatId = await categoryBySlug(andamanId, "scuba-diving");
  const phuketLuxuryCatId = await categoryBySlug(phuketId, "luxury-hotels");
  const dubaiLuxuryCatId = await categoryBySlug(dubaiId, "luxury-hotels");

  const tajExoticaId = (await db.hotel.findUnique({ where: { slug: "taj-exotica-andamans" }, select: { id: true } }))!.id;
  const barefootId = (await db.hotel.findUnique({ where: { slug: "barefoot-at-havelock" }, select: { id: true } }))!.id;
  const trisaraId = (await db.hotel.findUnique({ where: { slug: "trisara-phuket" }, select: { id: true } }))!.id;
  const bulgariId = (await db.hotel.findUnique({ where: { slug: "bulgari-resort-dubai" }, select: { id: true } }))!.id;

  const packages = [
    {
      pkg: {
        title: "Romantic Andaman Escape — 5N Havelock",
        slug: "romantic-andaman-escape-5n",
        shortDescription: "Five quiet nights split between a beachfront villa at Taj Exotica and a sustainable cottage at Barefoot — scuba optional, sunsets non-negotiable.",
        durationDays: 6,
        durationNights: 5,
        startingPrice: 145000,
        heroImageUrl: "https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=2400&q=80",
        metaTitle: "Romantic Andaman Escape — 5 Nights, Havelock Honeymoon Package",
        metaDescription: "Hand-curated honeymoon: 3N Taj Exotica + 2N Barefoot, private boat sunset, in-house scuba. From ₹1.45L.",
        isFeatured: true,
        sortOrder: 10,
      },
      destinations: [
        { destinationId: andamanId, isPrimary: true, sortOrder: 10, nights: 5 },
      ],
      hotels: [
        { hotelId: tajExoticaId, nights: 3, sortOrder: 10 },
        { hotelId: barefootId, nights: 2, sortOrder: 20 },
      ],
      categories: [andamanHoneymoonCatId],
    },
    {
      pkg: {
        title: "Andaman Dive Trip — 7N PADI Open Water + Advanced",
        slug: "andaman-dive-trip-7n",
        shortDescription: "Seven days of certified diving from Havelock, plus a wreck-trip day to North Bay — for divers building serious hours.",
        durationDays: 8,
        durationNights: 7,
        startingPrice: 125000,
        sortOrder: 20,
      },
      destinations: [
        { destinationId: andamanId, isPrimary: true, sortOrder: 10, nights: 7 },
      ],
      hotels: [{ hotelId: barefootId, nights: 7, sortOrder: 10 }],
      categories: [andamanScubaCatId],
    },
    {
      pkg: {
        title: "Phuket Quiet Coast — 4N Trisara",
        slug: "phuket-quiet-coast-4n",
        shortDescription: "Four nights at Trisara above Layan Bay — private villa, butler, and zero reason to leave except for an island-hop day.",
        durationDays: 5,
        durationNights: 4,
        startingPrice: 220000,
        isFeatured: true,
        sortOrder: 10,
      },
      destinations: [
        { destinationId: phuketId, isPrimary: true, sortOrder: 10, nights: 4 },
      ],
      hotels: [{ hotelId: trisaraId, nights: 4, sortOrder: 10 }],
      categories: [phuketLuxuryCatId],
    },
    {
      pkg: {
        title: "Dubai + Andamans — Two-Country Luxury Combo",
        slug: "dubai-andamans-luxury-combo",
        shortDescription: "Three nights at Bulgari Dubai followed by four nights at Taj Exotica Havelock — desert design into reef quiet.",
        durationDays: 8,
        durationNights: 7,
        startingPrice: 385000,
        isFeatured: true,
        sortOrder: 30,
      },
      destinations: [
        { destinationId: dubaiId, isPrimary: true, sortOrder: 10, nights: 3 },
        { destinationId: andamanId, sortOrder: 20, nights: 4 },
      ],
      hotels: [
        { hotelId: bulgariId, nights: 3, sortOrder: 10 },
        { hotelId: tajExoticaId, nights: 4, sortOrder: 20 },
      ],
      categories: [dubaiLuxuryCatId, andamanHoneymoonCatId],
    },
  ];

  for (const entry of packages) {
    const upserted = await db.package.upsert({
      where: { slug: entry.pkg.slug },
      create: { ...entry.pkg, status: PUBLISHED, publishedAt: new Date() },
      update: { ...entry.pkg, status: PUBLISHED, publishedAt: new Date() },
    });

    // Nuke + recreate join rows. Cheaper than diff-detecting at seed time
    // and faithfully reflects deletions in this file.
    await db.packageDestination.deleteMany({ where: { packageId: upserted.id } });
    await db.packageHotel.deleteMany({ where: { packageId: upserted.id } });
    await db.packageCategory.deleteMany({ where: { packageId: upserted.id } });

    await db.packageDestination.createMany({
      data: entry.destinations.map((d) => ({ ...d, packageId: upserted.id })),
    });
    await db.packageHotel.createMany({
      data: entry.hotels.map((h) => ({ ...h, packageId: upserted.id })),
    });
    await db.packageCategory.createMany({
      data: entry.categories.map((catId, i) => ({ packageId: upserted.id, categoryId: catId, sortOrder: i * 10 })),
    });

    console.log(`  PACKAGE      ${entry.pkg.slug}  →  ${entry.destinations.length} dests, ${entry.hotels.length} hotels, ${entry.categories.length} cats`);
  }
}

async function main() {
  console.log("Seeding content domains →");
  await seedHotels();
  await seedGuides();
  await seedFerryRoutes();
  await seedFlightRoutes();
  await seedPackages();
  console.log("Done.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
