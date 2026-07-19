-- PROD-002A: column drift repair, scoped to exactly the three items approved
-- after the PROD-002 investigation. schema.prisma is unchanged for all
-- three — it already declared these correctly; the database was behind.
--
-- 1 & 2. Enquiry.hotelSlug / Enquiry.activitySlug exist in schema.prisma
--    but were never migrated (confirmed causing a live 500 on
--    GET /api/marketing/forms, and a write-path risk on enquiry intake).
--
-- 3. Destination.countryId is declared optional (String?) in
--    schema.prisma; the database has enforced NOT NULL since the very
--    first migration. Architectural review confirmed the database is the
--    side that's wrong here: ensure-market-roots.ts deliberately creates
--    market-root destinations with countryId: null, and this has been
--    observed failing live (Postgres 23502) on every fresh/empty
--    destinations table. No other table is touched.

-- AlterTable
ALTER TABLE "enquiries" ADD COLUMN "hotelSlug" TEXT;

-- AlterTable
ALTER TABLE "enquiries" ADD COLUMN "activitySlug" TEXT;

-- AlterTable
ALTER TABLE "destinations" ALTER COLUMN "countryId" DROP NOT NULL;
