-- Add marketing flags for package cards (staff pick, flights included)
ALTER TABLE "packages" ADD COLUMN "isStaffPick" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "packages" ADD COLUMN "flightsIncluded" BOOLEAN NOT NULL DEFAULT false;
