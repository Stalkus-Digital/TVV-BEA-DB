import { prisma } from "@/shared/database/prisma-client";
import { createLogger } from "@/shared/logger";
import { DestinationStatus } from "../types/destination";
import { MARKET_ROOT_DEFINITIONS } from "../constants/market-roots";

const logger = createLogger("destination.bootstrap");

let ensured = false;

/**
 * Idempotent — creates Andaman / Domestic / International root destinations
 * if they do not exist. Safe to call on every module load.
 */
export async function ensureDestinationMarketRoots(): Promise<void> {
  if (ensured) return;

  const now = new Date();
  for (const root of MARKET_ROOT_DEFINITIONS) {
    const existing = await prisma.destination.findUnique({ where: { slug: root.slug } });
    if (existing) continue;

    await prisma.destination.create({
      data: {
        name: root.name,
        slug: root.slug,
        countryId: null,
        stateId: null,
        cityId: null,
        regionId: null,
        parentDestinationId: null,
        categoryIds: [],
        description: root.description,
        isFeatured: true,
        latitude: null,
        longitude: null,
        seo: {
          metaTitle: `${root.name} — The Vacation Voice`,
          metaDescription: root.description,
        },
        gallery: [],
        faqs: [],
        guideReferenceIds: [],
        status: DestinationStatus.ACTIVE,
        createdAt: now,
        updatedAt: now,
      },
    });
    logger.info("Seeded market root destination", { slug: root.slug });
  }

  ensured = true;
}
