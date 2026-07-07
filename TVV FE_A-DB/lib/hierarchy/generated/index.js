
Object.defineProperty(exports, "__esModule", { value: true });

const {
  PrismaClientKnownRequestError,
  PrismaClientUnknownRequestError,
  PrismaClientRustPanicError,
  PrismaClientInitializationError,
  PrismaClientValidationError,
  NotFoundError,
  getPrismaClient,
  sqltag,
  empty,
  join,
  raw,
  skip,
  Decimal,
  Debug,
  objectEnumValues,
  makeStrictEnum,
  Extensions,
  warnOnce,
  defineDmmfProperty,
  Public,
  getRuntime
} = require('./runtime/library.js')


const Prisma = {}

exports.Prisma = Prisma
exports.$Enums = {}

/**
 * Prisma Client JS version: 5.22.0
 * Query Engine version: 605197351a3c8bdd595af2d2a9bc3025bca48ea2
 */
Prisma.prismaVersion = {
  client: "5.22.0",
  engine: "605197351a3c8bdd595af2d2a9bc3025bca48ea2"
}

Prisma.PrismaClientKnownRequestError = PrismaClientKnownRequestError;
Prisma.PrismaClientUnknownRequestError = PrismaClientUnknownRequestError
Prisma.PrismaClientRustPanicError = PrismaClientRustPanicError
Prisma.PrismaClientInitializationError = PrismaClientInitializationError
Prisma.PrismaClientValidationError = PrismaClientValidationError
Prisma.NotFoundError = NotFoundError
Prisma.Decimal = Decimal

/**
 * Re-export of sql-template-tag
 */
Prisma.sql = sqltag
Prisma.empty = empty
Prisma.join = join
Prisma.raw = raw
Prisma.validator = Public.validator

/**
* Extensions
*/
Prisma.getExtensionContext = Extensions.getExtensionContext
Prisma.defineExtension = Extensions.defineExtension

/**
 * Shorthand utilities for JSON filtering
 */
Prisma.DbNull = objectEnumValues.instances.DbNull
Prisma.JsonNull = objectEnumValues.instances.JsonNull
Prisma.AnyNull = objectEnumValues.instances.AnyNull

Prisma.NullTypes = {
  DbNull: objectEnumValues.classes.DbNull,
  JsonNull: objectEnumValues.classes.JsonNull,
  AnyNull: objectEnumValues.classes.AnyNull
}




  const path = require('path')

/**
 * Enums
 */
exports.Prisma.TransactionIsolationLevel = makeStrictEnum({
  ReadUncommitted: 'ReadUncommitted',
  ReadCommitted: 'ReadCommitted',
  RepeatableRead: 'RepeatableRead',
  Serializable: 'Serializable'
});

exports.Prisma.DestinationScalarFieldEnum = {
  id: 'id',
  parentId: 'parentId',
  name: 'name',
  slug: 'slug',
  slugPath: 'slugPath',
  level: 'level',
  depth: 'depth',
  metaTitle: 'metaTitle',
  metaDescription: 'metaDescription',
  seoContent: 'seoContent',
  imageUrl: 'imageUrl',
  heroImageUrl: 'heroImageUrl',
  gallery: 'gallery',
  sortOrder: 'sortOrder',
  status: 'status',
  isFeatured: 'isFeatured',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  publishedAt: 'publishedAt'
};

exports.Prisma.DestinationTranslationScalarFieldEnum = {
  destinationId: 'destinationId',
  locale: 'locale',
  name: 'name',
  slug: 'slug',
  metaTitle: 'metaTitle',
  metaDescription: 'metaDescription',
  seoContent: 'seoContent'
};

exports.Prisma.DestinationCategoryScalarFieldEnum = {
  id: 'id',
  destinationId: 'destinationId',
  name: 'name',
  slug: 'slug',
  description: 'description',
  metaTitle: 'metaTitle',
  metaDescription: 'metaDescription',
  seoContent: 'seoContent',
  heroImageUrl: 'heroImageUrl',
  sortOrder: 'sortOrder',
  status: 'status',
  isFeatured: 'isFeatured',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  publishedAt: 'publishedAt'
};

exports.Prisma.HotelScalarFieldEnum = {
  id: 'id',
  destinationId: 'destinationId',
  name: 'name',
  slug: 'slug',
  starRating: 'starRating',
  shortDescription: 'shortDescription',
  heroImageUrl: 'heroImageUrl',
  gallery: 'gallery',
  metaTitle: 'metaTitle',
  metaDescription: 'metaDescription',
  seoContent: 'seoContent',
  status: 'status',
  isFeatured: 'isFeatured',
  sortOrder: 'sortOrder',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  publishedAt: 'publishedAt'
};

exports.Prisma.PackageScalarFieldEnum = {
  id: 'id',
  title: 'title',
  slug: 'slug',
  shortDescription: 'shortDescription',
  durationDays: 'durationDays',
  durationNights: 'durationNights',
  startingPrice: 'startingPrice',
  currency: 'currency',
  heroImageUrl: 'heroImageUrl',
  gallery: 'gallery',
  metaTitle: 'metaTitle',
  metaDescription: 'metaDescription',
  seoContent: 'seoContent',
  status: 'status',
  isFeatured: 'isFeatured',
  sortOrder: 'sortOrder',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  publishedAt: 'publishedAt'
};

exports.Prisma.PackageDestinationScalarFieldEnum = {
  packageId: 'packageId',
  destinationId: 'destinationId',
  isPrimary: 'isPrimary',
  sortOrder: 'sortOrder',
  nights: 'nights'
};

exports.Prisma.PackageHotelScalarFieldEnum = {
  packageId: 'packageId',
  hotelId: 'hotelId',
  nights: 'nights',
  sortOrder: 'sortOrder'
};

exports.Prisma.PackageCategoryScalarFieldEnum = {
  packageId: 'packageId',
  categoryId: 'categoryId',
  sortOrder: 'sortOrder'
};

exports.Prisma.GuideScalarFieldEnum = {
  id: 'id',
  destinationId: 'destinationId',
  title: 'title',
  slug: 'slug',
  excerpt: 'excerpt',
  body: 'body',
  readingMinutes: 'readingMinutes',
  heroImageUrl: 'heroImageUrl',
  metaTitle: 'metaTitle',
  metaDescription: 'metaDescription',
  status: 'status',
  isFeatured: 'isFeatured',
  sortOrder: 'sortOrder',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  publishedAt: 'publishedAt'
};

