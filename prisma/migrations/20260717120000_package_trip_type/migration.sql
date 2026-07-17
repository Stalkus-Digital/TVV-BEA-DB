-- AlterTable: add package fields that exist in schema but were never migrated
ALTER TABLE "packages" ADD COLUMN IF NOT EXISTS "tripType" TEXT;
ALTER TABLE "packages" ADD COLUMN IF NOT EXISTS "durationText" TEXT;
ALTER TABLE "packages" ADD COLUMN IF NOT EXISTS "content" JSONB;

-- CreateIndex
CREATE INDEX IF NOT EXISTS "packages_tripType_idx" ON "packages"("tripType");
