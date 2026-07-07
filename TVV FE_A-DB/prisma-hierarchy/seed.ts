/**
 * Initial seed — the canonical regions, India, and Andaman.
 *
 *  This is the minimal data the platform needs to render the hierarchy
 *  routes today. Everything else (other countries, sub-destinations) gets
 *  added through the admin UI or through targeted ETL from the legacy
 *  MongoDB Location table.
 *
 *  Idempotent: re-running this script does NOT duplicate rows. It uses
 *  the (parent_id, slug) uniqueness as its dedup key. Safe to run on every
 *  deploy as a smoke test.
 */

import { PrismaClient, DestinationLevel, DestinationStatus } from "../lib/hierarchy/generated";

const db = new PrismaClient();

interface SeedNode {
  name: string;
  slug: string;
  level: DestinationLevel;
  metaTitle?: string;
  metaDescription?: string;
  imageUrl?: string;
  heroImageUrl?: string;
  sortOrder?: number;
  isFeatured?: boolean;
  children?: SeedNode[];
  /**
   * Categories attached to this destination. Only valid when level is
   * DESTINATION. Each entry becomes a `destination_categories` row whose
   * (destination_id, slug) is the natural key.
   */
  categories?: SeedCategory[];
}

interface SeedCategory {
  name: string;
  slug: string;
  description?: string;
  metaTitle?: string;
  metaDescription?: string;
  heroImageUrl?: string;
  sortOrder?: number;
  isFeatured?: boolean;
}

// ─── Tree definition ─────────────────────────────────────────────────────────
// IMPORTANT: Andaman lives strictly under India under Asia & Pacific.
// This is a business rule, not a geographical claim — it drives navigation,
// logistics, breadcrumbs, and SEO URLs across the entire platform.

