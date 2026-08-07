import { BaseService, type ServiceContext } from "@/shared/services";
import { ok, err, type Result } from "@/shared/types";
import { InternalError, NotFoundError, ConflictError, type AppError } from "@/shared/errors";
import { prisma } from "@/shared/database/prisma-client";
import { randomUUID } from "crypto";

export interface LandingPageDto {
  title: string;
  slug: string;
  status?: string;
  heroImage?: string;
  heroHeadline?: string;
  heroSubheadline?: string;
  locationBadge?: string;
  priceFrom?: number;
  whatsappNumber?: string;
  phoneNumber?: string;
  metaPixelId?: string;
  googleAdsTag?: string;
  googleAdsConversionId?: string;
  packageSlugs?: string[];
  activities?: { name: string }[];
  faqs?: { q: string; a: string }[];
  usps?: string[];
  testimonials?: any;
  seoTitle?: string;
  seoDescription?: string;
  campaignTag?: string;
  canonicalUrl?: string;
  advancedSchema?: any;
  mobileHeroImage?: string;
  videoUrl?: string;
  offerEndDate?: Date;
  remainingSlots?: number;
  discountPercentage?: number;
}

export class LandingPageService extends BaseService {
  constructor(context: ServiceContext) {
    super(context);
  }

  async getAll(): Promise<Result<any[], AppError>> {
    try {
      const pages = await prisma.landingPage.findMany({
        orderBy: { createdAt: "desc" },
      });
      return ok(pages);
    } catch {
      return err(new InternalError("Failed to fetch landing pages"));
    }
  }

  async getBySlug(slug: string): Promise<Result<any, AppError>> {
    try {
      const page = await prisma.landingPage.findUnique({ where: { slug } });
      if (!page) return err(new NotFoundError("Landing page not found"));
      return ok(page);
    } catch {
      return err(new InternalError("Failed to fetch landing page"));
    }
  }

  async getById(id: string): Promise<Result<any, AppError>> {
    try {
      const page = await prisma.landingPage.findUnique({ where: { id } });
      if (!page) return err(new NotFoundError("Landing page not found"));
      return ok(page);
    } catch {
      return err(new InternalError("Failed to fetch landing page"));
    }
  }

  async create(data: LandingPageDto): Promise<Result<any, AppError>> {
    try {
      // Enforce unique slug with a friendly error
      const existing = await prisma.landingPage.findUnique({ where: { slug: data.slug } });
      if (existing) {
        return err(new ConflictError(`Slug "/${data.slug}" is already in use. Choose a different slug.`));
      }
      const page = await prisma.landingPage.create({
        data: {
          id: randomUUID(),
          title: data.title,
          slug: data.slug,
          status: data.status ?? "DRAFT",
          heroImage: data.heroImage,
          heroHeadline: data.heroHeadline,
          heroSubheadline: data.heroSubheadline,
          locationBadge: data.locationBadge,
          priceFrom: data.priceFrom,
          whatsappNumber: data.whatsappNumber,
          phoneNumber: data.phoneNumber,
          metaPixelId: data.metaPixelId,
          googleAdsTag: data.googleAdsTag,
          googleAdsConversionId: data.googleAdsConversionId,
          packageSlugs: data.packageSlugs ?? [],
          activities: data.activities ?? [],
          faqs: data.faqs ?? [],
          usps: data.usps ?? [],
          testimonials: data.testimonials ?? [],
          seoTitle: data.seoTitle,
          seoDescription: data.seoDescription,
          campaignTag: data.campaignTag,
          canonicalUrl: data.canonicalUrl,
          advancedSchema: data.advancedSchema,
          mobileHeroImage: data.mobileHeroImage,
          videoUrl: data.videoUrl,
          offerEndDate: data.offerEndDate ? new Date(data.offerEndDate) : null,
          remainingSlots: data.remainingSlots ? Number(data.remainingSlots) : null,
          discountPercentage: data.discountPercentage ? Number(data.discountPercentage) : null,
        } as any,
      });
      return ok(page);
    } catch (e) {
      return err(new InternalError("Failed to create landing page"));
    }
  }

  async update(id: string, data: Partial<LandingPageDto>): Promise<Result<any, AppError>> {
    try {
      // If slug is being changed, check it doesn't conflict with another page
      if (data.slug) {
        const conflict = await prisma.landingPage.findFirst({
          where: { slug: data.slug, id: { not: id } },
        });
        if (conflict) {
          return err(new ConflictError(`Slug "/${data.slug}" is already used by another page.`));
        }
      }
      const page = await prisma.landingPage.update({
        where: { id },
        data: data as any,
      });
      return ok(page);
    } catch {
      return err(new InternalError("Failed to update landing page"));
    }
  }

  /** Duplicate an existing page — new slug gets a -copy suffix */
  async duplicate(id: string): Promise<Result<any, AppError>> {
    try {
      const original = await prisma.landingPage.findUnique({ where: { id } });
      if (!original) return err(new NotFoundError("Landing page not found"));

      const baseSlug = `${original.slug}-copy`;
      let slug = baseSlug;
      let attempt = 0;
      while (await prisma.landingPage.findUnique({ where: { slug } })) {
        attempt++;
        slug = `${baseSlug}-${attempt}`;
      }

      const { id: _id, createdAt: _c, updatedAt: _u, ...rest } = original as any;
      const copy = await prisma.landingPage.create({
        data: {
          ...rest,
          id: randomUUID(),
          slug,
          title: `${original.title} (Copy)`,
          status: "DRAFT", // copies always start as draft
        } as any,
      });
      return ok(copy);
    } catch {
      return err(new InternalError("Failed to duplicate landing page"));
    }
  }

  async delete(id: string): Promise<Result<void, AppError>> {
    try {
      await prisma.landingPage.delete({ where: { id } });
      return ok(undefined);
    } catch {
      return err(new InternalError("Failed to delete landing page"));
    }
  }
}