exports.Prisma.FerryRouteScalarFieldEnum = {
  id: 'id',
  destinationId: 'destinationId',
  name: 'name',
  slug: 'slug',
  originName: 'originName',
  destinationName: 'destinationName',
  operatorName: 'operatorName',
  durationMinutes: 'durationMinutes',
  startingPrice: 'startingPrice',
  currency: 'currency',
  metaTitle: 'metaTitle',
  metaDescription: 'metaDescription',
  status: 'status',
  isFeatured: 'isFeatured',
  sortOrder: 'sortOrder',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.FlightRouteScalarFieldEnum = {
  id: 'id',
  destinationId: 'destinationId',
  name: 'name',
  slug: 'slug',
  originIATA: 'originIATA',
  destIATA: 'destIATA',
  originCity: 'originCity',
  destCity: 'destCity',
  approxDurationMinutes: 'approxDurationMinutes',
  startingPrice: 'startingPrice',
  currency: 'currency',
  metaTitle: 'metaTitle',
  metaDescription: 'metaDescription',
  status: 'status',
  isFeatured: 'isFeatured',
  sortOrder: 'sortOrder',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.SlugHistoryScalarFieldEnum = {
  id: 'id',
  entityType: 'entityType',
  entityId: 'entityId',
  locale: 'locale',
  oldSlug: 'oldSlug',
  oldFullPath: 'oldFullPath',
  newFullPath: 'newFullPath',
  changedAt: 'changedAt',
  changedByUser: 'changedByUser',
  reason: 'reason'
};

exports.Prisma.RedirectScalarFieldEnum = {
  id: 'id',
  fromPath: 'fromPath',
  toPath: 'toPath',
  statusCode: 'statusCode',
  locale: 'locale',
  source: 'source',
  reason: 'reason',
  isActive: 'isActive',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.SortOrder = {
  asc: 'asc',
  desc: 'desc'
};

exports.Prisma.QueryMode = {
  default: 'default',
  insensitive: 'insensitive'
};

exports.Prisma.NullsOrder = {
  first: 'first',
  last: 'last'
};
exports.DestinationLevel = exports.$Enums.DestinationLevel = {
  REGION: 'REGION',
  COUNTRY: 'COUNTRY',
  DESTINATION: 'DESTINATION',
  SUB_DESTINATION: 'SUB_DESTINATION'
};

exports.DestinationStatus = exports.$Enums.DestinationStatus = {
  DRAFT: 'DRAFT',
  PUBLISHED: 'PUBLISHED',
  ARCHIVED: 'ARCHIVED'
};

exports.SluggableEntity = exports.$Enums.SluggableEntity = {
  DESTINATION: 'DESTINATION',
  DESTINATION_CATEGORY: 'DESTINATION_CATEGORY',
  HOTEL: 'HOTEL',
  PACKAGE: 'PACKAGE',
  GUIDE: 'GUIDE',
  FERRY_ROUTE: 'FERRY_ROUTE',
  FLIGHT_ROUTE: 'FLIGHT_ROUTE'
};

exports.RedirectSource = exports.$Enums.RedirectSource = {
  MANUAL: 'MANUAL',
  SLUG_HISTORY: 'SLUG_HISTORY',
  IMPORT: 'IMPORT'
};

exports.Prisma.ModelName = {
  Destination: 'Destination',
  DestinationTranslation: 'DestinationTranslation',
  DestinationCategory: 'DestinationCategory',
  Hotel: 'Hotel',
  Package: 'Package',
  PackageDestination: 'PackageDestination',
  PackageHotel: 'PackageHotel',
  PackageCategory: 'PackageCategory',
  Guide: 'Guide',
  FerryRoute: 'FerryRoute',
  FlightRoute: 'FlightRoute',
  SlugHistory: 'SlugHistory',
  Redirect: 'Redirect'
};
/**
 * Create the Client
 */
const config = {
  "generator": {
    "name": "client",
    "provider": {
      "fromEnvVar": null,
      "value": "prisma-client-js"
    },
    "output": {
      "value": "/Users/rahulnair/Desktop/TVV BE:A-DB/TVV FE:A-DB/lib/hierarchy/generated",
      "fromEnvVar": null
    },
    "config": {
      "engineType": "library"
    },
    "binaryTargets": [
      {
        "fromEnvVar": null,
        "value": "darwin-arm64",
        "native": true
      },
      {
        "fromEnvVar": null,
        "value": "rhel-openssl-3.0.x"
      }
    ],
    "previewFeatures": [],
    "sourceFilePath": "/Users/rahulnair/Desktop/TVV BE:A-DB/TVV FE:A-DB/prisma-hierarchy/schema.prisma",
    "isCustomOutput": true
  },
  "relativeEnvPaths": {
    "rootEnvPath": null
  },
  "relativePath": "../../../prisma-hierarchy",
  "clientVersion": "5.22.0",
  "engineVersion": "605197351a3c8bdd595af2d2a9bc3025bca48ea2",
  "datasourceNames": [
    "db"
  ],
  "activeProvider": "postgresql",
  "postinstall": false,
  "inlineDatasources": {
    "db": {
      "url": {
        "fromEnvVar": "HIERARCHY_DATABASE_URL",
        "value": null
      }
    }
  },
  "inlineSchema": "// Destination Hierarchy — Prisma Schema (PostgreSQL)\n//\n// WHY THIS LIVES IN ITS OWN PRISMA PROJECT\n// ----------------------------------------\n// The existing API at `Tvv bE/vacation-voice-source-main/apps/api` uses\n// Prisma with a MongoDB datasource (legacy `Location` model + everything\n// else). Prisma allows only one provider per generator/datasource pair,\n// so we cannot bolt Postgres onto that project — we'd have to migrate\n// the entire store at once, which is exactly what the team decided NOT to do.\n//\n// This directory is a second, isolated Prisma project:\n//\n//   Mongo (legacy)        Postgres (this)\n//   apps/api/prisma   ←   tvv 2/prisma-hierarchy\n//   ↓                     ↓\n//   @prisma/client        ./generated (next to the only code that uses it)\n//\n// Two clients, two generators, no collision.\n//\n// EVERY DOWNSTREAM DOMAIN (packages, hotels, activities, ferries, flights)\n// will eventually FK its `destinationId` into this `destinations` table.\n// That's the whole point: one canonical hierarchy of geography, with\n// every product hung off it.\n\ngenerator client {\n  provider      = \"prisma-client-js\"\n  output        = \"../lib/hierarchy/generated\"\n  binaryTargets = [\"native\", \"rhel-openssl-3.0.x\"]\n}\n\ndatasource db {\n  provider = \"postgresql\"\n  url      = env(\"HIERARCHY_DATABASE_URL\")\n}\n\n// Geographical level. Strict 0-3 ordering enforced by `depth` + CHECK\n// constraint in the migration. New levels (e.g. CITY) only need an enum\n// entry and a CHECK update — no schema-shape change.\nenum DestinationLevel {\n  REGION\n  COUNTRY\n  DESTINATION\n  SUB_DESTINATION\n}\n\n// Editorial state. Drafts are invisible to the public reader; archived rows\n// remain in the DB (preserving FK referential integrity) but vanish from the tree.\nenum DestinationStatus {\n  DRAFT\n  PUBLISHED\n  ARCHIVED\n}\n\n// Destination — the core hierarchical model.\n//\n// Strategy: adjacency list (`parentId`) + materialised path (`slugPath`).\n//\n//   parentId  — FK referential integrity, easy \"find children\" queries\n//   slugPath  — denormalised \"asia-pacific/india/andaman\", UNIQUE-indexed\n//               so a single URL lookup = one btree seek\n//   depth     — 0..3, denormalised so range filters don't touch the enum\n//\n// Why both? Adjacency alone needs a recursive CTE on every public read.\n// The path turns every SEO lookup into O(log n). The cost is a write-time\n// cascade when a parent is renamed — handled by a Postgres trigger.\nmodel Destination {\n  id BigInt @id @default(autoincrement())\n\n  parentId BigInt?       @map(\"parent_id\")\n  parent   Destination?  @relation(\"DestinationTree\", fields: [parentId], references: [id], onDelete: Restrict)\n  children Destination[] @relation(\"DestinationTree\")\n\n  name     String\n  slug     String\n  slugPath String           @unique @map(\"slug_path\")\n  level    DestinationLevel\n  depth    Int\n\n  metaTitle       String?  @map(\"meta_title\")\n  metaDescription String?  @map(\"meta_description\")\n  seoContent      String?  @map(\"seo_content\")\n  imageUrl        String?  @map(\"image_url\")\n  heroImageUrl    String?  @map(\"hero_image_url\")\n  gallery         String[] @default([])\n\n  sortOrder  Int               @default(0) @map(\"sort_order\")\n  status     DestinationStatus @default(DRAFT)\n  isFeatured Boolean           @default(false) @map(\"is_featured\")\n\n  createdAt   DateTime  @default(now()) @map(\"created_at\")\n  updatedAt   DateTime  @updatedAt @map(\"updated_at\")\n  publishedAt DateTime? @map(\"published_at\")\n\n  translations DestinationTranslation[]\n  categories   DestinationCategory[]\n  hotels       Hotel[]\n  guides       Guide[]\n  ferryRoutes  FerryRoute[]\n  flightRoutes FlightRoute[]\n  packageLinks PackageDestination[]\n\n  @@index([parentId])\n  @@index([level, status])\n  @@index([parentId, sortOrder, name])\n  @@map(\"destinations\")\n}\n\n// DestinationTranslation — multilingual support, off the hot path.\n// Built once now so we never have to retrofit per-locale slugs later.\n// Loaded ONLY when the request locale ≠ default. English never touches it.\nmodel DestinationTranslation {\n  destinationId BigInt\n  destination   Destination @relation(fields: [destinationId], references: [id], onDelete: Cascade)\n  locale        String\n\n  name            String\n  slug            String\n  metaTitle       String? @map(\"meta_title\")\n  metaDescription String? @map(\"meta_description\")\n  seoContent      String? @map(\"seo_content\")\n\n  @@id([destinationId, locale])\n  @@unique([locale, slug])\n  @@map(\"destination_translations\")\n}\n\n// ─── DestinationCategory — content slice bound to a Destination ─────────────\n//\n// A Category is a content collection of a Destination — the third URL\n// segment in /[country]/[destination]/[category]. Examples: \"honeymoon-\n// packages\", \"scuba-diving\", \"luxury-hotels\", \"ferry-booking\". The same\n// slug legitimately repeats across destinations because each pairing is a\n// distinct landing page with its own copy, SEO, and product set.\n// Uniqueness is therefore (destination_id, slug), not slug alone.\n//\n// WHY A SEPARATE TABLE INSTEAD OF SUB_DESTINATION ROWS?\n// Categories are content categories, not geography. Folding them into the\n// Destination tree would corrupt the hierarchy invariants (\"honeymoon-\n// packages\" is not spatially \"below\" Andaman), break the multilingual\n// path scheme, and inflate the materialised slug_path with non-geographic\n// segments. Keeping them separate lets product domains (packages, hotels,\n// activities) optionally FK directly to a category when relevant —\n// without polluting the geographic Destination model.\nmodel DestinationCategory {\n  id BigInt @id @default(autoincrement())\n\n  destinationId BigInt      @map(\"destination_id\")\n  destination   Destination @relation(fields: [destinationId], references: [id], onDelete: Cascade)\n\n  name String\n  slug String\n\n  description     String?\n  metaTitle       String? @map(\"meta_title\")\n  metaDescription String? @map(\"meta_description\")\n  seoContent      String? @map(\"seo_content\")\n  heroImageUrl    String? @map(\"hero_image_url\")\n\n  sortOrder  Int               @default(0) @map(\"sort_order\")\n  status     DestinationStatus @default(DRAFT)\n  isFeatured Boolean           @default(false) @map(\"is_featured\")\n\n  createdAt   DateTime  @default(now()) @map(\"created_at\")\n  updatedAt   DateTime  @updatedAt @map(\"updated_at\")\n  publishedAt DateTime? @map(\"published_at\")\n\n  packageLinks PackageCategory[]\n\n  @@unique([destinationId, slug])\n  @@index([destinationId, status, sortOrder])\n  @@map(\"destination_categories\")\n}\n\n// ═══════════════════════════════════════════════════════════════════════════\n//   CONTENT DOMAINS — hung off the destination tree\n// ═══════════════════════════════════════════════════════════════════════════\n//\n// Every model below FKs into `destinations.id`. The destination is the\n// canonical place a piece of content lives in. Many-to-many cases\n// (Package ⇄ Destination, Package ⇄ Hotel, Package ⇄ Category) use\n// explicit join tables so we can carry metadata on the relationship\n// (e.g. nights, isPrimary, sortOrder) without invasive schema changes.\n//\n// NORMALISATION\n// -------------\n//  • Destinations own the URL / SEO root.\n//  • Hotels, Guides, FerryRoutes, FlightRoutes are *singular* in their\n//    destination (1:N), so they live on a single FK column.\n//  • Packages are *plural* by definition — a multi-island itinerary\n//    spans destinations and stitches multiple hotels together. Hence\n//    the explicit junction tables.\n//\n// INDEX STRATEGY\n// --------------\n//  • (destination_id, status) for \"list published X under destination Y\"\n//    — the hottest query on every detail page.\n//  • Slug column is globally unique per domain (hotel slug, package slug,\n//    guide slug) so deep links don't need a destination prefix. Two\n//    hotels with the same slug under different destinations are not\n//    allowed; if that comes up, prefix with the destination slug at\n//    write time (e.g. \"andaman-taj-exotica\").\n\n// ─── Hotel ─────────────────────────────────────────────────────────────────\n// One destination, many hotels. M2M to packages via package_hotels.\nmodel Hotel {\n  id BigInt @id @default(autoincrement())\n\n  destinationId BigInt      @map(\"destination_id\")\n  destination   Destination @relation(fields: [destinationId], references: [id], onDelete: Restrict)\n\n  name String\n  slug String @unique\n\n  starRating       Int?     @map(\"star_rating\")\n  shortDescription String?  @map(\"short_description\")\n  heroImageUrl     String?  @map(\"hero_image_url\")\n  gallery          String[] @default([])\n\n  metaTitle       String? @map(\"meta_title\")\n  metaDescription String? @map(\"meta_description\")\n  seoContent      String? @map(\"seo_content\")\n\n  status     DestinationStatus @default(DRAFT)\n  isFeatured Boolean           @default(false) @map(\"is_featured\")\n  sortOrder  Int               @default(0) @map(\"sort_order\")\n\n  createdAt   DateTime  @default(now()) @map(\"created_at\")\n  updatedAt   DateTime  @updatedAt @map(\"updated_at\")\n  publishedAt DateTime? @map(\"published_at\")\n\n  packageLinks PackageHotel[]\n\n  @@index([destinationId, status, sortOrder])\n  @@map(\"hotels\")\n}\n\n// ─── Package — multi-destination itinerary ─────────────────────────────────\n// M2M to Destination (multi-island), Hotel (stitched stays), Category\n// (landing page taxonomy). Each junction carries trip-shape metadata.\nmodel Package {\n  id BigInt @id @default(autoincrement())\n\n  title String\n  slug  String @unique\n\n  shortDescription String? @map(\"short_description\")\n  durationDays     Int?    @map(\"duration_days\")\n  durationNights   Int?    @map(\"duration_nights\")\n  startingPrice    Int?    @map(\"starting_price\") // currency-minor units, but we use whole INR for now\n  currency         String  @default(\"INR\")\n\n  heroImageUrl String?  @map(\"hero_image_url\")\n  gallery      String[] @default([])\n\n  metaTitle       String? @map(\"meta_title\")\n  metaDescription String? @map(\"meta_description\")\n  seoContent      String? @map(\"seo_content\")\n\n  status     DestinationStatus @default(DRAFT)\n  isFeatured Boolean           @default(false) @map(\"is_featured\")\n  sortOrder  Int               @default(0) @map(\"sort_order\")\n\n  createdAt   DateTime  @default(now()) @map(\"created_at\")\n  updatedAt   DateTime  @updatedAt @map(\"updated_at\")\n  publishedAt DateTime? @map(\"published_at\")\n\n  destinations PackageDestination[]\n  hotels       PackageHotel[]\n  categories   PackageCategory[]\n\n  @@index([status, isFeatured, sortOrder])\n  @@map(\"packages\")\n}\n\n// ─── PackageDestination — M2M join carrying trip-shape metadata ────────────\n// `isPrimary` = \"the marquee destination for this package\", used when we\n// have to pick a single representative (canonical URL, breadcrumb anchor).\nmodel PackageDestination {\n  packageId     BigInt @map(\"package_id\")\n  destinationId BigInt @map(\"destination_id\")\n\n  isPrimary Boolean @default(false) @map(\"is_primary\")\n  sortOrder Int     @default(0) @map(\"sort_order\")\n  nights    Int?\n\n  package     Package     @relation(fields: [packageId], references: [id], onDelete: Cascade)\n  destination Destination @relation(fields: [destinationId], references: [id], onDelete: Cascade)\n\n  @@id([packageId, destinationId])\n  @@index([destinationId])\n  @@map(\"package_destinations\")\n}\n\n// ─── PackageHotel — M2M join, carries number of nights at this hotel ───────\nmodel PackageHotel {\n  packageId BigInt @map(\"package_id\")\n  hotelId   BigInt @map(\"hotel_id\")\n\n  nights    Int?\n  sortOrder Int  @default(0) @map(\"sort_order\")\n\n  package Package @relation(fields: [packageId], references: [id], onDelete: Cascade)\n  hotel   Hotel   @relation(fields: [hotelId], references: [id], onDelete: Cascade)\n\n  @@id([packageId, hotelId])\n  @@index([hotelId])\n  @@map(\"package_hotels\")\n}\n\n// ─── PackageCategory — M2M tying packages to category landing pages ────────\n// Category rows are per-destination (DestinationCategory). A package\n// \"Romantic Andaman Escape\" attaches to (andaman, honeymoon-packages)\n// AND to (andaman, ferry-booking) if it spans both stories. Adding a row\n// here is what makes a package appear on a category landing page —\n// no implicit tagging, no text-matching.\nmodel PackageCategory {\n  packageId  BigInt @map(\"package_id\")\n  categoryId BigInt @map(\"category_id\")\n\n  sortOrder Int @default(0) @map(\"sort_order\")\n\n  package  Package             @relation(fields: [packageId], references: [id], onDelete: Cascade)\n  category DestinationCategory @relation(fields: [categoryId], references: [id], onDelete: Cascade)\n\n  @@id([packageId, categoryId])\n  @@index([categoryId])\n  @@map(\"package_categories\")\n}\n\n// ─── Guide — long-form editorial bound to a destination ────────────────────\nmodel Guide {\n  id BigInt @id @default(autoincrement())\n\n  destinationId BigInt      @map(\"destination_id\")\n  destination   Destination @relation(fields: [destinationId], references: [id], onDelete: Restrict)\n\n  title String\n  slug  String @unique\n\n  excerpt        String?\n  body           String?\n  readingMinutes Int?    @map(\"reading_minutes\")\n  heroImageUrl   String? @map(\"hero_image_url\")\n\n  metaTitle       String? @map(\"meta_title\")\n  metaDescription String? @map(\"meta_description\")\n\n  status     DestinationStatus @default(DRAFT)\n  isFeatured Boolean           @default(false) @map(\"is_featured\")\n  sortOrder  Int               @default(0) @map(\"sort_order\")\n\n  createdAt   DateTime  @default(now()) @map(\"created_at\")\n  updatedAt   DateTime  @updatedAt @map(\"updated_at\")\n  publishedAt DateTime? @map(\"published_at\")\n\n  @@index([destinationId, status, sortOrder])\n  @@map(\"guides\")\n}\n\n// ─── FerryRoute — operator + leg pair, tied to its serving destination ────\n// \"Port Blair ⇄ Havelock (MakRuzz)\" attaches to Andaman as a whole; the\n// origin/destination port names are stored as text because they're not\n// destinations themselves (sub-locations live in the geo tree if we add\n// SUB_DESTINATION rows later).\nmodel FerryRoute {\n  id BigInt @id @default(autoincrement())\n\n  destinationId BigInt      @map(\"destination_id\")\n  destination   Destination @relation(fields: [destinationId], references: [id], onDelete: Restrict)\n\n  name String\n  slug String @unique\n\n  originName      String  @map(\"origin_name\")\n  destinationName String  @map(\"destination_name\")\n  operatorName    String? @map(\"operator_name\")\n\n  durationMinutes Int?   @map(\"duration_minutes\")\n  startingPrice   Int?   @map(\"starting_price\")\n  currency        String @default(\"INR\")\n\n  metaTitle       String? @map(\"meta_title\")\n  metaDescription String? @map(\"meta_description\")\n\n  status     DestinationStatus @default(DRAFT)\n  isFeatured Boolean           @default(false) @map(\"is_featured\")\n  sortOrder  Int               @default(0) @map(\"sort_order\")\n\n  createdAt DateTime @default(now()) @map(\"created_at\")\n  updatedAt DateTime @updatedAt @map(\"updated_at\")\n\n  @@index([destinationId, status, sortOrder])\n  @@map(\"ferry_routes\")\n}\n\n// ─── FlightRoute — city pair connecting users to a destination ─────────────\n// \"Delhi → Port Blair\" attaches to Andaman. Pricing is starting-from\n// for SEO copy; live fare lookup runs through the Tripjack adapter in\n// apps/api and is not stored here.\nmodel FlightRoute {\n  id BigInt @id @default(autoincrement())\n\n  destinationId BigInt      @map(\"destination_id\")\n  destination   Destination @relation(fields: [destinationId], references: [id], onDelete: Restrict)\n\n  name String\n  slug String @unique\n\n  originIATA String @map(\"origin_iata\")\n  destIATA   String @map(\"dest_iata\")\n  originCity String @map(\"origin_city\")\n  destCity   String @map(\"dest_city\")\n\n  approxDurationMinutes Int?   @map(\"approx_duration_minutes\")\n  startingPrice         Int?   @map(\"starting_price\")\n  currency              String @default(\"INR\")\n\n  metaTitle       String? @map(\"meta_title\")\n  metaDescription String? @map(\"meta_description\")\n\n  status     DestinationStatus @default(DRAFT)\n  isFeatured Boolean           @default(false) @map(\"is_featured\")\n  sortOrder  Int               @default(0) @map(\"sort_order\")\n\n  createdAt DateTime @default(now()) @map(\"created_at\")\n  updatedAt DateTime @updatedAt @map(\"updated_at\")\n\n  @@index([destinationId, status, sortOrder])\n  @@index([originIATA, destIATA])\n  @@map(\"flight_routes\")\n}\n\n// ═══════════════════════════════════════════════════════════════════════════\n//   SLUG & SEO ENGINE\n// ═══════════════════════════════════════════════════════════════════════════\n//\n// Two tables, one job: keep SEO authority alive when URLs change.\n//\n//  SlugHistory  — every slug rename on a sluggable entity writes a row\n//                 here. We never lose the trail of what a URL used to be.\n//\n//  Redirect    — the runtime lookup table the catch-all consults before\n//                 resolving a hierarchy path. Auto-populated by the slug\n//                 history recorder + manually populated by the admin (for\n//                 campaign URLs, vanity redirects, etc.).\n//\n// POLYMORPHIC, BY DESIGN\n// ----------------------\n// Both tables identify the affected row by (entityType, entityId), not by\n// a hard FK. The trade-off:\n//\n//   + new entity types (activities, vendor pages, itineraries) plug in\n//     without a schema migration — just extend the enum\n//   + one table to query when the admin asks \"show me every slug change\n//     that ever happened to anything\"\n//   − cascade-delete must be enforced at the application layer\n//\n// For slug/redirect history that's correct: even after an entity is\n// deleted, you want the old URL to keep redirecting somewhere sensible\n// (the parent destination, the homepage, etc.).\n//\n// LOCALE-AWARE\n// ------------\n// Every row carries a `locale`. Today only \"en\" exists; when /fr/, /de/\n// surfaces ship we already have the column. No \"v2\" of the table later.\n\nenum SluggableEntity {\n  DESTINATION\n  DESTINATION_CATEGORY\n  HOTEL\n  PACKAGE\n  GUIDE\n  FERRY_ROUTE\n  FLIGHT_ROUTE\n}\n\n// ─── SlugHistory — append-only audit log of slug renames ───────────────────\n// Written ATOMICALLY with the entity update inside `recordSlugChange()`.\n// We deliberately do not store the \"current\" slug here — that lives on\n// the entity itself. This table answers \"what was it called before?\",\n// not \"what is it called now?\".\nmodel SlugHistory {\n  id BigInt @id @default(autoincrement())\n\n  entityType SluggableEntity @map(\"entity_type\")\n  entityId   BigInt          @map(\"entity_id\")\n  locale     String          @default(\"en\")\n\n  oldSlug     String @map(\"old_slug\")\n  oldFullPath String @map(\"old_full_path\")\n  newFullPath String @map(\"new_full_path\")\n\n  changedAt     DateTime @default(now()) @map(\"changed_at\")\n  changedByUser String?  @map(\"changed_by_user\")\n  reason        String?\n\n  @@index([entityType, entityId])\n  @@index([oldFullPath])\n  @@map(\"slug_history\")\n}\n\n// ─── Redirect — runtime 301/302 lookup ─────────────────────────────────────\n// `fromPath` is unique because two redirects from the same source would be\n// ambiguous. `isActive` lets ops disable a redirect without deleting the\n// row (so we can re-enable if a marketing team complains the campaign URL\n// went dead).\nmodel Redirect {\n  id BigInt @id @default(autoincrement())\n\n  fromPath   String  @unique @map(\"from_path\")\n  toPath     String  @map(\"to_path\")\n  statusCode Int     @default(301) @map(\"status_code\")\n  locale     String? // null = applies regardless of locale\n\n  // What created this row. Useful for \"show me every auto-redirect\" vs\n  // \"show me every manual redirect\" in the admin.\n  source RedirectSource @default(MANUAL)\n  reason String?\n\n  isActive  Boolean  @default(true) @map(\"is_active\")\n  createdAt DateTime @default(now()) @map(\"created_at\")\n  updatedAt DateTime @updatedAt @map(\"updated_at\")\n\n  @@index([fromPath, isActive])\n  @@map(\"redirects\")\n}\n\nenum RedirectSource {\n  MANUAL // created by an admin via the UI\n  SLUG_HISTORY // auto-created by the slug-change recorder\n  IMPORT // bulk-imported from a legacy CSV\n}\n",
  "inlineSchemaHash": "dd2832cc091eff28b872b9d07bb741c635d59803468f252106abcfdce41f61d3",
  "copyEngine": true
}

const fs = require('fs')

config.dirname = __dirname
if (!fs.existsSync(path.join(__dirname, 'schema.prisma'))) {
  const alternativePaths = [
    "lib/hierarchy/generated",
    "hierarchy/generated",
  ]
  
  const alternativePath = alternativePaths.find((altPath) => {
    return fs.existsSync(path.join(process.cwd(), altPath, 'schema.prisma'))
  }) ?? alternativePaths[0]

  config.dirname = path.join(process.cwd(), alternativePath)
  config.isBundled = true
}

config.runtimeDataModel = JSON.parse("{\"models\":{\"Destination\":{\"dbName\":\"destinations\",\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"BigInt\",\"default\":{\"name\":\"autoincrement\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"parentId\",\"dbName\":\"parent_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"BigInt\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"parent\",\"kind\":\"object\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Destination\",\"relationName\":\"DestinationTree\",\"relationFromFields\":[\"parentId\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"Restrict\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"children\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Destination\",\"relationName\":\"DestinationTree\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"name\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"slug\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"slugPath\",\"dbName\":\"slug_path\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":true,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"level\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DestinationLevel\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"depth\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"metaTitle\",\"dbName\":\"meta_title\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"metaDescription\",\"dbName\":\"meta_description\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"seoContent\",\"dbName\":\"seo_content\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"imageUrl\",\"dbName\":\"image_url\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"heroImageUrl\",\"dbName\":\"hero_image_url\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"gallery\",\"kind\":\"scalar\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"sortOrder\",\"dbName\":\"sort_order\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"status\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DestinationStatus\",\"default\":\"DRAFT\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"isFeatured\",\"dbName\":\"is_featured\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":false,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"createdAt\",\"dbName\":\"created_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"updatedAt\",\"dbName\":\"updated_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":true},{\"name\":\"publishedAt\",\"dbName\":\"published_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"translations\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DestinationTranslation\",\"relationName\":\"DestinationToDestinationTranslation\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"categories\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DestinationCategory\",\"relationName\":\"DestinationToDestinationCategory\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"hotels\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Hotel\",\"relationName\":\"DestinationToHotel\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"guides\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Guide\",\"relationName\":\"DestinationToGuide\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"ferryRoutes\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"FerryRoute\",\"relationName\":\"DestinationToFerryRoute\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"flightRoutes\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"FlightRoute\",\"relationName\":\"DestinationToFlightRoute\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"packageLinks\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"PackageDestination\",\"relationName\":\"DestinationToPackageDestination\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"DestinationTranslation\":{\"dbName\":\"destination_translations\",\"fields\":[{\"name\":\"destinationId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"BigInt\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"destination\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Destination\",\"relationName\":\"DestinationToDestinationTranslation\",\"relationFromFields\":[\"destinationId\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"locale\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"name\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"slug\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"metaTitle\",\"dbName\":\"meta_title\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"metaDescription\",\"dbName\":\"meta_description\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"seoContent\",\"dbName\":\"seo_content\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":{\"name\":null,\"fields\":[\"destinationId\",\"locale\"]},\"uniqueFields\":[[\"locale\",\"slug\"]],\"uniqueIndexes\":[{\"name\":null,\"fields\":[\"locale\",\"slug\"]}],\"isGenerated\":false},\"DestinationCategory\":{\"dbName\":\"destination_categories\",\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"BigInt\",\"default\":{\"name\":\"autoincrement\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"destinationId\",\"dbName\":\"destination_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"BigInt\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"destination\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Destination\",\"relationName\":\"DestinationToDestinationCategory\",\"relationFromFields\":[\"destinationId\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"name\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"slug\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"description\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"metaTitle\",\"dbName\":\"meta_title\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"metaDescription\",\"dbName\":\"meta_description\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"seoContent\",\"dbName\":\"seo_content\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"heroImageUrl\",\"dbName\":\"hero_image_url\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"sortOrder\",\"dbName\":\"sort_order\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"status\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DestinationStatus\",\"default\":\"DRAFT\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"isFeatured\",\"dbName\":\"is_featured\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":false,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"createdAt\",\"dbName\":\"created_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"updatedAt\",\"dbName\":\"updated_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":true},{\"name\":\"publishedAt\",\"dbName\":\"published_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"packageLinks\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"PackageCategory\",\"relationName\":\"DestinationCategoryToPackageCategory\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[[\"destinationId\",\"slug\"]],\"uniqueIndexes\":[{\"name\":null,\"fields\":[\"destinationId\",\"slug\"]}],\"isGenerated\":false},\"Hotel\":{\"dbName\":\"hotels\",\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"BigInt\",\"default\":{\"name\":\"autoincrement\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"destinationId\",\"dbName\":\"destination_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"BigInt\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"destination\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Destination\",\"relationName\":\"DestinationToHotel\",\"relationFromFields\":[\"destinationId\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"Restrict\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"name\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"slug\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":true,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"starRating\",\"dbName\":\"star_rating\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"shortDescription\",\"dbName\":\"short_description\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"heroImageUrl\",\"dbName\":\"hero_image_url\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"gallery\",\"kind\":\"scalar\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"metaTitle\",\"dbName\":\"meta_title\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"metaDescription\",\"dbName\":\"meta_description\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"seoContent\",\"dbName\":\"seo_content\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"status\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DestinationStatus\",\"default\":\"DRAFT\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"isFeatured\",\"dbName\":\"is_featured\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":false,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"sortOrder\",\"dbName\":\"sort_order\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"createdAt\",\"dbName\":\"created_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"updatedAt\",\"dbName\":\"updated_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":true},{\"name\":\"publishedAt\",\"dbName\":\"published_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"packageLinks\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"PackageHotel\",\"relationName\":\"HotelToPackageHotel\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"Package\":{\"dbName\":\"packages\",\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"BigInt\",\"default\":{\"name\":\"autoincrement\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"title\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"slug\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":true,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"shortDescription\",\"dbName\":\"short_description\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"durationDays\",\"dbName\":\"duration_days\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"durationNights\",\"dbName\":\"duration_nights\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"startingPrice\",\"dbName\":\"starting_price\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"currency\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":\"INR\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"heroImageUrl\",\"dbName\":\"hero_image_url\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"gallery\",\"kind\":\"scalar\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"metaTitle\",\"dbName\":\"meta_title\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"metaDescription\",\"dbName\":\"meta_description\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"seoContent\",\"dbName\":\"seo_content\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"status\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DestinationStatus\",\"default\":\"DRAFT\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"isFeatured\",\"dbName\":\"is_featured\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":false,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"sortOrder\",\"dbName\":\"sort_order\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"createdAt\",\"dbName\":\"created_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"updatedAt\",\"dbName\":\"updated_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":true},{\"name\":\"publishedAt\",\"dbName\":\"published_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"destinations\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"PackageDestination\",\"relationName\":\"PackageToPackageDestination\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"hotels\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"PackageHotel\",\"relationName\":\"PackageToPackageHotel\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"categories\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"PackageCategory\",\"relationName\":\"PackageToPackageCategory\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"PackageDestination\":{\"dbName\":\"package_destinations\",\"fields\":[{\"name\":\"packageId\",\"dbName\":\"package_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"BigInt\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"destinationId\",\"dbName\":\"destination_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"BigInt\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"isPrimary\",\"dbName\":\"is_primary\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":false,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"sortOrder\",\"dbName\":\"sort_order\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"nights\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"package\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Package\",\"relationName\":\"PackageToPackageDestination\",\"relationFromFields\":[\"packageId\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"destination\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Destination\",\"relationName\":\"DestinationToPackageDestination\",\"relationFromFields\":[\"destinationId\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":{\"name\":null,\"fields\":[\"packageId\",\"destinationId\"]},\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"PackageHotel\":{\"dbName\":\"package_hotels\",\"fields\":[{\"name\":\"packageId\",\"dbName\":\"package_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"BigInt\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"hotelId\",\"dbName\":\"hotel_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"BigInt\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"nights\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"sortOrder\",\"dbName\":\"sort_order\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"package\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Package\",\"relationName\":\"PackageToPackageHotel\",\"relationFromFields\":[\"packageId\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"hotel\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Hotel\",\"relationName\":\"HotelToPackageHotel\",\"relationFromFields\":[\"hotelId\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":{\"name\":null,\"fields\":[\"packageId\",\"hotelId\"]},\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"PackageCategory\":{\"dbName\":\"package_categories\",\"fields\":[{\"name\":\"packageId\",\"dbName\":\"package_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"BigInt\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"categoryId\",\"dbName\":\"category_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"BigInt\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"sortOrder\",\"dbName\":\"sort_order\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"package\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Package\",\"relationName\":\"PackageToPackageCategory\",\"relationFromFields\":[\"packageId\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"category\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DestinationCategory\",\"relationName\":\"DestinationCategoryToPackageCategory\",\"relationFromFields\":[\"categoryId\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":{\"name\":null,\"fields\":[\"packageId\",\"categoryId\"]},\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"Guide\":{\"dbName\":\"guides\",\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"BigInt\",\"default\":{\"name\":\"autoincrement\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"destinationId\",\"dbName\":\"destination_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"BigInt\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"destination\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Destination\",\"relationName\":\"DestinationToGuide\",\"relationFromFields\":[\"destinationId\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"Restrict\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"title\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"slug\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":true,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"excerpt\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"body\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"readingMinutes\",\"dbName\":\"reading_minutes\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"heroImageUrl\",\"dbName\":\"hero_image_url\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"metaTitle\",\"dbName\":\"meta_title\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"metaDescription\",\"dbName\":\"meta_description\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"status\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DestinationStatus\",\"default\":\"DRAFT\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"isFeatured\",\"dbName\":\"is_featured\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":false,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"sortOrder\",\"dbName\":\"sort_order\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"createdAt\",\"dbName\":\"created_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"updatedAt\",\"dbName\":\"updated_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":true},{\"name\":\"publishedAt\",\"dbName\":\"published_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"FerryRoute\":{\"dbName\":\"ferry_routes\",\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"BigInt\",\"default\":{\"name\":\"autoincrement\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"destinationId\",\"dbName\":\"destination_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"BigInt\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"destination\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Destination\",\"relationName\":\"DestinationToFerryRoute\",\"relationFromFields\":[\"destinationId\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"Restrict\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"name\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"slug\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":true,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"originName\",\"dbName\":\"origin_name\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"destinationName\",\"dbName\":\"destination_name\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"operatorName\",\"dbName\":\"operator_name\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"durationMinutes\",\"dbName\":\"duration_minutes\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"startingPrice\",\"dbName\":\"starting_price\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"currency\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":\"INR\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"metaTitle\",\"dbName\":\"meta_title\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"metaDescription\",\"dbName\":\"meta_description\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"status\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DestinationStatus\",\"default\":\"DRAFT\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"isFeatured\",\"dbName\":\"is_featured\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":false,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"sortOrder\",\"dbName\":\"sort_order\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"createdAt\",\"dbName\":\"created_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"updatedAt\",\"dbName\":\"updated_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":true}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"FlightRoute\":{\"dbName\":\"flight_routes\",\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"BigInt\",\"default\":{\"name\":\"autoincrement\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"destinationId\",\"dbName\":\"destination_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"BigInt\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"destination\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Destination\",\"relationName\":\"DestinationToFlightRoute\",\"relationFromFields\":[\"destinationId\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"Restrict\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"name\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"slug\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":true,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"originIATA\",\"dbName\":\"origin_iata\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"destIATA\",\"dbName\":\"dest_iata\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"originCity\",\"dbName\":\"origin_city\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"destCity\",\"dbName\":\"dest_city\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"approxDurationMinutes\",\"dbName\":\"approx_duration_minutes\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"startingPrice\",\"dbName\":\"starting_price\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"currency\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":\"INR\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"metaTitle\",\"dbName\":\"meta_title\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"metaDescription\",\"dbName\":\"meta_description\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"status\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DestinationStatus\",\"default\":\"DRAFT\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"isFeatured\",\"dbName\":\"is_featured\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":false,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"sortOrder\",\"dbName\":\"sort_order\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"createdAt\",\"dbName\":\"created_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"updatedAt\",\"dbName\":\"updated_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":true}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"SlugHistory\":{\"dbName\":\"slug_history\",\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"BigInt\",\"default\":{\"name\":\"autoincrement\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"entityType\",\"dbName\":\"entity_type\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"SluggableEntity\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"entityId\",\"dbName\":\"entity_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"BigInt\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"locale\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":\"en\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"oldSlug\",\"dbName\":\"old_slug\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"oldFullPath\",\"dbName\":\"old_full_path\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"newFullPath\",\"dbName\":\"new_full_path\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"changedAt\",\"dbName\":\"changed_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"changedByUser\",\"dbName\":\"changed_by_user\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"reason\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"Redirect\":{\"dbName\":\"redirects\",\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"BigInt\",\"default\":{\"name\":\"autoincrement\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"fromPath\",\"dbName\":\"from_path\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":true,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"toPath\",\"dbName\":\"to_path\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"statusCode\",\"dbName\":\"status_code\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":301,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"locale\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"source\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"RedirectSource\",\"default\":\"MANUAL\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"reason\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"isActive\",\"dbName\":\"is_active\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":true,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"createdAt\",\"dbName\":\"created_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"updatedAt\",\"dbName\":\"updated_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":true}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false}},\"enums\":{\"DestinationLevel\":{\"values\":[{\"name\":\"REGION\",\"dbName\":null},{\"name\":\"COUNTRY\",\"dbName\":null},{\"name\":\"DESTINATION\",\"dbName\":null},{\"name\":\"SUB_DESTINATION\",\"dbName\":null}],\"dbName\":null},\"DestinationStatus\":{\"values\":[{\"name\":\"DRAFT\",\"dbName\":null},{\"name\":\"PUBLISHED\",\"dbName\":null},{\"name\":\"ARCHIVED\",\"dbName\":null}],\"dbName\":null},\"SluggableEntity\":{\"values\":[{\"name\":\"DESTINATION\",\"dbName\":null},{\"name\":\"DESTINATION_CATEGORY\",\"dbName\":null},{\"name\":\"HOTEL\",\"dbName\":null},{\"name\":\"PACKAGE\",\"dbName\":null},{\"name\":\"GUIDE\",\"dbName\":null},{\"name\":\"FERRY_ROUTE\",\"dbName\":null},{\"name\":\"FLIGHT_ROUTE\",\"dbName\":null}],\"dbName\":null},\"RedirectSource\":{\"values\":[{\"name\":\"MANUAL\",\"dbName\":null},{\"name\":\"SLUG_HISTORY\",\"dbName\":null},{\"name\":\"IMPORT\",\"dbName\":null}],\"dbName\":null}},\"types\":{}}")
defineDmmfProperty(exports.Prisma, config.runtimeDataModel)
config.engineWasm = undefined


const { warnEnvConflicts } = require('./runtime/library.js')

warnEnvConflicts({
    rootEnvPath: config.relativeEnvPaths.rootEnvPath && path.resolve(config.dirname, config.relativeEnvPaths.rootEnvPath),
    schemaEnvPath: config.relativeEnvPaths.schemaEnvPath && path.resolve(config.dirname, config.relativeEnvPaths.schemaEnvPath)
})

const PrismaClient = getPrismaClient(config)
exports.PrismaClient = PrismaClient
Object.assign(exports, Prisma)

// file annotations for bundling tools to include these files
path.join(__dirname, "libquery_engine-darwin-arm64.dylib.node");
path.join(process.cwd(), "lib/hierarchy/generated/libquery_engine-darwin-arm64.dylib.node")

// file annotations for bundling tools to include these files
path.join(__dirname, "libquery_engine-rhel-openssl-3.0.x.so.node");
path.join(process.cwd(), "lib/hierarchy/generated/libquery_engine-rhel-openssl-3.0.x.so.node")
// file annotations for bundling tools to include these files
path.join(__dirname, "schema.prisma");
path.join(process.cwd(), "lib/hierarchy/generated/schema.prisma")