const TREE: SeedNode[] = [
  {
    name: "Asia & Pacific",
    slug: "asia-pacific",
    level: "REGION",
    sortOrder: 10,
    isFeatured: true,
    metaTitle: "Asia & Pacific Travel — Curated Editorial Journeys",
    metaDescription: "From the Andamans to Bali, Japan to the Maldives — TVV-curated journeys across the Asia & Pacific region.",
    heroImageUrl: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=2400&q=80",
    children: [
      {
        name: "India",
        slug: "india",
        level: "COUNTRY",
        sortOrder: 10,
        isFeatured: true,
        metaTitle: "India Travel — Editorial Journeys, Authority Routes",
        metaDescription: "Andaman, Kerala, Rajasthan, the Himalayas — slow-travel India routes designed by the TVV editorial desk.",
        heroImageUrl: "https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=2400&q=80",
        children: [
          {
            name: "Andaman",
            slug: "andaman",
            level: "DESTINATION",
            sortOrder: 10,
            isFeatured: true,
            metaTitle: "Andaman Islands Travel Guide — TVV",
            metaDescription: "Specialist-curated Andaman itineraries: Havelock, Neil, Port Blair. Scuba, ferries, honeymoon routes.",
            heroImageUrl: "https://images.unsplash.com/photo-1559128010-7c1ad6e1b6a5?auto=format&fit=crop&w=2400&q=80",
            categories: [
              {
                name: "Honeymoon Packages",
                slug: "honeymoon-packages",
                sortOrder: 10,
                isFeatured: true,
                metaTitle: "Andaman Honeymoon Packages — Curated Couples' Itineraries",
                metaDescription: "Hand-picked Andaman honeymoon routes: Havelock seaplanes, Neil beach villas, private boat sunsets.",
              },
              {
                name: "Ferry Booking",
                slug: "ferry-booking",
                sortOrder: 20,
                metaTitle: "Andaman Ferry Booking — MakRuzz, Nautika, Green Ocean",
                metaDescription: "Live ferry availability between Port Blair, Havelock and Neil. Compare operators, lock seats in one place.",
              },
              {
                name: "Scuba Diving",
                slug: "scuba-diving",
                sortOrder: 30,
                metaTitle: "Andaman Scuba Diving — Havelock, Neil, North Bay",
                metaDescription: "PADI-certified Andaman dive operators, beginner-to-advanced trips, wreck and reef itineraries.",
              },
            ],
          },
          {
            name: "Goa",
            slug: "goa",
            level: "DESTINATION",
            sortOrder: 20,
            metaTitle: "Goa Travel Guide — Beaches, Old Quarter, Backwaters",
            metaDescription: "TVV's slow-Goa itineraries: north coast luxury, south Goa quiet, Fontainhas heritage.",
            heroImageUrl: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=2400&q=80",
            categories: [
              {
                name: "Honeymoon Packages",
                slug: "honeymoon-packages",
                sortOrder: 10,
                isFeatured: true,
                metaTitle: "Goa Honeymoon Packages — Beach Resorts & Private Villas",
                metaDescription: "Curated Goa honeymoon routes: cliffside suites, sunset cruises, north-and-south combinations.",
              },
              {
                name: "Adventure Tours",
                slug: "adventure-tours",
                sortOrder: 20,
                metaTitle: "Goa Adventure Tours — Watersports, Treks, Wildlife",
                metaDescription: "From Dudhsagar trekking to Mandovi parasailing — Goa adventure itineraries the resorts won't sell you.",
              },
            ],
          },
        ],
      },
      {
        name: "Thailand",
        slug: "thailand",
        level: "COUNTRY",
        sortOrder: 20,
        isFeatured: true,
        metaTitle: "Thailand Travel — Editorial Journeys, Curated Routes",
        metaDescription: "Bangkok, Chiang Mai, the southern islands — TVV-designed Thailand itineraries.",
        heroImageUrl: "https://images.unsplash.com/photo-1528181304800-259b08848526?auto=format&fit=crop&w=2400&q=80",
        children: [
          {
            name: "Phuket",
            slug: "phuket",
            level: "DESTINATION",
            sortOrder: 10,
            isFeatured: true,
            metaTitle: "Phuket Travel Guide — Beaches, Resorts, Island-Hopping",
            metaDescription: "Phuket beyond Patong — Surin coves, Phang Nga bay day-trips, luxury Kamala stays.",
            heroImageUrl: "https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?auto=format&fit=crop&w=2400&q=80",
            categories: [
              {
                name: "Luxury Hotels",
                slug: "luxury-hotels",
                sortOrder: 10,
                isFeatured: true,
                metaTitle: "Phuket Luxury Hotels — Five-Star Resorts on the West Coast",
                metaDescription: "Hand-picked Phuket five-star resorts: Surin, Kamala, Mai Khao. Beach access, butler service, sunset bars.",
              },
              {
                name: "Adventure Tours",
                slug: "adventure-tours",
                sortOrder: 20,
                metaTitle: "Phuket Adventure Tours — Island-Hopping, Kayaking, Diving",
                metaDescription: "Phi Phi day trips, James Bond island, Khao Sok rainforest — Phuket adventure routes by TVV.",
              },
            ],
          },
        ],
      },
    ],
  },
  {
    name: "Europe",
    slug: "europe",
    level: "REGION",
    sortOrder: 20,
    metaTitle: "Europe Travel — Curated Multi-City Itineraries",
    metaDescription: "Italy, France, Switzerland, Greece — TVV editorial routes through Europe.",
    heroImageUrl: "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=2400&q=80",
  },
  {
    name: "Middle East",
    slug: "middle-east",
    level: "REGION",
    sortOrder: 30,
    metaTitle: "Middle East Travel — Curated Editorial Journeys",
    metaDescription: "UAE, Jordan, Oman — desert escapes, ancient cities, luxury Gulf stays.",
    heroImageUrl: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=2400&q=80",
    children: [
      {
        name: "UAE",
        slug: "uae",
        level: "COUNTRY",
        sortOrder: 10,
        isFeatured: true,
        metaTitle: "UAE Travel — Dubai, Abu Dhabi, Editorial Routes",
        metaDescription: "Beyond the brochure: Dubai design, Abu Dhabi heritage, Hatta and the eastern coast.",
        heroImageUrl: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=2400&q=80",
        children: [
          {
            name: "Dubai",
            slug: "dubai",
            level: "DESTINATION",
            sortOrder: 10,
            isFeatured: true,
            metaTitle: "Dubai Travel Guide — Desert, Coast, Old Quarter",
            metaDescription: "Curated Dubai routes: Al Fahidi heritage, desert nights, Palm Jumeirah stays, day-trips to Hatta.",
            heroImageUrl: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=2400&q=80",
            categories: [
              {
                name: "Luxury Hotels",
                slug: "luxury-hotels",
                sortOrder: 10,
                isFeatured: true,
                metaTitle: "Dubai Luxury Hotels — Five-Star Resorts on the Palm & Marina",
                metaDescription: "Atlantis, One&Only, Bulgari — curated Dubai luxury stays with the views and service that earn the rate.",
              },
              {
                name: "Adventure Tours",
                slug: "adventure-tours",
                sortOrder: 20,
                metaTitle: "Dubai Adventure Tours — Desert Safari, Dune Bashing, Hatta",
                metaDescription: "Sunset desert safari, falcon flights, Hatta kayaking — Dubai adventure routes beyond the mall.",
              },
            ],
          },
        ],
      },
    ],
  },
];

// ─── Idempotent upsert ───────────────────────────────────────────────────────
// Strategy: lookup by (parentId, slug) — the natural key for siblings. If
// exists, update CMS fields; otherwise create. Children recurse with the
// freshly resolved parent id.
//
// We avoid `prisma.$transaction` here on purpose: each row's trigger needs
// the parent's slug_path to already be committed when the child inserts.
// One-by-one writes keep the trigger chain coherent.

async function upsertNode(node: SeedNode, parentId: bigint | null, depth: number) {
  const existing = await db.destination.findFirst({
    where: { parentId, slug: node.slug },
    select: { id: true },
  });

  // NOTE: slugPath is required by the Prisma client (string, non-nullable),
  // but the DB trigger overwrites whatever we pass with `<parent_path>/<slug>`.
  // So we send a placeholder "" and let the trigger compute the real value
  // on INSERT. This keeps slug_path generation server-side (the source of
  // truth) and lets us never construct paths in app code.
  const data = {
    name: node.name,
    slug: node.slug,
    slugPath: "",
    level: node.level,
    depth,
    parentId,
    metaTitle: node.metaTitle ?? null,
    metaDescription: node.metaDescription ?? null,
    imageUrl: node.imageUrl ?? null,
    heroImageUrl: node.heroImageUrl ?? null,
    sortOrder: node.sortOrder ?? 0,
    isFeatured: node.isFeatured ?? false,
    status: "PUBLISHED" as DestinationStatus,
    publishedAt: new Date(),
  };

  const row = existing
    ? await db.destination.update({ where: { id: existing.id }, data })
    : await db.destination.create({ data });

  console.log(`  ${"  ".repeat(depth)}${node.level.padEnd(15)} ${row.slugPath}`);

  // Categories: only meaningful at DESTINATION level (the third URL segment
  // attaches to a destination, not to a country or region). The DB trigger
  // enforces this at write time too.
  if (node.categories && node.level === "DESTINATION") {
    for (const category of node.categories) {
      await upsertCategory(category, row.id, depth + 1);
    }
  }

  for (const child of node.children ?? []) {
    await upsertNode(child, row.id, depth + 1);
  }
}

async function upsertCategory(
  category: SeedCategory,
  destinationId: bigint,
  printDepth: number,
) {
  const existing = await db.destinationCategory.findUnique({
    where: { destinationId_slug: { destinationId, slug: category.slug } },
    select: { id: true },
  });

  const data = {
    destinationId,
    name: category.name,
    slug: category.slug,
    description: category.description ?? null,
    metaTitle: category.metaTitle ?? null,
    metaDescription: category.metaDescription ?? null,
    heroImageUrl: category.heroImageUrl ?? null,
    sortOrder: category.sortOrder ?? 0,
    isFeatured: category.isFeatured ?? false,
    status: "PUBLISHED" as DestinationStatus,
    publishedAt: new Date(),
  };

  const row = existing
    ? await db.destinationCategory.update({ where: { id: existing.id }, data })
    : await db.destinationCategory.create({ data });

  console.log(`  ${"  ".repeat(printDepth)}${"CATEGORY".padEnd(15)} ${category.slug} (dest=${destinationId})`);
  return row;
}

async function main() {
  console.log("Seeding destination hierarchy →");
  for (const root of TREE) {
    await upsertNode(root, null, 0);
  }
  console.log("Done.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
